import LibraryView from '@/components/LibraryView';
import { getLibrary } from '@/db/library';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const library = await getLibrary();
  return <LibraryView library={library} />;
}
