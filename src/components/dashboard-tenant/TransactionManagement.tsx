"use client";
import {
  useCancelTransactionByTenant,
  useConfirmTransactionByTenant,
  useGetAllTenantTransactions
} from "@/hooks/useTenantTransactions";
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
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from "nuqs";
import { useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import PaginationSection from "../PaginationSection";
import { SortSelect } from "../ui/SortSelect";
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
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState<TransactionStatusFilter>(
    [
      "ALL",
      "PENDING",
      "ONGOING",
      "UPCOMING",
      "COMPLETED",
      "CANCELLED",
    ].includes(initialFilter ?? "")
      ? (initialFilter as TransactionStatusFilter)
      : "ALL",
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
  const [cancelReason, setCancelReason] = useState("");

  const [debounceSearch] = useDebounceValue(searchQuery, 500);

  const { data: transactionData, isPending } = useGetAllTenantTransactions({
    page,
    take: 8,
    search: debounceSearch,
    status: activeStatus,
    sortBy,
    sortOrder,
  });

  
  const cancelTransaction = useCancelTransactionByTenant();
  const confirmTransaction = useConfirmTransactionByTenant()

  const statusOptions: {
    key: TransactionStatusFilter;
    label: string;
    count: number;
  }[] = [
    {
      key: "ALL",
      label: "All Transactions",
      count: transactionData?.summary?.totalTransactions ?? 0,
    },
    {
      key: "PENDING",
      label: "Pending",
      count: transactionData?.summary?.pending ?? 0,
    },
    {
      key: "ONGOING",
      label: "Active Guests",
      count: transactionData?.summary?.activeGuests ?? 0,
    },
    {
      key: "COMPLETED",
      label: "Completed",
      count: transactionData?.summary?.completed ?? 0,
    },
    {
      key: "CANCELLED",
      label: "Cancelled",
      count: transactionData?.summary?.cancelled ?? 0,
    },
    {
      key: "UPCOMING",
      label: "Upcoming",
      count: transactionData?.summary?.upcoming ?? 0,
    },
  ];

  const totalIncome = transactionData?.summary?.totalIncome ?? 0;
  const pendingCount = transactionData?.summary?.pending ?? 0;

  const onChangePage = (page: number) => {
    setPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelTransaction = () => {
    if (!cancelTarget) return;
    cancelTransaction.mutate(
      {
        transactionId: cancelTarget.id,
        reason: cancelReason.trim(),
      },
      {
        onSuccess: () => {
          setCancelTarget(null);
          setCancelReason("");
        },
      },
    );
  };

  const handleConfirmTransaction = (transactionId: string) => {
    if (!transactionId) return;

    confirmTransaction.mutate(transactionId);
  }

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6 w-full rounded-3xl border-2 border-dashed bg-muted/5">
        <div className="relative h-12 w-12 animate-bounce">
          <Image
            src="/images/nuit-logo.png"
            width={48}
            height={48}
            alt="Loading..."
            className="object-contain grayscale opacity-50 h-auto w-auto"
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="h-1 w-24 bg-muted overflow-hidden rounded-full">
            <div className="h-full bg-primary animate-progress-loading w-full" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Syncing your properties transactions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-0">
      {/* ── Title & View Toggle Panel ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-3xl font-heading font-bold text-foreground">
            Booking Management
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Manage all reservations across your properties
          </p>
        </div>
        <div className="flex w-full sm:w-auto gap-1 bg-muted rounded-xl p-1">
          <button
            onClick={() => setViewMode("list")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
              viewMode === "list"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutList className="h-4 w-4" /> List
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
              viewMode === "calendar"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarDays className="h-4 w-4" /> Calendar
          </button>
        </div>
      </div>

      {/* ── Metrics Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Transactions",
            value: transactionData?.summary.totalTransactions,
            icon: Calendar,
            color: "text-primary",
            bg: "bg-primary/10",
            target: "ALL" as TransactionStatusFilter,
          },
          {
            label: "Total Income",
            value: formatCurrency(totalIncome),
            icon: DollarSign,
            color: "text-status-confirmed",
            bg: "bg-status-confirmed/10",
            target: null,
          },
          {
            label: "Pending",
            value: transactionData?.summary.pending,
            icon: Clock,
            color: "text-status-pending",
            bg: "bg-status-pending/10",
            target: "PENDING" as TransactionStatusFilter,
          },
          {
            label: "Active Guests",
            value: transactionData?.summary.activeGuests,
            icon: Users,
            color: "text-primary",
            bg: "bg-primary/10",
            target: "ONGOING" as TransactionStatusFilter,
          },
        ].map(({ label, value, icon: Icon, color, bg, target }) => {
          const Element = target ? "button" : "div";
          return (
            <Element
              key={label}
              {...(target ? { onClick: () => setActiveStatus(target) } : {})}
              className={`w-full text-left bg-card rounded-2xl border p-4 transition-all ${
                target
                  ? `hover:shadow-md hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                      activeStatus === target
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border"
                    }`
                  : "border-border"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0 ${color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground truncate">
                    {label}
                  </p>
                  <p className="text-base md:text-lg font-heading font-bold text-foreground mt-0.5 truncate">
                    {value}
                  </p>
                </div>
              </div>
            </Element>
          );
        })}
      </div>

      {/* ── Pending Alert Banner ── */}
      {pendingCount > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-primary/20 border border-primary/20 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-status-pending/20 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5 text-status-pending" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {pendingCount} booking{pendingCount > 1 ? "s" : ""} pending
              confirmation
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review and confirm these reservations to avoid automatic
              cancellation.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full bb-status-pending sm:w-auto mt-2 sm:mt-0 border-status-pending text-slate-800 font-semibold hover:bg-status-pending/10 shrink-0"
            onClick={() => setActiveStatus("PENDING")}
          >
            Review Now
          </Button>
        </div>
      )}

      {/* ── Filter Panel ── */}
      {viewMode === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="relative md:col-span-6 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by guest, property, or booking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/70"
            />
          </div>
          <div className="grid grid-cols-2 md:col-span-6 gap-3 w-full">
            <Select
              value={activeStatus}
              onValueChange={(v) =>
                setActiveStatus(v as TransactionStatusFilter)
              }
            >
              <SelectTrigger className="h-10 w-full rounded-xl text-xs md:text-sm">
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
                { value: "paymentDate-desc", label: "Date (Newest)" },
                { value: "paymentDate-asc", label: "Date (Oldest)" },
                { value: "propertyName-asc", label: "Property (A–Z)" },
                { value: "propertyName-desc", label: "Property (Z–A)" },
              ]}
              className="h-10 w-full rounded-xl text-xs md:text-sm"
            />
          </div>
        </div>
      )}

      {/* ── Data Wrapper ── */}
      <div className="overflow-x-auto w-full rounded-2xl border border-border bg-card">
        {viewMode === "list" ? (
          <TransactionList
            transactions={transactionData?.data ?? []}
            onViewTransaction={(t) => {
              router.push(`/dashboard/tenant/transaction/${t.id}`);
            }}
            onConfirm={(t) => handleConfirmTransaction(t.id)}
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
      </div>

      <div className="pt-2">
        {transactionData?.meta && (
          <PaginationSection
            onChangePage={onChangePage}
            meta={transactionData.meta}
          />
        )}
      </div>

      {/* ── Dialog Overlays ── */}
      <AlertDialog
        open={!!cancelTarget}
        onOpenChange={(open) => {
          if (!open) {
            setCancelTarget(null);
            setCancelReason("");
          }
        }}
      >
        <AlertDialogContent className="rounded-2xl max-w-[90vw] sm:max-w-md p-5 sm:p-6 mx-auto">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--status-cancelled))]/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6 text-[hsl(var(--status-cancelled))]" />
              </div>
              <AlertDialogTitle className="text-base sm:text-lg">
                Cancel this booking?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {cancelTarget && (
                <>
                  This will cancel{" "}
                  <span className="font-semibold text-foreground">
                    {cancelTarget.user.firstName}'s
                  </span>{" "}
                  reservation for{" "}
                  <span className="font-semibold text-foreground">
                    {cancelTarget.room.property.name}
                  </span>{" "}
                  ({cancelTarget.room.name}). The guest will be notified and any
                  payment will need to be refunded.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-3">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Reason for cancellation
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Property unavailable due to maintenance..."
              rows={3}
              className="w-full mt-1.5 px-3 py-2 bg-secondary border border-border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none placeholder:text-muted-foreground/60"
            />
          </div>

          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 mt-4">
            <AlertDialogCancel className="w-full sm:w-auto rounded-xl text-xs sm:text-sm mt-2 sm:mt-0">
              Keep Booking
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelTransaction}
              disabled={!cancelReason.trim() || cancelTransaction.isPending}
              className="w-full sm:w-auto rounded-xl text-xs sm:text-sm bg-[hsl(var(--status-cancelled))] text-white hover:bg-[hsl(var(--status-cancelled))]/90 disabled:opacity-50"
            >
              {cancelTransaction.isPending
                ? "Cancelling..."
                : "Yes, Cancel Booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TransactionManagement;
