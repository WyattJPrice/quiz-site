import LibraryView from '@/components/LibraryView';
import { getLibrary } from '@/db/library';
import { getLastStudied, getLeaderboard } from '@/db/stats';
import { currentUser } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const user = await currentUser();

  const [library, leaderboard, lastStudied] = await Promise.all([
    getLibrary(),
    getLeaderboard(user?.id),
    getLastStudied(user?.id),
  ]);

  return (
    <LibraryView
      library={library}
      leaderboard={leaderboard}
      lastStudied={lastStudied}
      user={
        user
          ? { id: user.id, displayName: user.displayName, name: user.name, image: user.image }
          : null
      }
    />
  );
}
