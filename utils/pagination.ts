export interface PaginationMeta {
  totalPages: number;
  currentPage: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export function computePaginationMeta(total: number, page: number, pageSize: number): PaginationMeta {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const currentPage = Math.min(Math.max(1, Math.floor(page)), totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  return { totalPages, currentPage, hasPrev, hasNext };
}


