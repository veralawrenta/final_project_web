"use client"
import { SortBy, SortOrder } from "@/types/pagination";
import { BedDouble, Building2, Calendar, MessageSquare, Reply, Search, Send, Star, User } from "lucide-react";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from "nuqs";
import { useDebounceValue } from "usehooks-ts";
import { Button } from "../ui/button";
import { formatDate } from "date-fns";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useGetAllTenantReviews } from "@/hooks/useReviews";
import { useState } from "react";
import PaginationSection from "../PaginationSection"; // adjust path
import ReplyReviewModal from "./reviews/ReplyReviewModal";

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
    parseAsStringEnum<filterType>(["all", "reviewed", "pending"]).withDefault("all"),
  );
  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsStringEnum<SortBy>(["createdAt", "propertyName"]).withDefault("createdAt"),
  );
  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    parseAsStringEnum<SortOrder>(["asc", "desc"]).withDefault("desc"),
  );

  const [debounceSearch] = useDebounceValue(searchQuery, 500);
  const { data: reviewData } = useGetAllTenantReviews({
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold">Guest Reviews</h1>
        <p className="text-muted-foreground mt-1">
          View and reply to guest feedback across all properties — {reviewData?.summary.totalCount} total reviews
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Reviews", value: reviewData?.summary.totalCount, icon: MessageSquare, color: "text-primary", bg: "bg-primary/10" },
          { label: "Unreplied", value: reviewData?.summary.pending, icon: Reply, color: "text-gold", bg: "bg-gold/10" },
          { label: "Replied", value: reviewData?.summary.reviewed, icon: Send, color: "text-teal", bg: "bg-teal/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-heading font-bold">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by guest, property, room, or comment..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        <Select value={filter} onValueChange={handleFilterChange}>
          <SelectTrigger className="h-10 w-[160px] rounded-xl text-sm">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ({reviewData?.summary.totalCount})</SelectItem>
            <SelectItem value="pending">Unreplied ({reviewData?.summary.pending})</SelectItem>
            <SelectItem value="reviewed">Replied ({reviewData?.summary.reviewed})</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={`${sortBy}-${sortOrder}`}
          onValueChange={(value) => {
            const [newSortBy, newSortOrder] = value.split("-") as [SortBy, SortOrder];
            setSortBy(newSortBy);
            setSortOrder(newSortOrder);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-10 w-[180px] rounded-xl text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt-desc">Newest First</SelectItem>
            <SelectItem value="createdAt-asc">Oldest First</SelectItem>
            <SelectItem value="propertyName-asc">Property: A-Z</SelectItem>
            <SelectItem value="propertyName-desc">Property: Z-A</SelectItem>
          </SelectContent>
        </Select>

        {(searchQuery || filter !== "all" || sortBy !== "createdAt" || sortOrder !== "desc") && (
          <Button variant="outline" size="sm" onClick={handleClearAll} className="rounded-xl">
            Clear
          </Button>
        )}
      </div>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Showing {reviews?.length ?? 0} of {reviewData?.summary.totalCount} reviews
        </p>

        {reviews && reviews.length > 0 ? (
          reviews.map((r) => (
            <div key={r.id} className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary shrink-0">
                      {r.user.firstName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">{`${r.user.firstName} ${r.user.lastName}`}</p>
                        {r.reply ? (
                          <Badge variant="outline" className="text-teal border-teal/30 bg-teal/10 text-xs">Replied</Badge>
                        ) : (
                          <Badge variant="outline" className="text-gold border-gold/30 bg-gold/10 text-xs">Awaiting Reply</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Reviewed on {formatDate(r.createdAt, "dd-MM-yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < r.ratings ? "fill-[hsl(var(--gold))] text-[hsl(var(--gold))]" : "text-border"}`} />
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {r.transaction.room?.property?.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <BedDouble className="h-3.5 w-3.5" />
                    {r.transaction.room?.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(r.transaction.checkIn, "dd-MM-yyyy")} – {formatDate(r.transaction.checkOut, "dd-MM-yyyy")}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {`${r.user.firstName} ${r.user.lastName}`}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-relaxed">{r.comments}</p>

                {r.reply && (
                  <div className="mt-4 rounded-xl bg-teal/5 border border-teal/20 p-3.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Reply className="h-3.5 w-3.5 text-teal" />
                      <span className="text-xs font-semibold text-teal">{r.transaction.room?.property?.tenant.tenantName}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.reply}</p>
                  </div>
                )}

                {!r.reply && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 rounded-xl"
                    onClick={() => setReplyTo(r.id)}
                  >
                    <Reply className="h-4 w-4 mr-1.5" />
                    Reply
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-heading font-bold">No reviews found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {filter === "pending"
                ? "All reviews have been replied to. Great job!"
                : filter === "reviewed"
                ? "No replied reviews match your search."
                : "No guest reviews yet. Reviews will appear here once guests leave feedback."}
            </p>
          </div>
        )}
      </div>
      {reviewData?.meta && (
        <PaginationSection
          onChangePage={onChangePage}
          meta={reviewData.meta}
        />
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