const DEFAULT_PAGE_SIZE = 1000;

type PagedResult<T> = PromiseLike<{ data: T[] | null; error: { message: string } | null }>;

/**
 * Fetches all rows from a PostgREST query (Supabase default cap is 1000 per request).
 */
export async function fetchAllPaged<T>(
  buildQuery: (from: number, to: number) => PagedResult<T>,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<{ data: T[]; error: Error | null }> {
  const rows: T[] = [];
  let from = 0;

  for (;;) {
    const to = from + pageSize - 1;
    const { data, error } = await buildQuery(from, to);
    if (error) {
      return { data: rows, error: new Error(error.message) };
    }
    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < pageSize) break;
    from += pageSize;
  }

  return { data: rows, error: null };
}
