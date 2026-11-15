import { auth } from '@/lib/auth/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface Entry {
  firstName: string;
  count: number;
  you?: boolean;
}

export async function GET() {
  const db = getDb();
  const { data: session } = await auth.getSession();

  const totals = await db.query<{ total: string; students: string }>(
    'SELECT COALESCE(SUM(questions_answered), 0)::bigint AS total, COUNT(*)::bigint AS students FROM user_stats'
  );
  const top = await db.query<{ user_id: string; first_name: string; questions_answered: string }>(
    `SELECT st.user_id, split_part(u.name, ' ', 1) AS first_name, st.questions_answered
     FROM user_stats st
     JOIN neon_auth.user u ON u.id = st.user_id
     ORDER BY st.questions_answered DESC, u.name ASC
     LIMIT 50`
  );

  let you: { count: number; rank: number } | null = null;
  if (session?.user) {
    const mine = await db.query<{ questions_answered: string; rank: string }>(
      `SELECT st.questions_answered,
              (SELECT COUNT(*)::bigint + 1 FROM user_stats s2
               WHERE s2.questions_answered > st.questions_answered) AS rank
       FROM user_stats st
       WHERE st.user_id = $1`,
      [session.user.id]
    );
    const row = mine.rows[0];
    if (row) {
      you = { count: Number(row.questions_answered), rank: Number(row.rank) };
    }
  }

  const entries: Entry[] = top.rows.map((r) => ({
    firstName: r.first_name || 'Player',
    count: Number(r.questions_answered),
    you: session?.user?.id === r.user_id || undefined,
  }));

  return Response.json({
    entries,
    communityTotal: Number(totals.rows[0]?.total ?? 0),
    students: Number(totals.rows[0]?.students ?? 0),
    you,
  });
}
