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
  /** Upcoming test date (ISO, e.g. 2026-11-20). Card shows it in the
   *  Upcoming Tests section until the date passes. */
  testDate?: string;
}
