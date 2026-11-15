import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { quizzes, getQuiz } from '@/data';
import LearnEngine from '@/components/LearnEngine';

export async function generateStaticParams() {
  return quizzes.map((q) => ({ slug: q.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const quiz = getQuiz(slug);
  return { title: quiz ? `Learn — ${quiz.title} — Study Site` : 'Study Site' };
}

export default async function LearnPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const quiz = getQuiz(slug);
  if (!quiz) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-6 pt-8 pb-20">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        All Quizzes
      </Link>

      <header className="mt-6 mb-8">
        <span className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Learn Mode
        </span>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{quiz.title}</h1>
      </header>

      <LearnEngine questions={quiz.questions} slug={quiz.slug} />
    </div>
  );
}
