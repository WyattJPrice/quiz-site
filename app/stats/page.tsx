import type { Metadata } from 'next';
import StatsView, { type SetMeta } from '@/components/StatsView';
import { getLibrary } from '@/db/library';
import { getUserStats } from '@/db/stats';
import { currentUser } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your stats — Study Library',
  description: 'Correct answers, accuracy and recent sets for your account.',
};

export default async function StatsPage() {
  const user = await currentUser();

  const [stats, library] = await Promise.all([
    user ? getUserStats(user.id) : Promise.resolve(null),
    getLibrary(),
  ]);

  const setMeta: Record<string, SetMeta> = Object.fromEntries(
    library.sets.map((set) => [set.slug, { title: set.title, subject: set.subjectName }]),
  );

  return (
    <StatsView
      serverStats={stats}
      setMeta={setMeta}
      user={
        user
          ? { id: user.id, displayName: user.displayName, name: user.name, image: user.image }
          : null
      }
    />
  );
}
