Create a new quiz for the Bio Study site.

## How the quiz system works

Each quiz is a TypeScript file in `data/` that exports a `Question[]` array. Questions are registered in `data/index.ts`. The `QuizEngine` component handles all rendering and grading automatically based on the shape of each question object.

---

## Question types

### 1. Fill-in-the-blank (standard)

Use `__________` (10 underscores) as the blank placeholder. The engine renders it as a text input.

```ts
{ cat: "Bird's Egg", question: "The __________ is the thick outer covering of the egg.", answer: "shell" }
```

- `cat` — category badge shown at the top of the card
- `question` — the sentence with blanks
- `answer` — the expected answer (case-insensitive, punctuation-stripped, fuzzy-matched)

### 2. Multiple blanks

When a question has more than one blank, separate the answers with a comma. The engine renders one input per blank and grades them left-to-right.

```ts
{
  cat: "Bird's Egg",
  question: "__________ protects the embryo from injury and keeps it __________.",
  answer: "amniotic fluid,moist"
}
```

**Swap detection**: if a student fills in two blanks in the wrong order but with the right words, the engine flags it as a swap and marks it correct with a note.

**Alternate spellings**: separate acceptable variants within a single blank with `/`:
```ts
{ answer: "malar/zygomatic" }
```

### 3. Multiple choice

Add a `choices` array. The answer must be one of the choices (exact string). The engine shuffles the choices on every render. Clicking a choice auto-grades immediately — no "Check Answer" button needed.

```ts
{
  cat: "Common Bacteria",
  question: "Which bacterium causes pneumonia?",
  answer: "Streptococcus pneumoniae",
  choices: [
    "Streptococcus pneumoniae",
    "Streptococcus mutans",
    "Staphylococcus aureus",
    "Mycobacterium tuberculosis"
  ]
}
```

- Include 3–4 choices (one correct, rest plausible distractors)
- The correct answer must exactly match the `answer` field after normalization

---

## Grading (fill-in-the-blank only)

| Match type | Result |
|---|---|
| Exact (case-insensitive, no punctuation) | Correct |
| Levenshtein ≤ 1 (short words) or ≤ 3 (long words) | "Close enough" — marked correct, toast shows what you wrote vs. the answer |
| Wrong order on multi-blank | Marked correct, toast explains the correct order |
| None of the above | Wrong — correct answer revealed below the input |

---

## Step-by-step: adding a quiz

### Step 1 — create the data file

```ts
// data/my-topic.ts
import type { Question } from './types';

export const myTopicQuestions: Question[] = [
  { cat: "Category Name", question: "The __________ does something.", answer: "term" },
  { cat: "Category Name", question: "__________ and __________ work together.", answer: "thing one,thing two" },
  {
    cat: "Category Name",
    question: "Which of these is correct?",
    answer: "Right Answer",
    choices: ["Right Answer", "Wrong A", "Wrong B", "Wrong C"]
  },
];
```

### Step 2 — register in `data/index.ts`

```ts
import { myTopicQuestions } from './my-topic';

// add to the quizzes array:
{
  slug: 'my-topic',         // becomes /quiz/my-topic
  title: 'My Topic',
  icon: '🔬',
  description: 'Short description shown on the home page card',
  questions: myTopicQuestions,
},
```

---

## Tips for writing good questions

- **Terms/vocab**: make the term the blank — `"The __________ is the [definition]."` — answer is the term
- **Definitions with key words**: pick 1–2 meaningful words from the definition to also blank out
- **Multiple choice**: use for proper names, species names, or where spelling is hard to grade fairly
- **Categories**: group related questions under the same `cat` string — the engine shows it as a badge

---

## Current quizzes (for reference)

| Slug | Title |
|---|---|
| `skeletal` | Skeletal System |
| `muscular` | Muscular System |
| `nervous` | Nervous System |
| `skin-eye` | Skin & Eye |
| `bacteria-virus` | Bacteria, Virus & Classification |
| `perch` | Perch Dissection |
| `protist` | Protists |
| `endocrine-disease` | Endocrine System & Diseases |
| `egg-embryo` | Bird's Egg & Mammal Embryo |
