import { getAdminSession } from '@/lib/admin';
import { AI_SYSTEM_PROMPT } from '@/lib/ai-prompt';

export const dynamic = 'force-dynamic';
// Vercel function lifetime cap — AI calls on free models can take a while.
export const maxDuration = 300;

const MAX_SOURCE_CHARS = 100000;
const DEFAULT_QUESTION_COUNT = 15;
const MAX_QUESTION_COUNT = 150;
const MAX_TOKENS = 32000;
const ATTEMPT_TIMEOUT_MS = 120000;
const TOTAL_DEADLINE_MS = 270000;
const RETRY_BACKOFF_MS = 3000;

// All :free models (no credits needed), ordered fast-first. Every one supports
// `response_format: json_object` so we always get strict JSON back.
const MODEL_CHAIN = [
  'baidu/ernie-5.5-flash-preview:free',
  'particle-ai/particle-1:free',
  'nvidia/nemotron-3.5-super-vl:free',
];

const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

interface AiQuestion {
  type?: string;
  category?: string;
  prompt?: string;
  answer?: string;
  choices?: string[];
}

function extractJson(text: string): unknown {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error('Model did not return valid JSON');
  }
}

function validate(raw: unknown): { questions: AiQuestion[] } {
  const obj = raw as { questions?: unknown };
  const list = Array.isArray(obj?.questions) ? obj.questions : [];
  if (list.length === 0) throw new Error('Model returned no questions');
  const questions: AiQuestion[] = [];
  for (const item of list) {
    const q = item as AiQuestion;
    if (typeof q.prompt !== 'string' || !q.prompt.trim()) continue;
    if (typeof q.answer !== 'string' || !q.answer.trim()) continue;
    const type = q.type === 'multiple_choice' ? 'multiple_choice' : 'fill_blank';
    const out: AiQuestion = {
      type,
      category:
        typeof q.category === 'string' && q.category.trim()
          ? q.category.trim()
          : 'General',
      prompt: q.prompt.trim(),
      answer: q.answer.trim(),
    };
    if (type === 'multiple_choice' && Array.isArray(q.choices)) {
      const choices = q.choices.filter(
        (c): c is string => typeof c === 'string' && c.trim().length > 0
      );
      if (choices.length >= 2) out.choices = choices;
      else continue;
    }
    questions.push(out);
  }
  if (questions.length === 0) throw new Error('Model returned no usable questions');
  return { questions };
}

/** Pulls a question count out of the teacher's instructions. Matches "56
 *  questions", "56 multiple choice questions", "56 MC questions", etc.
 *  Returns the raw number (may exceed the cap) or null when unspecified. */
function extractQuestionCount(userPrompt: string): number | null {
  const m = userPrompt.match(
    /\b(\d{1,3})\s*(?:multiple[\s-]?choice|mcq?|written|fill[\s-]?blank)?\s*questions?\b/i
  );
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function isRetryable(err: unknown): boolean {
  const status = (err as { status?: number })?.status;
  if (status && RETRYABLE_STATUSES.has(status)) return true;
  const msg = err instanceof Error ? err.message : '';
  return /timeout|aborted/i.test(msg);
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function callOpenRouter(
  model: string,
  source: string,
  userPrompt: string,
  questionCount: number,
  appendCount: boolean
) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY is not configured');

  let userContent = `Study material:\n"""\n${source}\n"""`;
  const extras: string[] = [];
  if (userPrompt) extras.push(`Teacher instructions: ${userPrompt}`);
  // Only spell out the count when the teacher didn't state a usable one,
  // so the instruction never contradicts their own prompt.
  if (appendCount) extras.push(`Generate exactly ${questionCount} questions.`);
  if (extras.length) userContent += `\n\n${extras.join('\n')}`;

  const started = Date.now();
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      // Headroom for large MC sets: choices make completion tokens scale with count.
      max_tokens: Math.min(MAX_TOKENS, 4000 + questionCount * 400),
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: AI_SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
    }),
    signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    const err = new Error(`OpenRouter ${res.status}: ${detail.slice(0, 300)}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }

  const data = (await res.json()) as {
    choices?: { finish_reason?: string; message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  const content = data.choices?.[0]?.message?.content;
  const finish = data.choices?.[0]?.finish_reason;
  const secs = Math.round((Date.now() - started) / 1000);
  if (!content) {
    console.error(`[ai] ${model} empty content after ${secs}s (finish: ${finish})`);
    throw new Error('Empty response from model');
  }
  console.log(
    `[ai] ${model} ok in ${secs}s (finish: ${finish}, ` +
      `prompt: ${data.usage?.prompt_tokens ?? '?'} tok, completion: ${data.usage?.completion_tokens ?? '?'} tok)`
  );
  return { model, secs, ...validate(extractJson(content)) };
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }

  let body: { source?: string; userPrompt?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const source = (body.source ?? '').trim();
  const userPrompt = (body.userPrompt ?? '').trim().slice(0, 2000);
  if (!source) {
    return Response.json({ error: 'No source material provided' }, { status: 400 });
  }
  if (source.length > MAX_SOURCE_CHARS) {
    return Response.json(
      { error: `Source too long (${source.length} chars, max ${MAX_SOURCE_CHARS})` },
      { status: 400 }
    );
  }

  const statedCount = extractQuestionCount(userPrompt);
  // Honor the teacher's count when it's within range; clamp very large/odd
  // requests to the cap so the model still gets a clear number.
  const questionCount = statedCount
    ? Math.min(statedCount, MAX_QUESTION_COUNT)
    : DEFAULT_QUESTION_COUNT;
  // Append our own count only when the teacher gave none at all, or stated one
  // beyond the cap — never when their instructions are otherwise usable.
  const appendCount = statedCount === null || statedCount > MAX_QUESTION_COUNT;
  const started = Date.now();
  const attemptLog: string[] = [];
  let lastErr: unknown;

  // Walk the model chain; each model gets one retry when the failure looks
  // transient (free-pool 429s are common and usually clear in seconds).
  for (const model of MODEL_CHAIN) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      if (Date.now() - started > TOTAL_DEADLINE_MS - ATTEMPT_TIMEOUT_MS) break;
      try {
        const result = await callOpenRouter(
          model,
          source,
          userPrompt,
          questionCount,
          appendCount
        );
        console.log(`[ai] success via ${result.model} after ${Math.round((Date.now() - started) / 1000)}s total, ${result.questions.length} questions`);
        return Response.json({
          model: result.model,
          questions: result.questions,
        });
      } catch (err) {
        lastErr = err;
        const msg = err instanceof Error ? err.message : String(err);
        attemptLog.push(`${model}#${attempt}: ${msg}`);
        console.error(`[ai] attempt failed — ${model} #${attempt}: ${msg}`);
        if (!isRetryable(err)) break;
        if (attempt === 1) await sleep(RETRY_BACKOFF_MS);
      }
    }
  }

  const lastMsg = lastErr instanceof Error ? lastErr.message : String(lastErr ?? '');
  let msg = 'AI generation failed. Check your OpenRouter key/limits and try again.';
  if (/OpenRouter (401|403)/.test(lastMsg)) {
    msg = 'AI service rejected the API key.';
  } else if (/429/.test(lastMsg)) {
    msg = 'AI rate limit hit — the free models are busy. Wait a minute and try again (free tier: ~50 requests/day).';
  } else if (/timeout|aborted/i.test(lastMsg)) {
    msg = 'AI generation timed out — the models are slow right now. Try again in a minute, or use a shorter source.';
  }
  // Include the raw upstream error so failures are diagnosable from the toast.
  return Response.json(
    { error: `${msg} [${lastMsg.slice(0, 300)}]`, attempts: attemptLog },
    { status: 502 }
  );
}
