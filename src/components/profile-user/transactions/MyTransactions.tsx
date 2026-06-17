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
  useGetAllUserTransaction
} from "@/hooks/useTransactions";
import { SortBy, SortOrder } from "@/types/pagination";
import { TransactionStatus, TransactionStatusFilter } from "@/types/transaction";
import { Calendar, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { parseAsInteger, parseAsStringEnum, useQueryState } from "nuqs";
import { useDebounceValue } from "usehooks-ts";
import TransactionCard from "./TransactionCardList";

const ITEMS_PER_PAGE = 4;

const FILTER_TABS: {
  key: TransactionStatusFilter;
  label: string;
  summaryKey?: "upcoming" | "activeGuests" | "completed" | "pending" | "cancelled";
}[] = [
  { key: "ALL", label: "All Bookings" },
  { key: "ONGOING", label: "Ongoing", summaryKey: "activeGuests" },
  { key: "UPCOMING", label: "Upcoming", summaryKey: "upcoming" },
  { key: "COMPLETED", label: "Completed", summaryKey: "completed" },
  { key: "PENDING", label: "Pending", summaryKey: "pending" },
  { key: "CANCELLED", label: "Cancelled", summaryKey: "cancelled" }
];

const TAB_TO_STATUS: Partial<Record<TransactionStatusFilter, TransactionStatus[]>> = {
  ONGOING:   [TransactionStatus.CONFIRMED],
  UPCOMING:  [
    TransactionStatus.CONFIRMED,
    TransactionStatus.WAITING_FOR_PAYMENT,
    TransactionStatus.WAITING_FOR_CONFIRMATION,
  ],
  COMPLETED: [
    TransactionStatus.COMPLETED,
    TransactionStatus.CANCELLED_BY_USER,
    TransactionStatus.CANCELLED_BY_TENANT,
    TransactionStatus.EXPIRED,
  ],
  PENDING: [
    TransactionStatus.WAITING_FOR_PAYMENT,
    TransactionStatus.WAITING_FOR_CONFIRMATION,
  ],
  CANCELLED: [  
    TransactionStatus.CANCELLED_BY_USER,
    TransactionStatus.CANCELLED_BY_TENANT,
    TransactionStatus.EXPIRED,
  ]
};

const MyTransactions = () => {
  const [activeTab, setActiveTab] = useQueryState(
    "activeTab",
    parseAsStringEnum<TransactionStatusFilter>([
      "ALL",
      "UPCOMING",
      "ONGOING",
      "COMPLETED",
      "PENDING",
    ]).withDefault("ALL"),
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsStringEnum<SortBy>(["createdAt", "propertyName"]).withDefault("createdAt"),
  );
  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    parseAsStringEnum<SortOrder>(["asc", "desc"]).withDefault("desc"),
  );
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const [debounceSearch] = useDebounceValue(search, 500);

  const tabConfig = FILTER_TABS.find((t) => t.key === activeTab)!;
  const statusParams = tabConfig.key === "ALL" ? undefined : TAB_TO_STATUS[tabConfig.key];

  const { data: userTransactions, isPending } = useGetAllUserTransaction({
    search: debounceSearch || undefined,
    page,
    take: ITEMS_PER_PAGE,
    sortBy,
    sortOrder,
    status: statusParams,
  });

  const transactions = userTransactions?.data ?? [];
  const meta = userTransactions?.meta;
  const summary = userTransactions?.summary;

  const tabCount = (tab: (typeof FILTER_TABS)[number]): number => {
    if (tab.key === "ALL") return  summary?.totalTransactions ?? 0;
    if (tab.key === "UPCOMING") return 0;
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

  return (
    <main className="flex-1 px-4 py-6 pb-10 sm:px-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold sm:text-3xl">
              My Bookings
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your reservations — {summary?.totalTransactions ?? 0} total
            </p>
          </div>
        </div>
        <div className="mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2 pb-1 w-max sm:w-auto">
            {FILTER_TABS.map((tab) => {
              const count = tabCount(tab);
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all sm:px-4 ${
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
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm lg:flex-row lg:items-center lg:gap-4">
          <div className="relative w-full min-w-0 lg:flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search property or booking ID"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="block w-full min-w-0 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Sort:</span>
            </div>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
              <SelectTrigger className="h-9 w-[140px] rounded-xl text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="propertyName">Property</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
              <SelectTrigger className="h-9 w-[120px] rounded-xl text-sm">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">A-Z</SelectItem>
                <SelectItem value="asc">Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

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
            <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center sm:p-12">
              <Calendar className="mx-auto h-10 w-10 text-muted-foreground/40 sm:h-12 sm:w-12" />
              <h3 className="mt-4 text-base font-heading font-bold sm:text-lg">
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
                key={t.id}
                transaction={t}
              />
            ))
          )}
        </div>
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