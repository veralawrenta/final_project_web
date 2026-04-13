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
import { formatCurrency } from "@/lib/price/currency";
import { TransactionStatus } from "@/types/transaction";
import { differenceInCalendarDays, format, startOfDay } from "date-fns";
import {
  ArrowUpRight,
  BedDouble,
  Calendar,
  CalendarCheck,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Clock,
  MapPin,
  Search,
} from "lucide-react";
import Link from "next/link";
import { parseAsInteger, parseAsStringEnum, useQueryState } from "nuqs";
import { ElementType } from "react";
import { useDebounceValue } from "usehooks-ts";

type SortBy = "createdAt" | "propertyName";
type SortOrder = "asc" | "desc";
type FilterBy =
  | "all"
  | "upcoming"
  | "ongoing"
  | "completed"
  | "cancelled"
  | "pending";

const FILTER_TABS: {
  key: FilterBy;
  label: string;
  icon: ElementType;
  status?: TransactionStatus;
  summaryKey?: "upcoming" | "ongoing" | "completed" | "cancelled" | "pending";
}[] = [
  { key: "all", label: "All", icon: Calendar, status: undefined },
  {
    key: "upcoming",
    label: "Upcoming",
    icon: CalendarClock,
    status: TransactionStatus.CONFIRMED,
    summaryKey: "upcoming",
  },
  {
    key: "ongoing",
    label: "Ongoing",
    icon: CalendarCheck,
    status: TransactionStatus.CONFIRMED,
    summaryKey: "ongoing",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    icon: CircleX,
    status:
      TransactionStatus.CANCELLED_BY_USER ||
      TransactionStatus.CANCELLED_BY_TENANT,
    summaryKey: "cancelled",
  },
  {
    key: "pending",
    label: "Pending",
    icon: Clock,
    status:
      TransactionStatus.WAITING_FOR_PAYMENT ||
      TransactionStatus.WAITING_FOR_CONFIRMATION,
    summaryKey: "pending",
  },
];

const STATUS_STYLE: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  WAITING_FOR_PAYMENT: {
    label: "Awaiting Payment",
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  WAITING_FOR_CONFIRMATION: {
    label: "Pending Confirmation",
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  CANCELLED_BY_USER: {
    label: "Cancelled By You",
    color: "text-red-600",
    bg: "bg-red-100",
  },
  CANCELLED_BY_TENANT: {
    label: "Cancelled By Property Tenant",
    color: "text-red-600",
    bg: "bg-red-100",
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "text-green-600",
    bg: "bg-green-100",
  },
  COMPLETED: { label: "Completed", color: "text-cyan-600", bg: "bg-cyan-100" },
  EXPIRED: { label: "Expired", color: "text-zinc-500", bg: "bg-zinc-100" },
};

const MyBookings = () => {
  const [activeTab, setActiveTab] = useQueryState(
    "activeTab",
    parseAsStringEnum<FilterBy>([
      "all",
      "upcoming",
      "ongoing",
      "completed",
      "pending",
      "cancelled",
    ]).withDefault("all")
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsStringEnum<SortBy>(["createdAt", "propertyName"]).withDefault(
      "createdAt"
    )
  );
  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    parseAsStringEnum<SortOrder>(["asc", "desc"]).withDefault("desc")
  );

  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const [debounceSearch] = useDebounceValue(search, 500);

  const tabConfig = FILTER_TABS.find((t) => t.key === activeTab)!;
  const statusParams = tabConfig.status;

  const { data: userTransactions, isPending } = useGetAllUserTransaction({
    search: debounceSearch,
    page,
    take: 8,
    sortBy,
    sortOrder,
    status: statusParams,
  });

  const { mutate: cancelBooking, isPending: isCancelling } =
    useCancelTransactionByUser();

  const tabCount = (tab: (typeof FILTER_TABS)[number]) => {
    if (tab.key === "all") return meta?.total ?? 0;
    if (!tab.summaryKey) return 0;
    return summary?.[tab.summaryKey] ?? 0;
  };

  const transactions = userTransactions?.data ?? [];
  const meta = userTransactions?.meta;
  const summary = userTransactions?.summary;

  const handleSearch = (value: string) => {
    setSearch(value);
    if (page !== 1) setPage(1);
  };

  const handleTabChange = (tab: FilterBy) => {
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
        <div>
          <h1 className="text-3xl font-heading font-bold">My Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage all your reservations —{" "}
            <span className="font-medium text-foreground">
              {meta?.total ?? 0}
            </span>{" "}
            total bookings
          </p>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Upcoming",
              value: summary?.upcoming ?? 0,
              icon: CalendarClock,
              color: "text-blue-500",
              bg: "bg-blue-500/10",
            },
            {
              label: "Ongoing",
              value: summary?.ongoing ?? 0,
              icon: CalendarCheck,
              color: "text-green-500",
              bg: "bg-green-500/10",
            },
            {
              label: "Cancelled",
              value: summary?.cancelled ?? 0,
              icon: CircleX,
              color: "text-red-500",
              bg: "bg-red-500/10",
            },
            {
              label: "Awaiting Payment",
              value: summary?.waitingForPayment ?? 0,
              icon: Clock,
              color: "text-yellow-500",
              bg: "bg-yellow-500/10",
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3"
            >
              <div
                className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center ${color} shrink-0`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-heading font-bold">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search property or booking ID…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as SortBy)}
            >
              <SelectTrigger className="h-10 w-[140px] rounded-xl text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Booked</SelectItem>
                <SelectItem value="propertyName">Property Name</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortOrder}
              onValueChange={(v) => setSortOrder(v as SortOrder)}
            >
              <SelectTrigger className="h-10 w-[130px] rounded-xl text-sm">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest first</SelectItem>
                <SelectItem value="asc">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => {
            const Icon = tab.icon;
            const count = tabCount(tab);
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
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

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing {transactions.length} of {meta?.total ?? 0} bookings
        </p>

        {/* Booking cards */}
        {isPending ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-2xl border border-border bg-card animate-pulse"
              />
            ))}
          </div>
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
          <div className="space-y-4">
            {transactions.map((t) => {
              const nights = differenceInCalendarDays(
                startOfDay(t.checkOut),
                startOfDay(t.checkIn)
              );
              // Backend returns room.property.propertyImages[0]?.urlImages
              const image = t.room.property.propertyImages?.urlImages[0];
              const statusCfg = STATUS_STYLE[t.status] ?? {
                label: t.status,
                color: "text-gray-500",
                bg: "bg-gray-100",
              };
              const canCancel =
                t.status === TransactionStatus.WAITING_FOR_PAYMENT &&
                !t.paymentDate;

              return (
                <div
                  key={t.transactionId}
                  className="group flex flex-col sm:flex-row gap-0 overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
                >
                  {/* Property image */}
                  <div className="relative h-40 sm:h-auto sm:w-44 shrink-0 overflow-hidden bg-muted">
                    {image ? (
                      <img
                        src={image}
                        alt={t.room.property.propertyName}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <BedDouble className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col justify-between gap-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-heading font-bold text-base truncate">
                            {t.room.property.propertyName}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${statusCfg.bg} ${statusCfg.color}`}
                          >
                            {statusCfg.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {t.room.roomName}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">
                            {t.room.property.address}
                          </span>
                        </div>
                      </div>

                      {/* View details link */}
                      <Link
                        href={`/bookings/${t.transactionId}`}
                        className="shrink-0 p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                      {/* Dates */}
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Check-in
                          </p>
                          <p className="font-medium">
                            {format(t.checkIn, "dd-MM-yyyy")}
                          </p>
                        </div>
                        <div className="h-px w-6 bg-border" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Check-out
                          </p>
                          <p className="font-medium">
                            {format(t.checkOut, "dd-MM-yyyy")}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {nights} night{nights !== 1 ? "s" : ""}
                        </div>
                      </div>

                      {/* Price + actions */}
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="font-heading font-bold text-base">
                            {formatCurrency(t.totalPrice)}
                          </p>
                        </div>

                        {/* Upload proof — only for WAITING_FOR_PAYMENT + BANK_TRANSFER */}
                        {t.status === TransactionStatus.WAITING_FOR_PAYMENT &&
                          !t.paymentDate && (
                            <Button
                              asChild
                              size="sm"
                              className="rounded-xl text-xs h-8"
                            >
                              <Link
                                href={`/bookings/${t.transactionId}/payment`}
                              >
                                Pay Now
                              </Link>
                            </Button>
                          )}

                        {/* Cancel — only WAITING_FOR_PAYMENT, no paymentDate */}
                        {canCancel && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isCancelling}
                            onClick={() => cancelBooking(t.transactionId)}
                            className="rounded-xl text-xs h-8 border-destructive/40 text-destructive hover:bg-destructive/10"
                          >
                            {isCancelling ? "Cancelling…" : "Cancel"}
                          </Button>
                        )}

                        {/* Review — only for completed bookings */}
                        {t.status === TransactionStatus.CONFIRMED &&
                          new Date(t.checkOut) < new Date() && (
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="rounded-xl text-xs h-8"
                            >
                              <Link
                                href={`/bookings/${t.transactionId}/review`}
                              >
                                Leave Review
                              </Link>
                            </Button>
                          )}
                      </div>
                    </div>

                    {/* Booking ID */}
                    <p className="text-[10px] text-muted-foreground font-mono">
                      Booking ID: {t.transactionId}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.total > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {meta.total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {/* Page number pills */}
              {Array.from({ length: meta.total }, (_, i) => i + 1)
                .filter(
                  (p) => p === 1 || p === meta.total || Math.abs(p - page) <= 1
                )
                .reduce<(number | "…")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="px-2 py-1 text-sm text-muted-foreground"
                    >
                      …
                    </span>
                  ) : (
                    <Button
                      key={p}
                      variant={page === p ? "default" : "outline"}
                      size="sm"
                      className="rounded-xl w-9"
                      onClick={() => handlePageChange(p as number)}
                    >
                      {p}
                    </Button>
                  )
                )}
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                disabled={page >= meta.total}
                onClick={() => handlePageChange(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default MyBookings;
