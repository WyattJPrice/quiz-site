import { getAdminSession } from '@/lib/admin';
import { AI_SYSTEM_PROMPT } from '@/lib/ai-prompt';

export const dynamic = 'force-dynamic';

const MAX_SOURCE_CHARS = 24000;
const PRIMARY_MODEL = 'nvidia/nemotron-3.5-lightning:free';
const FALLBACK_MODEL = 'baidu/ernie-5.5-flash-preview:free';

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

async function callOpenRouter(model: string, source: string, userPrompt: string) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY is not configured');

  const userContent =
    `Study material:\n"""\n${source}\n"""` +
    (userPrompt ? `\n\nTeacher instructions: ${userPrompt}` : '');

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: AI_SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
    }),
    signal: AbortSignal.timeout(120000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    const err = new Error(`OpenRouter ${res.status}: ${detail.slice(0, 200)}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from model');
  return validate(extractJson(content));
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

  let result;
  try {
    result = await callOpenRouter(PRIMARY_MODEL, source, userPrompt);
  } catch (err) {
    console.error('AI primary model failed', err);
    try {
      result = await callOpenRouter(FALLBACK_MODEL, source, userPrompt);
    } catch (err2) {
      console.error('AI fallback model failed', err2);
      const firstMsg = err instanceof Error ? err.message : '';
      const detailMatch = firstMsg.match(/OpenRouter \d+: (.+)/);
      const detail = detailMatch ? detailMatch[1] : '';
      let msg = 'AI generation failed. Check your OpenRouter key/limits and try again.';
      if (/OpenRouter (401|403)/.test(firstMsg)) msg = 'AI service rejected the API key.';
      else if (/429/.test(firstMsg) || /429/.test(String(err2))) msg = 'AI rate limit hit — wait a moment and try again (free tier: ~50 requests/day).';
      if (process.env.NODE_ENV !== 'production' && detail) msg += ` [${detail}]`;
      return Response.json({ error: msg }, { status: 502 });
    }
  }

  return Response.json({ model: PRIMARY_MODEL, ...result });
}
