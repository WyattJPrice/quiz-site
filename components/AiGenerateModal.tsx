'use client';

import { useRef, useState } from 'react';
import { Loader2, Sparkles, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  makeEditorQuestion,
  type EditorQuestion,
  type EditorQuestionType,
} from '@/lib/create-editor';

const MAX_SOURCE_CHARS = 100000;

interface GenerateResponse {
  error?: string;
  questions?: {
    type?: string;
    category?: string;
    prompt?: string;
    answer?: string;
    choices?: string[];
  }[];
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((it) => ('str' in it ? it.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (line) pages.push(line);
  }
  return pages.join('\n\n');
}

export default function AiGenerateModal({
  open,
  onOpenChange,
  onInsert,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (questions: EditorQuestion[]) => void;
}) {
  const [fileText, setFileText] = useState('');
  const [fileFullLen, setFileFullLen] = useState(0);
  const [fileName, setFileName] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [instructions, setInstructions] = useState('');
  const [readingFile, setReadingFile] = useState(false);
  const [generating, setGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setFileText('');
    setFileFullLen(0);
    setFileName('');
    setPasteText('');
    setInstructions('');
  }

  function clearFile() {
    setFileText('');
    setFileFullLen(0);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function acceptFile(full: string, name: string) {
    const trimmed = full.slice(0, MAX_SOURCE_CHARS);
    setFileText(trimmed);
    setFileFullLen(full.length > trimmed.length ? full.length : 0);
    setFileName(name);
    setPasteText('');
  }

  async function handleFile(file: File | null) {
    if (!file) return;
    setReadingFile(true);
    try {
      if (file.name.toLowerCase().endsWith('.pdf')) {
        const text = await extractPdfText(file);
        if (!text.trim()) {
          toast.error('No readable text found in that PDF (it may be scanned images).');
          setReadingFile(false);
          return;
        }
        acceptFile(text, file.name);
      } else {
        acceptFile(await file.text(), file.name);
      }
    } catch {
      toast.error('Could not read that file.');
    } finally {
      setReadingFile(false);
    }
  }

  const source = (fileText || pasteText).trim();

  async function handleGenerate() {
    if (!source) {
      toast.error('Upload a file or paste your study material first.');
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, userPrompt: instructions }),
      });
      const raw = await res.text();
      let data: GenerateResponse | null = null;
      try {
        data = JSON.parse(raw) as GenerateResponse;
      } catch {
        // e.g. a 502/504 HTML error page from the platform — show something useful
      }
      if (!res.ok || data?.error || !data?.questions) {
        toast.error(data?.error ?? `AI generation failed (${res.status}). Try again.`);
        return;
      }
      const mapped: EditorQuestion[] = data.questions.map((q) => {
        const type: EditorQuestionType =
          q.type === 'multiple_choice' ? 'multiple_choice' : 'fill_blank';
        const choices = type === 'multiple_choice' ? (q.choices ?? []) : [];
        return makeEditorQuestion({
          type,
          category: q.category ?? '',
          prompt: q.prompt ?? '',
          answer: q.answer ?? '',
          choices,
          answerIdx: Math.max(0, choices.indexOf(q.answer ?? '')),
        });
      });
      onInsert(mapped);
      onOpenChange(false);
      reset();
      toast.success(`Generated ${mapped.length} questions — review them below.`);
    } catch {
      toast.error('AI generation failed. Try again.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            Generate questions with AI
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            Upload a PDF, markdown, or text file — or paste your study material.
            The AI builds questions for you to review.
          </DialogDescription>
        </div>

        <div className="rounded-xl border border-dashed border-border bg-secondary/40 p-4 text-center">
          {readingFile ? (
            <p className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Reading file…
            </p>
          ) : fileName ? (
            <div className="flex flex-col items-center gap-1 text-sm">
              <div className="flex items-center justify-center gap-2">
                <span className="max-w-48 truncate font-medium">{fileName}</span>
                <span className="text-muted-foreground">
                  {fileText.length.toLocaleString()} chars
                </span>
                <button
                  onClick={clearFile}
                  className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label="Remove file"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              {fileFullLen > 0 && (
                <span className="text-[11px] text-amber-600 dark:text-amber-400">
                  Long document — using the first {MAX_SOURCE_CHARS.toLocaleString()} of{' '}
                  {fileFullLen.toLocaleString()} chars
                </span>
              )}
            </div>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.md,.txt,.markdown"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mx-auto flex flex-col items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Upload className="size-5" />
                <span>
                  <b className="font-semibold text-foreground">Upload</b> a PDF, markdown, or text file
                </span>
              </button>
            </>
          )}
        </div>

        <div className="text-center text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
          or paste text
        </div>
        {/* Fixed height (field-sizing-fixed, not field-sizing-content) so a long
            paste scrolls inside the box instead of stretching it and the dialog. */}
        <Textarea
          value={fileText ? '' : pasteText}
          disabled={!!fileName}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="Paste your notes, vocab list, or chapter text here…"
          className="h-36 field-sizing-fixed overflow-y-auto"
        />

        <div>
          <Textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Optional: extra instructions for the AI — e.g. &quot;20 questions, mostly multiple choice, focus on chapter 3 terms&quot;"
            className="h-16 field-sizing-fixed overflow-y-auto"
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating || !source}
          className="w-full"
        >
          {generating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {generating ? 'Generating…' : 'Generate questions'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
