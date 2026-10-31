/** Versioned snapshot access. The caller must serialize its in-memory mutations. */
export interface SnapshotRow { data: unknown; revision: string | number }
export type SnapshotQuery = (statement: string, params: unknown[]) => Promise<SnapshotRow[]>;

export class SnapshotConflictError extends Error {
  constructor() { super('The database state changed before this update could be saved.'); this.name = 'SnapshotConflictError'; }
}

export interface Snapshot<T> { data: T; revision: number }

function parseRevision(value: string | number): number {
  const revision = Number(value);
  if (!Number.isSafeInteger(revision) || revision < 0) throw new Error('Invalid database snapshot revision.');
  return revision;
}

export async function readSnapshot<T>(query: SnapshotQuery): Promise<Snapshot<T>> {
  const rows = await query('SELECT data, revision FROM paiso_state WHERE id = $1', [1]);
  if (rows.length !== 1 || !rows[0].data || typeof rows[0].data !== 'object' || Array.isArray(rows[0].data)) {
    throw new Error('Database snapshot is missing or invalid.');
  }
  return { data: rows[0].data as T, revision: parseRevision(rows[0].revision) };
}

export async function commitSnapshot<T extends object>(query: SnapshotQuery, expectedRevision: number, data: T): Promise<number> {
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0 || !data || Array.isArray(data)) {
    throw new Error('Invalid snapshot update.');
  }
  const rows = await query(
    'UPDATE paiso_state SET data = $1::jsonb, revision = revision + 1 WHERE id = $2 AND revision = $3 RETURNING data, revision',
    [JSON.stringify(data), 1, expectedRevision],
  );
  if (rows.length === 0) throw new SnapshotConflictError();
  if (rows.length !== 1) throw new Error('Invalid database update result.');
  const revision = parseRevision(rows[0].revision);
  if (revision !== expectedRevision + 1) throw new Error('Unexpected database revision.');
  return revision;
}
