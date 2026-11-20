export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
}

/**
 * Optimal string alignment distance: Levenshtein, except that swapping two
 * neighbouring letters ("recieve" for "receive") costs one edit, not two.
 */
function editDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
      }
    }
  }
  return dp[m][n];
}

/**
 * True only when the student's answer reads like a misspelling of one of the
 * accepted answers.
 *
 * `knownTerms` holds every answer the question set teaches, already normalized.
 * A taught term that is not accepted for this blank is a different answer, not
 * a misspelling — "decrease" for "increase", "adduction" for "abduction" — so
 * it is never forgiven, however few letters separate the two words.
 */
export function isFuzzyMatch(
  userVal: string,
  validOptions: string[],
  knownTerms?: ReadonlySet<string>
): boolean {
  const u = normalize(userVal);
  if (!u) return false;

  // Spacing is the one thing a student can get wrong without writing a
  // different answer ("bluegreen algae" / "blue green algae").
  const squash = (s: string) => s.replace(/ /g, '');
  for (const opt of validOptions) {
    const o = normalize(opt);
    if (o && u !== o && squash(u) === squash(o)) return true;
  }

  if (knownTerms?.has(u)) return false;

  for (const opt of validOptions) {
    const o = normalize(opt);
    if (!o || u === o) continue;
    // A misspelling keeps the opening letter of the word; a different term
    // often starts elsewhere, and one letter can flip the meaning.
    if (u[0] !== o[0]) continue;
    const maxLen = Math.max(u.length, o.length);
    // Short answers have to be spelled out — one letter is most of the word.
    if (maxLen <= 4) continue;
    // One slip until the word is long enough to carry a second: two extra
    // letters at the front are how opposites are formed (aerobic / anaerobic).
    const threshold = maxLen <= 10 ? 1 : 2;
    if (editDistance(u, o) <= threshold) return true;
  }
  return false;
}

export function getPermutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of getPermutations(rest)) result.push([arr[i], ...perm]);
  }
  return result;
}
