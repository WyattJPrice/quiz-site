export type LibrarySource = 'database' | 'bundled';

export interface SubjectSummary {
  id: string;
  name: string;
  slug: string;
  iconKey: string | null;
  sortOrder: number | null;
  setCount: number;
  questionCount: number;
}

export interface StudySetSummary {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  subjectId: string;
  subjectName: string;
  subjectSlug: string;
  subjectIconKey: string | null;
  iconKey: string | null;
  questionCount: number;
  /** ISO timestamp. Newest sets are ordered first everywhere. */
  createdAt: string;
  /** Scheduled test date as YYYY-MM-DD, or null when nothing is scheduled. */
  testAt: string | null;
  testCompletedAt: string | null;
  /** Distinct question categories, used for search. */
  topics: string[];
}

export interface LibraryStats {
  studySets: number;
  questions: number;
  subjects: number;
}

export interface LibraryData {
  subjects: SubjectSummary[];
  sets: StudySetSummary[];
  stats: LibraryStats;
  source: LibrarySource;
  /** True when DATABASE_URL is set but the query failed. */
  databaseError: boolean;
}
