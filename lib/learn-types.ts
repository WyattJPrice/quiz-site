export interface LearnSessionState {
  slug: string;
  remaining: number[];
  wrongPile: number[];
  currentIdx: number;
  round: number;
  totalCorrect: number;
  totalWrong: number;
  /** Milliseconds since epoch, used to pick the newest of local and server state. */
  updatedAt?: number;
}
