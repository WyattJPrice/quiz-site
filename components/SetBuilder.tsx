'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  CalendarIcon,
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  PenLine,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AiGenerateModal from '@/components/AiGenerateModal';
import {
  countBlanks,
  makeEditorQuestion,
  type EditorQuestion,
  type EditorQuestionType,
} from '@/lib/create-editor';

interface AdminSetRow {
  id: string;
  slug: string;
  title: string;
  subject: string;
  test_at: string | null;
  count: number;
}

const labelCls = 'text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase';
const cardCls = 'rounded-2xl border border-border bg-card shadow-sm';

export default function SetBuilder({
  subjects,
  editId,
}: {
  subjects: { name: string; slug: string }[];
  editId?: string;
}) {
  const router = useRouter();
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectChoice, setSubjectChoice] = useState<string>(subjects[0]?.slug ?? '__new');
  const [newSubject, setNewSubject] = useState('');
  const [testDate, setTestDate] = useState<Date | undefined>(undefined);
  const [calOpen, setCalOpen] = useState(false);
  const [questions, setQuestions] = useState<EditorQuestion[]>([]);
  const [saving, setSaving] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [chooserOpen, setChooserOpen] = useState(false);
  const [setsOpen, setSetsOpen] = useState(false);
  const [adminSets, setAdminSets] = useState<AdminSetRow[] | null>(null);
  const [setsLoading, setSetsLoading] = useState(false);

  const allCategories = useMemo(
    () =>
      Array.from(new Set(questions.map((q) => q.category).filter(Boolean))).sort(
        (a, b) => a.localeCompare(b)
      ),
    [questions]
  );

  useEffect(() => {
    if (editId) loadSet(editId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  function updateQuestion(uid: string, patch: Partial<EditorQuestion>) {
    setQuestions((qs) => qs.map((q) => (q.uid === uid ? { ...q, ...patch } : q)));
  }

  function addQuestion(type: EditorQuestionType) {
    setChooserOpen(false);
    setQuestions((qs) => [
      ...qs,
      makeEditorQuestion({
        type,
        expanded: true,
        category: '',
        prompt: type === 'fill_blank' ? `${'__________'}: ` : '',
        choices: type === 'multiple_choice' ? ['', '', '', ''] : [],
      }),
    ]);
  }

  function removeQuestion(uid: string) {
    setQuestions((qs) => qs.filter((q) => q.uid !== uid));
  }

  function setPromptAndSyncAnswers(q: EditorQuestion, prompt: string) {
    const blanks = countBlanks(prompt);
    const parts = q.answer.split(',');
    if (blanks > parts.length) {
      while (parts.length < blanks) parts.push('');
    } else if (blanks >= 1 && blanks < parts.length) {
      parts.length = blanks;
    }
    updateQuestion(q.uid, { prompt, answer: parts.join(',') });
  }

  async function loadSets() {
    if (adminSets) return;
    setSetsLoading(true);
    try {
      const res = await fetch('/api/admin/sets');
      const data = (await res.json()) as { sets?: AdminSetRow[] };
      setAdminSets(data.sets ?? []);
    } catch {
      toast.error('Could not load your sets.');
    } finally {
      setSetsLoading(false);
    }
  }

  async function loadSet(id: string) {
    try {
      const res = await fetch(`/api/admin/sets/${id}`);
      const data = (await res.json()) as {
        error?: string;
        set?: {
          id: string;
          title: string;
          description: string;
          subjectSlug: string;
          testAt: string | null;
          questions: {
            type: string;
            category: string;
            prompt: string;
            answer: string;
            choices?: string[];
          }[];
        };
      };
      if (!data.set) {
        toast.error(data.error ?? 'Could not load that set.');
        return;
      }
      const s = data.set;
      setEditingSetId(s.id);
      setTitle(s.title);
      setDescription(s.description);
      setSubjectChoice(s.subjectSlug);
      setTestDate(s.testAt ? new Date(`${s.testAt}T12:00:00`) : undefined);
      setQuestions(
        s.questions.map((q, i) => {
          const type: EditorQuestionType =
            q.type === 'multiple_choice' ? 'multiple_choice' : 'fill_blank';
          const choices = q.choices ?? [];
          return makeEditorQuestion({
            type,
            category: q.category,
            prompt: q.prompt,
            answer: q.answer,
            choices,
            answerIdx: Math.max(0, choices.indexOf(q.answer)),
            expanded: i < 3,
          });
        })
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      toast.error('Could not load that set.');
    }
  }

  function resetForm() {
    setEditingSetId(null);
    setTitle('');
    setDescription('');
    setSubjectChoice(subjects[0]?.slug ?? '__new');
    setNewSubject('');
    setTestDate(undefined);
    setQuestions([]);
    setAdminSets(null);
  }

  async function handleSave() {
    if (!title.trim()) {
      toast.error('Give the set a name.');
      return;
    }
    if (subjectChoice === '__new' && !newSubject.trim()) {
      toast.error('Enter a name for the new subject.');
      return;
    }
    if (questions.length === 0) {
      toast.error('Add at least one question.');
      return;
    }
    for (const q of questions) {
      if (!q.prompt.trim() || !(q.type === 'multiple_choice' ? q.choices[q.answerIdx] : q.answer).trim()) {
        toast.error(`Question ${questions.indexOf(q) + 1} needs a prompt and answer.`);
        return;
      }
      if (q.type === 'multiple_choice') {
        const filled = q.choices.filter((c) => c.trim());
        if (filled.length < 2 || !(q.choices[q.answerIdx] ?? '').trim()) {
          toast.error(`Multiple-choice question ${questions.indexOf(q) + 1} needs at least 2 choices and one marked correct.`);
          return;
        }
      }
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      subjectSlug: subjectChoice === '__new' ? undefined : subjectChoice,
      newSubject: subjectChoice === '__new' ? newSubject.trim() : undefined,
      testAt: testDate ? format(testDate, 'yyyy-MM-dd') : null,
      questions: questions.map((q) =>
        q.type === 'multiple_choice'
          ? {
              type: q.type,
              category: q.category,
              prompt: q.prompt,
              answer: q.choices[q.answerIdx]?.trim() ?? '',
              choices: q.choices.map((c) => c.trim()).filter(Boolean),
            }
          : {
              type: q.type,
              category: q.category,
              prompt: q.prompt,
              answer: q.answer,
            }
      ),
    };

    setSaving(true);
    try {
      const res = await fetch(
        editingSetId ? `/api/admin/sets/${editingSetId}` : '/api/admin/sets',
        {
          method: editingSetId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = (await res.json()) as { error?: string; slug?: string };
      if (!res.ok || data.error) {
        toast.error(data.error ?? 'Could not save the set.');
        return;
      }
      toast.success(editingSetId ? 'Set updated.' : 'Set created.');
      resetForm();
      router.push('/');
      router.refresh();
    } catch {
      toast.error('Could not save the set.');
    } finally {
      setSaving(false);
    }
  }

  function insertAiQuestions(list: EditorQuestion[]) {
    setQuestions((qs) => [...qs, ...list]);
    setTimeout(() => {
      const el = document.getElementById('question-editor-end');
      el?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  }

  return (
    <div className="grid items-start gap-6 md:grid-cols-[280px_minmax(0,1fr)]">
      {/* ── Left column: set details ─────────────────────────────── */}
      <div className={`${cardCls} flex flex-col gap-4 p-5 md:sticky md:top-16`}>
        <div className="flex flex-col gap-1.5">
          <span className={labelCls}>Set name</span>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Religion Chapter 5 Vocab"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className={labelCls}>Description (optional)</span>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Shown on the home card"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className={labelCls}>Subject</span>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="border-input flex h-8 w-full items-center justify-between gap-2 rounded-lg border bg-transparent px-2.5 text-sm shadow-xs outline-none transition-colors hover:bg-accent/50 data-[popup-open]:bg-accent/50"
                />
              }
            >
              <span className="truncate">
                {subjectChoice === '__new'
                  ? newSubject.trim() || 'New subject…'
                  : subjects.find((s) => s.slug === subjectChoice)?.name ?? 'Select a subject'}
              </span>
              <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-64 w-56 overflow-y-auto">
              {subjects.map((s) => (
                <DropdownMenuItem key={s.slug} onClick={() => setSubjectChoice(s.slug)}>
                  <span className="flex-1">{s.name}</span>
                  {subjectChoice === s.slug && <Check className="size-3.5 text-primary" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onClick={() => setSubjectChoice('__new')}>
                <span className="flex-1">New subject…</span>
                {subjectChoice === '__new' && <Check className="size-3.5 text-primary" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {subjectChoice === '__new' && (
            <Input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="New subject name"
              className="mt-1"
            />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <span className={labelCls}>Test date (optional)</span>
          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  className="border-input flex h-8 w-full items-center justify-between gap-2 rounded-lg border bg-transparent px-2.5 text-sm shadow-xs outline-none hover:bg-accent/50"
                />
              }
            >
              <span className={testDate ? 'font-medium' : 'text-muted-foreground'}>
                {testDate ? format(testDate, 'MMM d, yyyy') : 'Pick a date'}
              </span>
              <CalendarIcon className="size-3.5 text-muted-foreground" />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                selected={testDate}
                onSelect={(d) => {
                  setTestDate(d);
                  setCalOpen(false);
                }}
              />
              {testDate && (
                <div className="px-3 pb-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setTestDate(undefined);
                      setCalOpen(false);
                    }}
                  >
                    Clear date
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        <Button onClick={handleSave} disabled={saving} className="mt-1 w-full">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {saving ? 'Saving…' : editingSetId ? 'Update set' : 'Save set'}
        </Button>
        {editingSetId && (
          <Button variant="ghost" onClick={resetForm} className="w-full">
            <X className="size-4" /> Cancel editing
          </Button>
        )}
      </div>

      {/* ── Right column: question editor ────────────────────────── */}
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <b className="text-sm font-semibold">
            Questions <span className="text-muted-foreground">({questions.length})</span>
          </b>
          <Button variant="outline" size="sm" onClick={() => setAiOpen(true)}>
            <Sparkles className="size-4" /> Generate with AI
          </Button>
        </div>

        {questions.map((q, i) => (
          <QuestionCard
            key={q.uid}
            index={i + 1}
            question={q}
            allCategories={allCategories}
            onToggle={() => updateQuestion(q.uid, { expanded: !q.expanded })}
            onRemove={() => removeQuestion(q.uid)}
            onPatch={(patch) => updateQuestion(q.uid, patch)}
            onPrompt={(prompt) => setPromptAndSyncAnswers(q, prompt)}
          />
        ))}

        <button
          onClick={() => setChooserOpen(true)}
          className="flex min-h-24 w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          <Plus className="size-6" />
          <span className="text-sm font-medium">Add question</span>
        </button>
        <div id="question-editor-end" />

        {/* Your sets (editing) */}
        <div className="mt-4">
          <button
            onClick={() => {
              setSetsOpen((o) => !o);
              if (!setsOpen) loadSets();
            }}
            className="flex w-full items-center justify-between rounded-xl px-1 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <span>
              Your sets <span className="font-normal">(click edit to load one)</span>
            </span>
            {setsOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
          {setsOpen && (
            <div className={`${cardCls} mt-1 divide-y divide-border overflow-hidden`}>
              {setsLoading && (
                <p className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" /> Loading…
                </p>
              )}
              {adminSets?.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 px-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {s.subject} · {s.count} questions
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadSet(s.id)}
                    className={editingSetId === s.id ? 'border-primary text-primary' : ''}
                  >
                    {editingSetId === s.id ? 'Loaded' : 'Edit'}
                  </Button>
                </div>
              ))}
              {adminSets?.length === 0 && (
                <p className="px-4 py-3 text-sm text-muted-foreground">No sets yet.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add-question chooser */}
      <Dialog open={chooserOpen} onOpenChange={setChooserOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle className="text-lg font-bold tracking-tight">
            What kind of question?
          </DialogTitle>
          <DialogDescription className="sr-only">
            Choose between a written (fill-in-the-blank) question and a multiple choice question.
          </DialogDescription>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => addQuestion('fill_blank')}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border p-5 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <PenLine className="size-5 text-muted-foreground" />
              Written
              <span className="text-xs font-normal text-muted-foreground">
                Fill-in-the-blank, supports multiple blanks
              </span>
            </button>
            <button
              onClick={() => addQuestion('multiple_choice')}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border p-5 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <Check className="size-5 text-muted-foreground" />
              Multiple choice
              <span className="text-xs font-normal text-muted-foreground">
                Pick one correct answer from choices
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <AiGenerateModal
        open={aiOpen}
        onOpenChange={setAiOpen}
        onInsert={insertAiQuestions}
      />
    </div>
  );
}

function QuestionCard({
  index,
  question,
  allCategories,
  onToggle,
  onRemove,
  onPatch,
  onPrompt,
}: {
  index: number;
  question: EditorQuestion;
  allCategories: string[];
  onToggle: () => void;
  onRemove: () => void;
  onPatch: (patch: Partial<EditorQuestion>) => void;
  onPrompt: (prompt: string) => void;
}) {
  const q = question;
  const [creatingCat, setCreatingCat] = useState(false);
  const [newCatDraft, setNewCatDraft] = useState('');
  const isMc = q.type === 'multiple_choice';
  const blanks = countBlanks(q.prompt);
  const answerParts = blanks > 1 ? q.answer.split(',') : [q.answer];
  const answerInvalid = !q.prompt.trim() || !(isMc ? q.choices[q.answerIdx] : q.answer).trim();

  function commitNewCat() {
    const v = newCatDraft.trim();
    if (v) onPatch({ category: v });
    setCreatingCat(false);
    setNewCatDraft('');
  }

  return (
    <div
      className={`${cardCls} overflow-hidden ${q.expanded ? 'ring-1 ring-primary/25' : ''}`}
    >
      <div className="flex min-w-0 items-center gap-3 px-4 py-2.5">
        <button
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          {q.expanded ? (
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          )}
          <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
            {index}
          </span>
          <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold tracking-[0.05em] text-secondary-foreground uppercase">
            {isMc ? 'Multiple choice' : 'Written'}
          </span>
          {q.category.trim() && (
            <span className="hidden max-w-32 shrink-0 truncate rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary sm:inline">
              {q.category}
            </span>
          )}
          <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
            {q.prompt.replace(/_{5,}/g, '_____') || 'Empty question'}
          </span>
        </button>
        {answerInvalid && (
          <span className="shrink-0 text-[10px] font-bold tracking-[0.05em] text-destructive uppercase">
            incomplete
          </span>
        )}
        <button
          onClick={onRemove}
          className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label="Remove question"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {q.expanded && (
        <div className="flex min-w-0 flex-col gap-3.5 overflow-hidden border-t border-border px-4 py-4">
          <div className="flex flex-col gap-1.5">
            <span className={labelCls}>Category</span>
            {creatingCat ? (
              <div className="flex items-center gap-1.5">
                <Input
                  autoFocus
                  value={newCatDraft}
                  onChange={(e) => setNewCatDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      commitNewCat();
                    } else if (e.key === 'Escape') {
                      setCreatingCat(false);
                      setNewCatDraft('');
                    }
                  }}
                  placeholder="New category name"
                />
                <Button
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={commitNewCat}
                  aria-label="Save category"
                >
                  <Check className="size-4" />
                </Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      className="border-input flex h-8 w-full items-center justify-between gap-2 rounded-lg border bg-transparent px-2.5 text-sm shadow-xs outline-none transition-colors hover:bg-accent/50 data-[popup-open]:bg-accent/50"
                    />
                  }
                >
                  <span className={`truncate ${q.category ? '' : 'text-muted-foreground'}`}>
                    {q.category || 'Select a category'}
                  </span>
                  <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="max-h-64 w-56 overflow-y-auto">
                  <DropdownMenuItem
                    onClick={() => {
                      setCreatingCat(true);
                      setNewCatDraft('');
                    }}
                  >
                    <Plus className="size-3.5 text-primary" />
                    <span className="font-medium">Create new category…</span>
                  </DropdownMenuItem>
                  {allCategories.length > 0 && (
                    <div className="mx-2 my-1 border-t border-border" />
                  )}
                  {allCategories.map((cat) => (
                    <DropdownMenuItem key={cat} onClick={() => onPatch({ category: cat })}>
                      <span className="flex-1 truncate">{cat}</span>
                      {q.category === cat && <Check className="size-3.5 text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className={labelCls}>Question</span>
            <Textarea
              value={q.prompt}
              onChange={(e) => (isMc ? onPatch({ prompt: e.target.value }) : onPrompt(e.target.value))}
              placeholder={
                isMc
                  ? 'e.g. What is the setting of this novel?'
                  : `e.g. ${'__________'}: The organelle that produces ATP.`
              }
              className="min-h-16 resize-y"
            />
            {!isMc && (
              <span className="text-xs text-muted-foreground">
                Use {'__________'} (5+ underscores) to mark each blank — use several for multiple blanks.
              </span>
            )}
          </div>

          {isMc ? (
            <div className="flex flex-col gap-1.5">
              <span className={labelCls}>Choices — click the circle to mark the correct one</span>
              <div className="flex flex-col gap-1.5">
                {q.choices.map((choice, ci) => (
                  <div key={ci} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onPatch({ answerIdx: ci })}
                      aria-label={`Mark choice ${ci + 1} correct`}
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        q.answerIdx === ci
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-transparent hover:border-primary/60'
                      }`}
                    >
                      <Check className="size-3" strokeWidth={3} />
                    </button>
                    <Input
                      value={choice}
                      onChange={(e) => {
                        const choices = [...q.choices];
                        choices[ci] = e.target.value;
                        onPatch({ choices });
                      }}
                      placeholder={`Choice ${ci + 1}`}
                    />
                    {q.choices.length > 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          const choices = q.choices.filter((_, i2) => i2 !== ci);
                          onPatch({
                            choices,
                            answerIdx: q.answerIdx === ci ? 0 : q.answerIdx > ci ? q.answerIdx - 1 : q.answerIdx,
                          });
                        }}
                        className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Remove choice"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {q.choices.length < 6 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="self-start"
                  onClick={() => onPatch({ choices: [...q.choices, ''] })}
                >
                  <Plus className="size-4" /> Add choice
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <span className={labelCls}>
                {blanks > 1 ? `Answers — blank 1 to ${blanks} in order` : 'Answer'}
              </span>
              {blanks > 1 ? (
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {answerParts.map((part, ai) => (
                    <Input
                      key={ai}
                      value={part}
                      onChange={(e) => {
                        const parts = [...answerParts];
                        parts[ai] = e.target.value;
                        onPatch({ answer: parts.join(',') });
                      }}
                      placeholder={`Blank ${ai + 1}`}
                    />
                  ))}
                </div>
              ) : (
                <Input
                  value={q.answer}
                  onChange={(e) => onPatch({ answer: e.target.value })}
                  placeholder="Correct answer (use alt/alt for alternate spellings)"
                />
              )}
              <span className="text-xs text-muted-foreground">
                {blanks > 1
                  ? 'One answer per blank, in order. Use alt/alt inside a blank for alternate spellings.'
                  : 'Use alt/alt for alternate accepted spellings, e.g. gray/grey.'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
