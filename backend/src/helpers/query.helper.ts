export interface ParsedQuery {
  skip: number;
  take: number;
  page: number;
  limit: number;
  orderBy: Record<string, 'asc' | 'desc'>;
  search?: string;
}

export const parseQueryParams = (query: any, defaultSortField = 'createdAt'): ParsedQuery => {
  const page = Math.max(1, parseInt(query.page as string, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit as string, 10) || 10)); // Cap limit at 100
  const skip = (page - 1) * limit;

  const sortBy = (query.sortBy as string) || defaultSortField;
  const sortOrder = (query.sortOrder as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc';

  const search = (query.search as string)?.trim();

  return {
    skip,
    take: limit,
    page,
    limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    ...(search && { search }),
  };
};

export const getPaginationMeta = (totalItems: number, page: number, limit: number) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    page,
    limit,
    total: totalItems,
    pages: totalPages,
  };
};
