import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { quizzes, getQuiz } from '@/data';
import QuizEngine from '@/components/QuizEngine';

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
  return { title: quiz ? `${quiz.title} — Study Site` : 'Study Site' };
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const quiz = getQuiz(slug);
  if (!quiz) notFound();

  return (
    <div className="container">
      <Link className="back-link" href="/">
        ← All Quizzes
      </Link>

      <header className="header">
        <span className="subtitle">Test Mode</span>
        <div className="title">{quiz.title}</div>
      </header>

      <QuizEngine questions={quiz.questions} />
    </div>
  );
}
