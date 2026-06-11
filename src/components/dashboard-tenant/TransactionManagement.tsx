"use client"
import { useGetAllTenantTransactions } from "@/hooks/useTenantTransactions";
import { formatCurrency } from "@/lib/price/currency";
import { SortOrder, TransactionSortBy } from "@/types/pagination";
import { Transactions, TransactionStatusFilter } from "@/types/transaction";
import {
  AlertTriangle,
  Calendar,
  CalendarDays,
  Clock,
  DollarSign,
  LayoutList,
  Search,
  Users,
} from "lucide-react";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { useDebounceValue } from "usehooks-ts";
import { SortSelect } from "../SortSelect";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import TransactionCalendar from "./transactions/TransactionCalendar";
import TransactionList from "./transactions/TransactionList";

type ViewModeType = "calendar" | "list";

const TransactionManagement = ({
  onViewTransaction,
  initialFilter,
}: {
  onViewTransaction?: (transactions: Transactions) => void;
  initialFilter?: string;
}) => {
  const [activeStatus, setActiveStatus] = useState<TransactionStatusFilter>(
    ["pending", "ongoing", "confirmed", "completed", "cancelled"].includes(
      initialFilter ?? "",
    )
      ? (initialFilter as TransactionStatusFilter)
      : "all",
  );
  const [viewMode, setViewMode] = useQueryState(
    "viewMode",
    parseAsStringEnum<ViewModeType>(["calendar", "list"]).withDefault("list"),
  );
  const [searchQuery, setSearchQuery] = useQueryState(
    "searchQuery",
    parseAsString.withDefault(""),
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsStringEnum<TransactionSortBy>([
      "paymentDate",
      "propertyName",
    ]).withDefault("paymentDate"),
  );
  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    parseAsStringEnum<SortOrder>(["asc", "desc"]).withDefault("desc"),
  );
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [cancelTarget, setCancelTarget] = useState<Transactions | null>(null);

  const [debounceSearch] = useDebounceValue(searchQuery, 500);

  const { data: transactionData, isPending } = useGetAllTenantTransactions({
    page,
    take: 8,
    search: debounceSearch,
    status: activeStatus,
    sortBy,
    sortOrder,
  });

  const filteredTransactions = transactionData?.data
    .filter((t) => {
      const matchesStatus = activeStatus === "all" || t.status === activeStatus;
      const matchesSearch =
        !searchQuery ||
        t.user.firstName.includes(searchQuery) ||
        t.room.property.propertyName.includes(searchQuery) ||
        t.transactionId.includes(searchQuery);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const diff =
        new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime();
      return sortBy === "paymentDate" ? -diff : diff;
    });

  const statusOptions: {
    key: TransactionStatusFilter;
    label: string;
    count: number;
  }[] = [
    {
      key: "all",
      label: "All Transactions",
      count: transactionData?.summary?.totalTransactions ?? 0,
    },
    {
      key: "pending",
      label: "Pending",
      count: transactionData?.summary?.pending ?? 0,
    },
    {
      key: "ongoing",
      label: "Ongoing",
      count: transactionData?.summary?.activeGuests ?? 0,
    },
    {
      key: "completed",
      label: "Completed",
      count: transactionData?.summary?.completed ?? 0,
    },
    {
      key: "cancelled",
      label: "Cancelled",
      count: transactionData?.summary?.cancelled ?? 0,
    },
    {
      key: "upcoming",
      label: "Upcoming",
      count: transactionData?.summary?.upcoming ?? 0,
    },
  ];

  const totalIncome = transactionData?.summary?.totalIncome ?? 0;

  const pendingCount = transactionData?.summary?.pending ?? 0;


  if (isPending) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="h-8 w-56 bg-muted rounded-xl" />
            <div className="h-4 w-72 bg-muted rounded-lg mt-2" />
          </div>
          <div className="h-10 w-32 bg-muted/60 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`stat-sk-${i}`} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted/60 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-16 bg-muted rounded" />
                  <div className="h-5 w-20 bg-muted/80 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 p-4 border border-border bg-muted/10 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-muted/60 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/4 bg-muted rounded" />
            <div className="h-3 w-1/2 bg-muted/60 rounded" />
          </div>
          <div className="h-8 w-24 bg-muted rounded-xl shrink-0" />
        </div>

        {viewMode === "list" ? (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="h-10 flex-1 bg-card border border-border rounded-xl" />
              <div className="h-10 w-full md:w-[200px] bg-card border border-border rounded-xl" />
              <div className="h-10 w-full md:w-[200px] bg-card border border-border rounded-xl" />
            </div>
            <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`row-sk-${i}`} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 bg-muted/60 rounded-xl shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-1/3 bg-muted rounded" />
                      <div className="h-3 w-1/4 bg-muted/60 rounded" />
                    </div>
                  </div>
                  <div className="h-4 w-20 bg-muted rounded hidden sm:block" />
                  <div className="h-8 w-8 bg-muted rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/5">
              <div className="h-6 w-32 bg-muted rounded-lg" />
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-muted rounded-lg" />
                <div className="h-8 w-8 bg-muted rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={`cal-sk-${i}`}
                  className="min-h-[100px] border-b border-r border-border p-2 flex flex-col justify-between bg-muted/5"
                >
                  <div className="h-4 w-5 bg-muted rounded" />
                  <div className="space-y-1 mt-2">
                    {i % 4 === 0 && (
                      <div className="h-3.5 w-11/12 bg-primary/10 rounded-sm border-l-2 border-primary/30" />
                    )}
                    {i % 7 === 0 && (
                      <div className="h-3.5 w-4/5 bg-status-pending/10 rounded-sm border-l-2 border-status-pending/30" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">
            Booking Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all reservations across your properties
          </p>
        </div>
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              viewMode === "list"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutList className="h-4 w-4" /> List
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              viewMode === "calendar"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarDays className="h-4 w-4" /> Calendar
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Transactions",
            value: transactionData?.summary.totalTransactions,
            icon: Calendar,
            color: "text-primary",
            bg: "bg-primary/10",
            target: "all" as TransactionStatusFilter,
          },
          {
            label: "Total Income",
            value: formatCurrency(totalIncome),
            icon: DollarSign,
            color: "text-status-confirmed",
            bg: "bg-status-confirmed/10",
            target: "all" as TransactionStatusFilter,
          },
          {
            label: "Pending",
            value: transactionData?.summary.pending,
            icon: Clock,
            color: "text-status-pending",
            bg: "bg-status-pending/10",
            target: "pending" as TransactionStatusFilter,
          },
          {
            label: "Active Guests",
            value: transactionData?.summary.activeGuests,
            icon: Users,
            color: "text-primary",
            bg: "bg-primary/10",
            target: "ongoing" as TransactionStatusFilter,
          },
        ].map(({ label, value, icon: Icon, color, bg, target }) => (
          <button
            key={label}
            onClick={() => setActiveStatus(target)}
            className={`text-left bg-card rounded-2xl border p-4 transition-all hover:shadow-md hover:border-primary/40 ${
              activeStatus === target
                ? "border-primary ring-2 ring-primary/20"
                : "border-border"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-heading font-bold">{value}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {pendingCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-status-pending/10 border border-status-pending/30 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-status-pending/20 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5 text-status-pending" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">
              {pendingCount} booking{pendingCount > 1 ? "s" : ""} pending
              confirmation
            </p>
            <p className="text-xs text-muted-foreground">
              Review and confirm these reservations to avoid automatic
              cancellation.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-status-pending/50 text-status-pending hover:bg-status-pending/10 shrink-0"
            onClick={() => setActiveStatus("pending")}
          >
            Review Now
          </Button>
        </div>
      )}

      {/* ── Search & Filters (list view only) ── */}
      {viewMode === "list" && (
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by guest, property, or booking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <Select
            value={activeStatus}
            onValueChange={(v) => setActiveStatus(v as TransactionStatusFilter)}
          >
            <SelectTrigger className="h-10 w-full md:w-[200px] rounded-xl text-sm">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(({ key, label, count }) => (
                <SelectItem key={key} value={key}>
                  {label} ({count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SortSelect
            value={`${sortBy}-${sortOrder}`}
            onChange={(v) => {
              const [by, order] = v.split("-");
              setSortBy(by as TransactionSortBy);
              setSortOrder(order as SortOrder);
            }}
            options={[
              { value: "paymentDate-desc", label: "Payment Date (Newest)" },
              { value: "paymentDate-asc", label: "Payment Date (Oldest)" },
              { value: "propertyName-asc", label: "Property Name (A–Z)" },
              { value: "propertyName-desc", label: "Property Name (Z–A)" },
            ]}
            className="h-10 w-full md:w-[200px] rounded-xl text-sm"
          />
        </div>
      )}

      {/* ── Sub-components ── */}
      {viewMode === "list" ? (
        <TransactionList
          transactions={filteredTransactions ?? []}
          onViewTransaction={onViewTransaction}
          onCancelRequest={setCancelTarget}
        />
      ) : (
        <TransactionCalendar
          transactions={transactionData?.data ?? []}
          activeStatus={activeStatus}
          calendarMonth={calendarMonth}
          setCalendarMonth={setCalendarMonth}
        />
      )}

      {/* ── Cancel Dialog ── */}
      <AlertDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
      >
        <AlertDialogContent className="rounded-2xl max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--status-cancelled))]/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6 text-[hsl(var(--status-cancelled))]" />
              </div>
              <AlertDialogTitle className="text-lg">
                Cancel this booking?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm">
              {cancelTarget && (
                <>
                  This will cancel{" "}
                  <span className="font-semibold text-foreground">
                    {cancelTarget.user.firstName}'s
                  </span>{" "}
                  reservation for{" "}
                  <span className="font-semibold text-foreground">
                    {cancelTarget.room.property.propertyName}
                  </span>{" "}
                  ({cancelTarget.room.roomName}). The guest will be notified and
                  any payment will need to be refunded.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Keep Booking
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast.success(
                  `Booking ${cancelTarget?.transactionId} has been cancelled.`,
                );
                setCancelTarget(null);
              }}
              className="rounded-xl bg-[hsl(var(--status-cancelled))] text-white hover:bg-[hsl(var(--status-cancelled))]/90"
            >
              Yes, Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TransactionManagement;
