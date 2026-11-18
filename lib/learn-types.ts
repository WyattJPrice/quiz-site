export interface LearnSessionState {
  slug: string;
  remaining: number[];
  wrongPile: number[];
  currentIdx: number;
  round: number;
  totalCorrect: number;
  totalWrong: number;
  /**
   * When the state was last written, used to keep the newer copy when the same
   * round exists on both this device and the student's profile.
   */
  updatedAt?: number;
}
