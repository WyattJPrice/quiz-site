# Bio Study — Quiz Site

A Next.js (TypeScript) fill-in-the-blank study app for biology. Students type answers into blanks, get fuzzy-match grading, and see their score at the end.

## Stack

- **Next.js 15** (App Router, static export)
- **TypeScript**
- **Fonts**: Syne (headings), DM Mono (inputs/code)
- No external UI library — custom CSS in `app/globals.css`

## Project structure

```
app/
  layout.tsx          — root layout, fonts, metadata
  page.tsx            — home page (quiz listing grid)
  quiz/[slug]/page.tsx — dynamic quiz page, renders QuizEngine

components/
  QuizEngine.tsx      — all quiz logic + UI (fill-in-blank, multiple choice, scoring)

data/
  types.ts            — Question and QuizMeta interfaces
  index.ts            — master quiz registry (quizzes array + getQuiz())
  skeletal.ts         — one file per quiz topic
  muscular.ts
  nervous.ts
  skin-eye.ts
  bacteria-virus.ts
  protist.ts
  perch.ts
  endocrine-disease.ts
  egg-embryo.ts

lib/
  quiz.ts             — shuffle, normalize, isFuzzyMatch, getPermutations
```

## Adding a new quiz

1. Create `data/<slug>.ts` — export a `Question[]` array
2. Import it in `data/index.ts` and push a `QuizMeta` entry to the `quizzes` array

See `/create-quiz` for the full question format guide.

## Question format

Defined in `data/types.ts`:

```ts
interface Question {
  cat: string;       // category badge shown on the card
  question: string;  // sentence with __________ for each blank
  answer: string;    // single answer, or comma-separated for multiple blanks
  choices?: string[]; // present → multiple-choice mode (single correct answer)
}
```

### Fill-in-the-blank (most common)
```ts
{ cat: "Bird's Egg", question: "The __________ is the thick outer covering of the egg.", answer: "shell" }
```

### Multiple blanks (answer is comma-separated)
```ts
{ cat: "Bird's Egg", question: "__________ protects the embryo from injury and keeps it __________.", answer: "amniotic fluid,moist" }
```

Alternate accepted spellings within one blank use `/`:
```ts
{ answer: "malar/zygomatic" }
```

### Multiple choice (add `choices` array)
```ts
{
  cat: "Common Bacteria",
  question: "Which bacterium causes pneumonia?",
  answer: "Streptococcus pneumoniae",
  choices: ["Streptococcus pneumoniae", "Streptococcus mutans", "Staphylococcus aureus", "Mycobacterium tuberculosis"]
}
```
The engine shuffles `choices` on every render. `answer` must exactly match one of the choices (case-insensitive after normalization).

## Grading logic (`lib/quiz.ts`)

- **Exact match** — normalized (lowercase, stripped punctuation)
- **Fuzzy match** — only forgives a misspelling, marked correct with a "close enough" toast. The answer must start with the same letter; answers of 4 characters or fewer must be exact; 5–10 characters forgive one added, dropped or transposed letter (not a changed letter, since that turns a term into another: abduction/adduction); longer answers forgive up to two edits
- **Swap detection** — if a multi-blank answer has the right words in the wrong order, the engine catches it and tells the student

## Hydration gotcha

Never use `Math.random()` or `shuffle()` in `useState` initializers or during render — server and client will produce different results, causing a React hydration mismatch. Instead, initialize with the static value and shuffle inside a `useEffect` after mount. Guard the render with a `mounted` state flag so the server and client both render `null` until the client effect fires.

## Quiz registration (`data/index.ts`)

```ts
{
  slug: 'egg-embryo',        // URL: /quiz/egg-embryo
  title: "Bird's Egg & Mammal Embryo",
  icon: '🥚',               // emoji shown on home card
  description: 'One-line description shown on home page',
  questions: eggEmbryoQuestions,
}
```
