export const MASTERY_THRESHOLD = 3;
export const RETRY_DELAY_ROUNDS = 1;
export const ROUND_SIZE_MAX = 7;

export interface QuestionProgress {
  questionIndex: number;
  correctStreak: number;
  totalAttempts: number;
  totalMisses: number;
  lastMissRound: number | null;
  lastSeenRound: number;
  mastered: boolean;
  lastDistractors: string[] | null;
}

export interface LearnSessionState {
  slug: string;
  round: number;
  questionsProgress: QuestionProgress[];
  startedAt: string;
  lastUpdatedAt: string;
}
