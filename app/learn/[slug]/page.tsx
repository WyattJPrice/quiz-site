import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import GuestSync from '@/components/GuestSync';
import LearnEngine from '@/components/LearnEngine';
import { getStudySet } from '@/db/library';
import { getProgressForSlug } from '@/db/stats';
import { currentUser } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const set = await getStudySet(slug);
  return { title: set ? `Learn · ${set.title} — Study Library` : 'Study Library' };
}

export default async function LearnPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const set = await getStudySet(slug);
  if (!set) notFound();

  const user = await currentUser();
  const saved = user ? await getProgressForSlug(user.id, slug) : null;

  return (
    <>
      <GuestSync signedIn={Boolean(user)} />
      <ThemeToggle />
      <div className="container">
        <Link className="back-link" href="/">
          ← Study library
        </Link>

        <header className="header">
          <span className="subtitle">{set.section} · Learn Mode</span>
          <div className="title">{set.title}</div>
        </header>

        <LearnEngine
          questions={set.questions}
          slug={set.slug}
          signedIn={Boolean(user)}
          savedProgress={saved?.state ?? null}
          savedAt={saved ? saved.updatedAt.toISOString() : null}
        />
      </div>
    </>
  );
}
