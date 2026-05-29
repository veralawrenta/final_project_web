"use client";
import PaginationSection from "@/components/PaginationSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAllUserReviews } from "@/hooks/useReviews";
import { SortBy, SortOrder } from "@/types/pagination";
import { formatDate } from "date-fns";
import { Badge, Link, MessageSquare, Search, Star } from "lucide-react";
import { parseAsInteger, parseAsStringEnum, useQueryState } from "nuqs";
import { useTransition } from "react";
import { useDebounceValue } from "usehooks-ts";

type ReviewFilter = "all" | "reviewed" | "pending";

const MyReviews = () => {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsStringEnum<SortBy>([
      "createdAt",
      "propertyName",
    ]).withDefault("createdAt"),
  );
  const [filter, setFilter] = useQueryState(
    "filter",
    parseAsStringEnum<ReviewFilter>(["all", "reviewed", "pending"]).withDefault(
      "all",
    ),
  );
  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    parseAsStringEnum<SortOrder>(["asc", "desc"]).withDefault("desc"),
  );

  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const [debounceSearch] = useDebounceValue(search, 500);

  const { data: userReviews, isPending } = useGetAllUserReviews({
    search: debounceSearch,
    page,
    sortBy,
    sortOrder,
    filter,
  });

  const [isClearing, startTransition] = useTransition();

  const handleSearch = (value: string) => {
    setSearch(value);
    if (page !== 1) setPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value as ReviewFilter);
    if (page !== 1) setPage(1);
  };

  const handleSortByChange = (value: string) => {
    setSortBy(value as SortBy);
    if (page !== 1) setPage(1);
  };

  const onChangePage = (page: number) => {
    setPage(page);
  };

  const handleClearAll = () => {
    startTransition(() => {
      setSearch("");
      setSortBy("createdAt");
      setSortOrder("desc");
      setPage(1);
    });
  };

  const totalReviews = userReviews?.meta.total ?? 0;
  const pendingReviews = userReviews?.meta.pending ?? 0;
  const reviewedReviews = totalReviews - pendingReviews;

  return (
    <div className="flex-1 px-4 py-6 pb-10 sm:px-6 md:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="space-y-5 sm:space-y-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">
                My Reviews
              </h1>
              <p className="text-muted-foreground mt-1">
                {pendingReviews > 0
                  ? `You have ${pendingReviews} stay${pendingReviews > 1 ? "s" : ""} pending review.`
                  : "You have no pending reviews."}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search reviews..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={filter}
                onValueChange={(v) => handleFilterChange(v as ReviewFilter)}
              >
                <SelectTrigger className="h-10 w-[140px] rounded-xl text-sm">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All ({totalReviews})
                  </SelectItem>
                  <SelectItem value="reviewed">
                    Reviewed ({reviewedReviews})
                  </SelectItem>
                  <SelectItem value="pending">
                    Pending ({pendingReviews})
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={(v) => handleSortByChange(v as SortBy)}
              >
                <SelectTrigger className="h-10 w-[140px] rounded-xl text-sm">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date Created</SelectItem>
                  <SelectItem value="propertyName">Property Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            <p className="px-2 text-sm text-muted-foreground">
              Showing {userReviews?.data.length || 0} of{" "}
              {userReviews?.meta.total || 0} reviews
            </p>
          </div>

          {isPending ? (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-border bg-card p-5 shadow-sm animate-pulse"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-48 rounded bg-muted" />
                        <div className="h-3 w-32 rounded bg-muted" />
                        <div className="h-3 w-40 rounded bg-muted" />
                      </div>
                      <div className="h-9 w-28 rounded-xl bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : userReviews?.data && userReviews.data.length > 0 ? (
              <div className="space-y-4">
                {userReviews.data.map((review) => {
                  const propertyName = review.transaction?.room?.property?.name ?? "Unknown Property";
                  const roomName = review.transaction?.room?.name ?? "";
                  const location = review.transaction?.room?.property?.address ?? "";
                  const checkIn = review.transaction?.checkIn;
                  const checkOut = review.transaction?.checkOut;
                  const isReviewed = review.ratings > 0;
 
                  return (
                    <div
                      key={review.id}
                      className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-heading font-semibold">{propertyName}</h3>
                            {isReviewed ? (
                              <Badge className="rounded-full bg-primary/10 text-primary text-xs border-0">
                                Reviewed
                              </Badge>
                            ) : (
                              <Badge
                                className="rounded-full text-xs border-amber-300 text-amber-600 bg-amber-50"
                              >
                                Pending
                              </Badge>
                            )}
                          </div>
 
                          {(roomName || location) && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {[roomName, location].filter(Boolean).join(" · ")}
                            </p>
                          )}
 
                          {checkIn && checkOut && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Stayed {formatDate(checkIn, "dd-MM-yyyy")} — {formatDate(checkOut, "dd-MM-yyyy")}
                            </p>
                          )}
 
                          {isReviewed && (
                            <div className="mt-3">
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.ratings
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-muted-foreground/30"
                                    }`}
                                  />
                                ))}
                                <span className="ml-1 text-sm font-medium">
                                  {review.ratings}/5
                                </span>
                              </div>
                              {review.comments && (
                                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                  "{review.comments}"
                                </p>
                              )}
                            </div>
                          )}
                        </div>
 
                        <div className="flex items-center gap-2 shrink-0">
                          {!isReviewed && (
                            <Button asChild size="sm" className="rounded-xl gap-1.5">
                              <Link href={`/profile/user/reviews/${review.transaction.id}`}>
                                <MessageSquare className="h-4 w-4" />
                                Write Review
                              </Link>
                            </Button>
                          )}
                          {review.transaction?.room?.property?.name && (
                            <Button asChild variant="outline" size="sm" className="rounded-xl">
                              <Link href={`/property/${review.transaction.room.property.name}`}>View Property</Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                <Star className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <h3 className="mt-4 text-lg font-heading font-bold">No reviews found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try adjusting your filters or search query.
                </p>
              </div>
            )}
          </div>
          <div className="pt-4">
            <PaginationSection
              meta={
                userReviews?.meta ?? {
                  page: 1,
                  take: 6,
                  total: 0,
                  totalPages: 1,
                }
              }
              onChangePage={onChangePage}
            />
          </div>
        </div>
      </div>
  );
};

export default MyReviews;
