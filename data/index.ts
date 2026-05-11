import type { QuizMeta } from './types';
import { skeletalQuestions } from './skeletal';
import { muscularQuestions } from './muscular';
import { nervousQuestions } from './nervous';
import { skinEyeQuestions } from './skin-eye';
import { bacteriaVirusQuestions } from './bacteria-virus';
import { perchQuestions } from './perch';
import { protistQuestions } from './protist';
import { endocrineDiseaseQuestions } from './endocrine-disease';

export const quizzes: QuizMeta[] = [
  {
    slug: 'skeletal',
    title: 'Skeletal System',
    icon: '🦴',
    description: 'Bones, joints, connective tissue, and skeletal disorders',
    questions: skeletalQuestions,
  },
  {
    slug: 'muscular',
    title: 'Muscular System',
    icon: '💪',
    description: 'Muscle types, anatomy, movement planes, and the sliding filament theory',
    questions: muscularQuestions,
  },
  {
    slug: 'nervous',
    title: 'Nervous System',
    icon: '🧠',
    description: 'Neurons, brain regions, reflex arcs, and nervous system divisions',
    questions: nervousQuestions,
  },
  {
    slug: 'skin-eye',
    title: 'Skin & Eye',
    icon: '👁️',
    description: 'Integumentary system, skin disorders, and visual anatomy',
    questions: skinEyeQuestions,
  },
  {
    slug: 'bacteria-virus',
    title: 'Bacteria, Virus & Classification',
    icon: '🦠',
    description: 'Microbiology, viruses, and the five-kingdom classification system',
    questions: bacteriaVirusQuestions,
  },
  {
    slug: 'perch',
    title: 'Perch Dissection',
    icon: '🐟',
    description: 'External and internal structures of the perch, a ray-finned fish',
    questions: perchQuestions,
  },
  {
    slug: 'protist',
    title: 'Protists',
    icon: '🔬',
    description: 'Protozoa, algae, slime molds, and their key protist examples',
    questions: protistQuestions,
  },
  {
    slug: 'endocrine-disease',
    title: 'Endocrine System & Diseases',
    icon: '🧬',
    description: 'Glands, hormones, and the four disease types: infectious, inherited, deficiency, and hormonal',
    questions: endocrineDiseaseQuestions,
  },
];

export function getQuiz(slug: string): QuizMeta | undefined {
  return quizzes.find(q => q.slug === slug);
}
