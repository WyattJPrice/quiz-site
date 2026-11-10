import type { QuizMeta } from './types';
import { skeletalQuestions } from './skeletal';
import { muscularQuestions } from './muscular';
import { nervousQuestions } from './nervous';
import { skinEyeQuestions } from './skin-eye';
import { bacteriaVirusQuestions } from './bacteria-virus';
import { perchQuestions } from './perch';
import { protistQuestions } from './protist';
import { endocrineDiseaseQuestions } from './endocrine-disease';
import { eggEmbryoQuestions } from './egg-embryo';
import { finalReviewQuestions } from './final-review';
import { englishIIQuestions } from './english-ii';
import { crucibleAct2Questions } from './crucible-act-2';
import { frenchFinalQuestions } from './french-final';
import { salvationHistoryQuestions } from './salvation-history';
import { usHistoryUnit3Questions } from './us-history-unit-3';
import { redBadgeCh1to6Questions } from './red-badge-ch1-6';
import { chemistryPeriodicTableQuestions } from './chemistry-periodic-table';
import { religionCh4Questions } from './religion-ch4';

export const quizzes: QuizMeta[] = [
  // ── Biology ────────────────────────────────────────────────────
  {
    slug: 'final-review',
    title: 'Biology Final Review',
    icon: '📋',
    description: 'Comprehensive review covering taxonomy, viruses, protists, arthropods, fish, body systems, and more',
    questions: finalReviewQuestions,
    section: 'Biology',
  },
  {
    slug: 'skeletal',
    title: 'Skeletal System',
    icon: '🦴',
    description: 'Bones, joints, connective tissue, and skeletal disorders',
    questions: skeletalQuestions,
    section: 'Biology',
  },
  {
    slug: 'muscular',
    title: 'Muscular System',
    icon: '💪',
    description: 'Muscle types, anatomy, movement planes, and the sliding filament theory',
    questions: muscularQuestions,
    section: 'Biology',
  },
  {
    slug: 'nervous',
    title: 'Nervous System',
    icon: '🧠',
    description: 'Neurons, brain regions, reflex arcs, and nervous system divisions',
    questions: nervousQuestions,
    section: 'Biology',
  },
  {
    slug: 'skin-eye',
    title: 'Skin & Eye',
    icon: '👁️',
    description: 'Integumentary system, skin disorders, and visual anatomy',
    questions: skinEyeQuestions,
    section: 'Biology',
  },
  {
    slug: 'bacteria-virus',
    title: 'Bacteria, Virus & Classification',
    icon: '🦠',
    description: 'Microbiology, viruses, and the five-kingdom classification system',
    questions: bacteriaVirusQuestions,
    section: 'Biology',
  },
  {
    slug: 'perch',
    title: 'Perch Dissection',
    icon: '🐟',
    description: 'External and internal structures of the perch, a ray-finned fish',
    questions: perchQuestions,
    section: 'Biology',
  },
  {
    slug: 'protist',
    title: 'Protists',
    icon: '🔬',
    description: 'Protozoa, algae, slime molds, and their key protist examples',
    questions: protistQuestions,
    section: 'Biology',
  },
  {
    slug: 'endocrine-disease',
    title: 'Endocrine System & Diseases',
    icon: '🧬',
    description: 'Glands, hormones, and the four disease types: infectious, inherited, deficiency, and hormonal',
    questions: endocrineDiseaseQuestions,
    section: 'Biology',
  },
  {
    slug: 'egg-embryo',
    title: "Bird's Egg & Mammal Embryo",
    icon: '🥚',
    description: "Structures of a bird's egg and mammal embryo, including protective membranes and nutrient systems",
    questions: eggEmbryoQuestions,
    section: 'Biology',
  },
  // ── English II ─────────────────────────────────────────────────
  {
    slug: 'english-ii',
    title: 'English II Finals',
    icon: '📖',
    description: 'Composition, Persepolis, Grammar, Punctuation, and Hamlet',
    questions: englishIIQuestions,
    section: 'English II',
  },
  {
    slug: 'crucible-act-2',
    title: 'The Crucible — Act 2',
    icon: '⚖️',
    description: '50 multiple choice questions on characters, the court, and key quotes from Act 2',
    questions: crucibleAct2Questions,
    section: 'English II',
  },
  {
    slug: 'red-badge-ch1-6',
    title: 'The Red Badge of Courage — Ch. 1-6',
    icon: '🎖️',
    description: '75 multiple choice questions on Henry Fleming\u2019s first battles, his fears, and his flight',
    questions: redBadgeCh1to6Questions,
    section: 'English II',
  },
  // ── Salvation History ───────────────────────────────────────────
  {
    slug: 'salvation-history',
    title: 'Salvation History Final',
    icon: '✝️',
    description: 'Creation to Christ — 115 questions covering the major covenants, figures, and events of Salvation History',
    questions: salvationHistoryQuestions,
    section: 'Salvation History',
  },
  // ── French ──────────────────────────────────────────────────────
  {
    slug: 'french-final',
    title: 'French I Final',
    icon: '🇫🇷',
    description: 'Numbers, days, months, articles, conjugation, adjectives, possessives, negation, and more',
    questions: frenchFinalQuestions,
    section: 'French',
  },
  // ── US History ───────────────────────────────────────────────────
  {
    slug: 'us-history-unit-3',
    title: 'US History Unit 3: The 13 Colonies',
    icon: '🇺🇸',
    description: 'Practice test on the colonies — diversity, education, Jamestown, New England, colonial economies, and more',
    questions: usHistoryUnit3Questions,
    section: 'US History',
  },
  // ── Chemistry ───────────────────────────────────────────────────
  {
    slug: 'chemistry-periodic-table',
    title: 'Chemistry: Periodic Table Vocab',
    icon: '⚗️',
    description: '18 fill-in-the-blank terms — periodic law, groups of elements, ions, and atomic trends',
    questions: chemistryPeriodicTableQuestions,
    section: 'Chemistry',
  },
  // ── Religion ────────────────────────────────────────────────────
  {
    slug: 'religion-ch4',
    title: 'Religion Chapter 4 Vocab',
    icon: '⛪',
    description: '15 multiple choice terms — councils, creeds, heresy, and early Church theology',
    questions: religionCh4Questions,
    section: 'Religion Chapter 4',
  },
];

export function getQuiz(slug: string): QuizMeta | undefined {
  return quizzes.find(q => q.slug === slug);
}
