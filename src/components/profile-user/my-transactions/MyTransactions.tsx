"use client"
import PaginationSection from "@/components/PaginationSection";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCancelTransactionByUser,
  useGetAllUserTransaction,
} from "@/hooks/useTransactions";
import { TransactionStatus, TransactionStatusFilter } from "@/types/transaction";
import { Calendar, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { parseAsInteger, parseAsStringEnum, useQueryState } from "nuqs";
import { useDebounceValue } from "usehooks-ts";
import TransactionCard from "./TransactionCard";
import { SortBy, SortOrder } from "@/types/pagination";

const ITEMS_PER_PAGE = 4;

const FILTER_TABS: {
  key: TransactionStatusFilter;
  label: string;
  summaryKey?: "upcoming" | "pending" | "ongoing" | "completed" | "cancelled";
}[] = [
  { key: "all", label: "All Bookings" },
  { key: "pending", label: "Pending", summaryKey: "pending" },
  { key: "ongoing", label: "Ongoing", summaryKey: "ongoing" },
  { key: "upcoming", label: "Upcoming", summaryKey: "upcoming" },
  { key: "completed", label: "Completed", summaryKey: "completed" },
  { key: "cancelled", label: "Cancelled", summaryKey: "cancelled" },
];

const TAB_TO_STATUS: Partial<Record<TransactionStatusFilter, TransactionStatus>> = {
  pending:   TransactionStatus.WAITING_FOR_PAYMENT || TransactionStatus.WAITING_FOR_CONFIRMATION,
  ongoing:   TransactionStatus.CONFIRMED,
  upcoming:  TransactionStatus.CONFIRMED,
  completed: TransactionStatus.COMPLETED,
  cancelled: TransactionStatus.CANCELLED_BY_USER || TransactionStatus.CANCELLED_BY_TENANT || TransactionStatus.EXPIRED,
};

const MyTransactions = () => {
  const [activeTab, setActiveTab] = useQueryState(
    "activeTab",
    parseAsStringEnum<TransactionStatusFilter>([
      "all",
      "upcoming",
      "ongoing",
      "completed",
      "pending",
      "cancelled",
    ]).withDefault("all"),
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsStringEnum<SortBy>(["createdAt", "propertyName"]).withDefault(
      "createdAt",
    ),
  );
  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    parseAsStringEnum<SortOrder>(["asc", "desc"]).withDefault("desc"),
  );
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const [debounceSearch] = useDebounceValue(search, 500);

  const tabConfig = FILTER_TABS.find((t) => t.key === activeTab)!;
  const statusParams = tabConfig.key === "all" ? undefined : TAB_TO_STATUS[tabConfig.key];

  const { data: userTransactions, isPending } = useGetAllUserTransaction({
    search: debounceSearch || undefined,
    page,
    take: ITEMS_PER_PAGE,
    sortBy,
    sortOrder,
    status: statusParams,
  });

  const { mutate: cancelTransaction, isPending: isCancelling } =
    useCancelTransactionByUser();

  const transactions = userTransactions?.data ?? [];
  const meta = userTransactions?.meta;
  const summary = userTransactions?.summary;

  // Tab counts come from backend summary; "all" and "upcoming" use meta/totalTransactions
  const tabCount = (tab: (typeof FILTER_TABS)[number]): number => {
    if (tab.key === "all") return summary?.all ?? 0;
    if (tab.key === "upcoming") return 0; // backend doesn't return upcoming count separately
    if (!tab.summaryKey) return 0;
    return summary?.[tab.summaryKey] ?? 0;
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    if (page !== 1) setPage(1);
  };
  const handleTabChange = (tab: TransactionStatusFilter) => {
    setActiveTab(tab);
    setPage(1);
  };
  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="flex-1 px-4 py-6 pb-10 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">My Bookings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your reservations — {summary?.all ?? 0} total
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => {
            const count = tabCount(tab);
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {tab.label}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-md ${
                    isActive ? "bg-primary-foreground/20" : "bg-secondary"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search property or booking ID"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Sort:</span>
            </div>
            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as SortBy)}
            >
              <SelectTrigger className="h-9 w-[150px] rounded-xl text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="propertyName">Property Name</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortOrder}
              onValueChange={(v) => setSortOrder(v as SortOrder)}
            >
              <SelectTrigger className="h-9 w-[130px] rounded-xl text-sm">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest first</SelectItem>
                <SelectItem value="asc">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Showing {transactions.length} of {meta?.total ?? 0} bookings
          </p>

          {isPending ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-2xl border border-border bg-card animate-pulse"
              />
            ))
          ) : transactions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 text-lg font-heading font-bold">
                No bookings found
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your filters or search query.
              </p>
              <Button asChild variant="outline" className="mt-4 rounded-xl">
                <Link href="/">Explore properties</Link>
              </Button>
            </div>
          ) : (
            transactions.map((t) => (
              <TransactionCard
                key={t.transactionId}
                transaction={t}
                onCancel={() => cancelTransaction(t.transactionId)}
                isCancellable={isCancelling}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {!!userTransactions?.meta && (
          <PaginationSection
            meta={userTransactions.meta}
            onChangePage={(p) => setPage(p)}
          />
        )}
      </div>
    </main>
  );
};

export default MyTransactions;
