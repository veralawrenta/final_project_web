import {
  TransactionManagementPayload,
  Transactions,
  TransactionSummary,
} from "./transaction";

export interface PaginationMeta {
  page: number;
  take: number;
  total: number;
  totalPages?: number;
  pending?: number;
  reviewed?: number;
  averageRating?: number;
}

export interface PageableResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface TenantTransactionResponse extends PageableResponse<TransactionManagementPayload> {
  summary: TransactionSummary;
}

export interface UserTransactionResponse extends PageableResponse<Transactions> {
  summary?: TransactionSummary;
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
