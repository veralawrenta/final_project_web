"use client"
import { TransactionStatus } from "@/types/transaction";
import {
  CalendarCheck,
  CalendarDays,
  CalendarX2,
  CircleCheckBig,
  CircleX,
  Clock,
  Info,
  LayoutList,
} from "lucide-react";
import { parseAsInteger, parseAsStringEnum, useQueryState } from "nuqs";
import { useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { Button } from "../ui/button";
import { useGetAllTenantBookings } from "@/hooks/useTransactions";

type ViewMode = "list" | "calendar";
type sortBy = "propertyName" | "status" | "createdAt";
type sortOrder = "asc" | "desc";

const transactionStatusLabels: Record<
  TransactionStatus,
  { label: string; color: string; bgColor: string; icon: typeof Clock }
> = {
  ALL: {
    label: "All",
    color: "text-cyan-500",
    bgColor: "bg-cyan-100",
    icon: Info,
  },
  WAITING_FOR_PAYMENT: {
    label: "Pending",
    color: "text-yellow-500",
    bgColor: "bg-yellow-100",
    icon: Clock,
  },
  WAITING_FOR_CONFIRMATION: {
    label: "Pending",
    color: "text-yellow-500",
    bgColor: "bg-yellow-100",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "text-green-500",
    bgColor: "bg-green-100",
    icon: CalendarCheck,
  },
  CANCELLED_BY_USER: {
    label: "Canceled",
    color: "text-red-500",
    bgColor: "bg-red-100",
    icon: CircleX,
  },
  CANCELLED_BY_TENANT: {
    label: "Canceled",
    color: "text-red-500",
    bgColor: "bg-red-100",
    icon: CircleX,
  },
  EXPIRED: {
    label: "Expired",
    color: "text-grey-500",
    bgColor: "bg-grey-100",
    icon: CalendarX2,
  },
  COMPLETED: {
    label: "Completed",
    color: "text-blue-500",
    bgColor: "bg-blue-100",
    icon: CircleCheckBig,
  },
};

const isPendingStatus = (status: TransactionStatus) =>
    status === TransactionStatus.WAITING_FOR_PAYMENT ||
    status === TransactionStatus.WAITING_FOR_CONFIRMATION;

const BookingManagement = () => {
  const [activeStatus, setActiveStatus] = useQueryState(
    "activeStatus",
    parseAsStringEnum<TransactionStatus>(
      Object.values(TransactionStatus)).withDefault(TransactionStatus.ALL)
  );
  const [viewMode, setViewMode] = useQueryState(
    "viewMode",
    parseAsStringEnum<ViewMode>(["list", "calendar"]).withDefault("list")
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [sortBy, setSortBy] = useQueryState("sortBy", parseAsStringEnum<sortBy>(["propertyName", "status", "createdAt"]).withDefault("createdAt"));
  const [sortOrder, setSortOrder] = useQueryState("sortOrder", parseAsStringEnum<sortOrder>(["asc", "desc"]).withDefault("desc"));
  const [search, setSearch] = useState("");
  const [debounceSearch] = useDebounceValue(search, 500);
  const [calendarMonth, setCalendarMonth] = useState(new Date())

  const { data: tenantBookings, isPending } = useGetAllTenantBookings({
    search: debounceSearch,
    page,
    take: 6,
    sortBy,
    sortOrder,
    status: activeStatus === TransactionStatus.ALL ? undefined : activeStatus,
  });

  const onChangePage = (page: number) => {
    setPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (page !== 1) {
      setPage(1);
    }
  };
  const handleClearAll = () => {
    setSearch("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

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
          <Button
            variant={"outline"}
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              viewMode === "list"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutList className="h-4 w-4" /> List
          </Button>
          <Button
            variant={"outline"}
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              viewMode === "calendar"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarDays className="h-4 w-4" /> Calendar
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Bookings",
            value: tenantBookings.length,
            icon: Calendar,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: "Revenue",
            value: `$${totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: "text-teal",
            bg: "bg-teal/10",
          },
          {
            label: "Pending",
            value: mockBookings.filter((b) => b.status === "pending").length,
            icon: Clock,
            color: "text-gold",
            bg: "bg-gold/10",
          },
          {
            label: "Active Guests",
            value: mockBookings.filter((b) => b.status === "confirmed").length,
            icon: Users,
            color: "text-coral",
            bg: "bg-coral/10",
          },
        ]}
      </div>
    </div>
  );
};

export default BookingManagement;
