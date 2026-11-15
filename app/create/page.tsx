import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import { getSubjects } from '@/lib/content';
import SetBuilder from '@/components/SetBuilder';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Create Set — Study Site' };

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect('/');
  const [subjects, params] = await Promise.all([getSubjects(), searchParams]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pt-8 pb-20">
      <header className="mb-8">
        <span className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Admin
        </span>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          {params.id ? 'Edit study set' : 'Create a study set'}
        </h1>
      </header>

      <SetBuilder subjects={subjects} editId={params.id} />
    </div>
  );
}
