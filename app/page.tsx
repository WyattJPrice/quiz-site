import { getStudySets } from '@/lib/content';
import { getAdminSession } from '@/lib/admin';
import HomeGrid, { type QuizItem } from '@/components/HomeGrid';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [sets, adminSession] = await Promise.all([getStudySets(), getAdminSession()]);
  // Pass lightweight metadata only — question payloads stay on the server
  const items: QuizItem[] = sets.map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    description: s.description,
    section: s.section,
    count: s.count,
    testDate: s.testDate ?? undefined,
  }));

  return <HomeGrid items={items} isAdmin={!!adminSession} />;
}
