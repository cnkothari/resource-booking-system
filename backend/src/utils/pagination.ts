export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  search: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Normalise raw query-string values into safe pagination params.
 */
export const parsePagination = (query: Record<string, unknown>): PaginationParams => {
  const rawPage = Number(query.page);
  const rawLimit = Number(query.limit);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.floor(rawLimit), MAX_LIMIT)
      : DEFAULT_LIMIT;

  const search = typeof query.search === 'string' ? query.search.trim() : '';

  return { page, limit, skip: (page - 1) * limit, search };
};

export const buildPaginatedResult = <T>(
  data: T[],
  total: number,
  params: PaginationParams,
): PaginatedResult<T> => ({
  data,
  pagination: {
    page: params.page,
    limit: params.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / params.limit)),
  },
});
