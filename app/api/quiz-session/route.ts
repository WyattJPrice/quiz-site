import { auth } from '@/lib/auth/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

type Kind = 'quiz' | 'learn';

const MAX_STATE_BYTES = 64 * 1024;

/**
 * Session storage was added after the original schema and the project has no
 * migration runner, so make sure the table exists before the first read/write.
 * Runs once per server process.
 */
const CREATE_SQL = `CREATE TABLE IF NOT EXISTS study_sessions (
  user_id uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  study_set_id uuid NOT NULL REFERENCES study_sets(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'quiz',
  state jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, study_set_id, kind)
)`;

function createTable(): Promise<void> {
  return getDb()
    .query(CREATE_SQL)
    .then(() => undefined);
}

let schemaReady: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    // A concurrent cold start may have created the table a moment earlier, so
    // retry once before giving up.
    schemaReady = createTable()
      .catch(() => createTable())
      .catch((err) => {
        schemaReady = null;
        throw err;
      });
  }
  return schemaReady;
}

function parseKind(value: string | null): Kind | null {
  if (value === null || value === 'quiz') return 'quiz';
  if (value === 'learn') return 'learn';
  return null;
}

async function setIdForSlug(slug: string): Promise<string | null> {
  const { rows } = await getDb().query<{ id: string }>(
    'SELECT id FROM study_sets WHERE slug = $1',
    [slug]
  );
  return rows[0]?.id ?? null;
}

export async function GET(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');
  const kind = parseKind(url.searchParams.get('kind'));
  if (!slug) {
    return Response.json({ error: 'slug is required' }, { status: 400 });
  }
  if (!kind) {
    return Response.json({ error: 'kind must be quiz or learn' }, { status: 400 });
  }

  try {
    await ensureSchema();
    const setId = await setIdForSlug(slug);
    if (!setId) {
      return Response.json({ error: 'Unknown quiz' }, { status: 404 });
    }
    const { rows } = await getDb().query<{ state: unknown }>(
      `SELECT state FROM study_sessions
       WHERE user_id = $1 AND study_set_id = $2 AND kind = $3`,
      [session.user.id, setId, kind]
    );
    return Response.json(
      { state: rows[0]?.state ?? null },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('session GET failed', err);
    return Response.json({ error: 'Failed to load progress' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { slug?: unknown; kind?: unknown; state?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const slug = typeof body.slug === 'string' ? body.slug : null;
  const kind = parseKind(typeof body.kind === 'string' ? body.kind : null);
  const state = body.state;
  if (!slug) {
    return Response.json({ error: 'slug is required' }, { status: 400 });
  }
  if (!kind) {
    return Response.json({ error: 'kind must be quiz or learn' }, { status: 400 });
  }
  if (!state || typeof state !== 'object' || Array.isArray(state)) {
    return Response.json({ error: 'state must be an object' }, { status: 400 });
  }

  let serialized: string;
  try {
    serialized = JSON.stringify(state);
  } catch {
    return Response.json({ error: 'state is not serializable' }, { status: 400 });
  }
  if (serialized.length > MAX_STATE_BYTES) {
    return Response.json({ error: 'state is too large' }, { status: 413 });
  }

  try {
    await ensureSchema();
    const setId = await setIdForSlug(slug);
    if (!setId) {
      return Response.json({ error: 'Unknown quiz' }, { status: 404 });
    }
    await getDb().query(
      `INSERT INTO study_sessions (user_id, study_set_id, kind, state, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, now())
       ON CONFLICT (user_id, study_set_id, kind) DO UPDATE
         SET state = EXCLUDED.state,
             updated_at = now()`,
      [session.user.id, setId, kind, serialized]
    );
    return Response.json({ ok: true });
  } catch (err) {
    console.error('session PUT failed', err);
    return Response.json({ error: 'Failed to save progress' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');
  const kind = parseKind(url.searchParams.get('kind'));
  if (!slug) {
    return Response.json({ error: 'slug is required' }, { status: 400 });
  }
  if (!kind) {
    return Response.json({ error: 'kind must be quiz or learn' }, { status: 400 });
  }

  try {
    await ensureSchema();
    const setId = await setIdForSlug(slug);
    if (!setId) {
      return Response.json({ error: 'Unknown quiz' }, { status: 404 });
    }
    await getDb().query(
      `DELETE FROM study_sessions
       WHERE user_id = $1 AND study_set_id = $2 AND kind = $3`,
      [session.user.id, setId, kind]
    );
    return Response.json({ ok: true });
  } catch (err) {
    console.error('session DELETE failed', err);
    return Response.json({ error: 'Failed to clear progress' }, { status: 500 });
  }
}
