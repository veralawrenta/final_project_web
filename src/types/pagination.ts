
export interface PaginationMeta {
  page: number;
  take: number;
  total: number;
  totalPages?: number;
}

export interface PageableResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationQueryParams {
  take?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: string;
}

export type SortOrder = "asc" | "desc";

export type SortBy = "createdAt" | "propertyName";
export type TransactionSortBy = "propertyName" | "paymentDate";
