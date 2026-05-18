export interface Question {
  cat: string;
  question: string;
  answer: string;
  choices?: string[];
}

export interface QuizMeta {
  slug: string;
  title: string;
  icon: string;
  description: string;
  questions: Question[];
  section?: string;
}
