export interface LearnSessionState {
  slug: string;
  remaining: number[];
  wrongPile: number[];
  currentIdx: number;
  round: number;
  totalCorrect: number;
  totalWrong: number;
  /**
   * Categories this round was built from. Restoring them keeps the filter in
   * sync with the saved round, so summary counts match what was studied.
   */
  categories?: string[];
  /** Number of questions in the round's filtered set. */
  totalQuestions?: number;
  /**
   * When the state was last written, used to keep the newer copy when the same
   * round exists on both this device and the student's profile.
   */
  updatedAt?: number;
}
