import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import QuizEngine from '@/components/QuizEngine';
import { getStudySet } from '@/db/library';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const set = await getStudySet(slug);
  return { title: set ? `${set.title} — Study Library` : 'Study Library' };
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const set = await getStudySet(slug);
  if (!set) notFound();

  return (
    <>
      <ThemeToggle />
      <div className="container">
        <Link className="back-link" href="/">
          ← Study library
        </Link>

        <header className="header">
          <span className="subtitle">{set.section} · Test Mode</span>
          <div className="title">{set.title}</div>
        </header>

        <QuizEngine questions={set.questions} />
      </div>
    </>
  );
}
