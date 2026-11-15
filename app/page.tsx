import { quizzes } from '@/data';
import HomeGrid, { type QuizItem } from '@/components/HomeGrid';

export default function HomePage() {
  // Pass lightweight metadata only — question payloads stay on the server
  const items: QuizItem[] = quizzes.map((q) => ({
    slug: q.slug,
    title: q.title,
    description: q.description,
    section: q.section ?? 'Other',
    count: q.questions.length,
    testDate: q.testDate,
  }));

  return <HomeGrid items={items} />;
}
