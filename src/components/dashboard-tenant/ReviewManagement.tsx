"use client";

import { format } from "date-fns";
import {
  BedDouble,
  Building2,
  Calendar,
  MessageSquare,
  Reply,
  Search,
  Send,
  Star,
  User,
  X,
} from "lucide-react";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from "nuqs";
import { useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { useGetAllTenantReviews } from "@/hooks/useReviews";
import { SortBy, SortOrder } from "@/types/pagination";
import PaginationSection from "../PaginationSection";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import ReplyReviewModal from "./reviews/ReplyReviewModal";
import PendingLoader from "../PendingLoader";

type filterType = "all" | "reviewed" | "pending";

const ReviewManagement = () => {
  const [replyTo, setReplyTo] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useQueryState(
    "searchQuery",
    parseAsString.withDefault(""),
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [filter, setFilter] = useQueryState(
    "filter",
    parseAsStringEnum<filterType>(["all", "reviewed", "pending"]).withDefault(
      "all",
    ),
  );
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

  const [debounceSearch] = useDebounceValue(searchQuery, 500);
  const { data: reviewData, isPending } = useGetAllTenantReviews({
    search: debounceSearch,
    page,
    filter,
    sortBy,
    sortOrder,
  });
  const reviews = reviewData?.data;

  const onChangePage = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (page !== 1) setPage(1);
  };

  const handleClearAll = () => {
    setSearchQuery("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setFilter("all");
    setPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value === "all" ? null : (value as filterType));
    setPage(1);
  };

  const isFiltered =
    searchQuery ||
    filter !== "all" ||
    sortBy !== "createdAt" ||
    sortOrder !== "desc";

  if (isPending) {
    return <PendingLoader context="review" />;
  }
  return (
    <div className="space-y-8 p-1">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-heading">
          Guest Reviews
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          {`View and reply to guest feedback across all properties — ${reviewData?.summary.totalCount ?? 0} total reviews`}
        </p>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Reviews",
            value: reviewData?.summary.totalCount,
            icon: MessageSquare,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-500/10",
          },
          {
            label: "Unreplied",
            value: reviewData?.summary.pending,
            icon: Reply,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-500/10",
          },
          {
            label: "Replied",
            value: reviewData?.summary.reviewed,
            icon: Send,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-500/10",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-card rounded-xl border border-border p-5 shadow-sm flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-lg ${bg} flex items-center justify-center ${color} shrink-0`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {label}
              </p>
              <p className="text-2xl font-bold tracking-tight mt-0.5">
                {value ?? 0}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Actions Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center border-b pb-5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search by guest, property, room..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-background border border-input rounded-lg text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <Select value={filter} onValueChange={handleFilterChange}>
          <SelectTrigger className="h-10 w-full sm:w-[160px] rounded-lg text-sm">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              All ({reviewData?.summary.totalCount ?? 0})
            </SelectItem>
            <SelectItem value="pending">
              Unreplied ({reviewData?.summary.pending ?? 0})
            </SelectItem>
            <SelectItem value="reviewed">
              Replied ({reviewData?.summary.reviewed ?? 0})
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={`${sortBy}-${sortOrder}`}
          onValueChange={(value) => {
            const [newSortBy, newSortOrder] = value.split("-") as [
              SortBy,
              SortOrder,
            ];
            setSortBy(newSortBy);
            setSortOrder(newSortOrder);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-10 w-full sm:w-[180px] rounded-lg text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt-desc">Newest First</SelectItem>
            <SelectItem value="createdAt-asc">Oldest First</SelectItem>
            <SelectItem value="propertyName-asc">Property: A-Z</SelectItem>
            <SelectItem value="propertyName-desc">Property: Z-A</SelectItem>
          </SelectContent>
        </Select>

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="rounded-lg h-10 text-muted-foreground hover:text-foreground"
          >
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Main Stream Container */}
      <div className="space-y-4">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {`Showing ${reviews?.length ?? 0} of ${reviewData?.summary.totalCount ?? 0} reviews`}
        </p>

        {reviews && reviews.length > 0 ? (
          reviews.map((r) => {
            const guestName = r.user
              ? `${r.user.firstName} ${r.user.lastName}`
              : "Unknown Guest";
            const guestInitial = r.user
              ? `${r.user.firstName?.[0] ?? ""}${r.user.lastName?.[0] ?? ""}`.toUpperCase()
              : "?";

            return (
              <div
                key={r.id}
                className="bg-card rounded-xl border border-border shadow-sm hover:border-muted-foreground/30 transition-all p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary font-semibold text-secondary-foreground text-xs border shadow-inner">
                      {guestInitial}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-sm tracking-tight">
                          {guestName}
                        </h4>
                        {r.reply ? (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/20 text-xs font-normal"
                          >
                            Replied
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 border-amber-500/20 text-xs font-normal"
                          >
                            Awaiting Reply
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Reviewed on {format(r.createdAt, "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 self-start sm:self-auto">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < r.ratings ? "fill-amber-400 text-amber-400" : "text-muted/30"}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Meta details list container */}
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground bg-muted/40 border rounded-lg px-3 py-2.5">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground/80" />
                    {r.transaction.room?.property?.name}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BedDouble className="h-3.5 w-3.5 text-muted-foreground/80" />
                    {r.transaction.room?.name}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground/80" />
                    {`${format(r.transaction.checkIn, "dd/MM/yyyy")} – ${format(r.transaction.checkOut, "dd/MM/yyyy")}`}
                  </span>
                  <span className="flex items-center gap-1.5 sm:hidden">
                    <User className="h-3.5 w-3.5 text-muted-foreground/80" />
                    {guestName}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-foreground/90 pl-0.5">
                  {r.comments}
                </p>

                {/* Reply UI box */}
                {r.reply && (
                  <div className="mt-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Reply className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 transform scale-x-[-1]" />
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        {r.transaction.room?.property?.tenant.tenantName}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-5.5">
                      {r.reply}
                    </p>
                  </div>
                )}

                {!r.reply && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 h-8 rounded-lg text-xs shadow-sm font-medium"
                    onClick={() => setReplyTo(r.id)}
                  >
                    <Reply className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    Write a Reply
                  </Button>
                )}
              </div>
            );
          })
        ) : (
          /* Empty state */
          <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center shadow-sm">
            <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/40 stroke-[1.5]" />
            <h3 className="mt-4 text-base font-semibold">No reviews found</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
              {filter === "pending"
                ? "All reviews have been replied to. Great job!"
                : filter === "reviewed"
                  ? "No replied reviews match your current filter preferences."
                  : "No guest reviews yet. Reviews will appear here once guests leave feedback."}
            </p>
          </div>
        )}
      </div>

      {reviewData?.meta && (
        <div className="pt-2">
          <PaginationSection
            onChangePage={onChangePage}
            meta={reviewData.meta}
          />
        </div>
      )}

      {replyTo !== null && (
        <ReplyReviewModal
          reviewId={replyTo}
          open={replyTo !== null}
          onClose={() => setReplyTo(null)}
        />
      )}
    </div>
  );
};

export default ReviewManagement;
