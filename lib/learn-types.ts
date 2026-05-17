export interface LearnSessionState {
  slug: string;
  remaining: number[];
  wrongPile: number[];
  currentIdx: number;
  round: number;
  totalCorrect: number;
  totalWrong: number;
}
