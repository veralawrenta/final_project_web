import { useGetAllPropertyReviews } from "@/hooks/useReviews";
import { SortOrder } from "@/types/pagination";
import { MessageSquare, Star } from "lucide-react";
import { parseAsInteger, parseAsStringEnum, useQueryState } from "nuqs";
import PaginationSection from "../PaginationSection";
import { Badge } from "../ui/badge";
import { formatDate } from "date-fns";

interface PropertyReviewCardProps {
  propertyId: number;
}

type SortBy = "createdAt" | "ratings";

const PropertyReviewCard = ({ propertyId }: PropertyReviewCardProps) => {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsStringEnum<SortBy>(["createdAt", "ratings"]).withDefault(
      "createdAt",
    ),
  );
  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    parseAsStringEnum<SortOrder>(["asc", "desc"]).withDefault("desc"),
  );

  const { data: reviews, isPending } = useGetAllPropertyReviews(propertyId, {
    page,
    take: 3,
    sortOrder,
    sortBy,
  });

  const onChangePage = (page: number) => setPage(page);

  if (!reviews?.data.length) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-heading font-semibold">Guest reviews</h2>
        </div>
        <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
          No reviews yet for this property.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-heading font-semibold">
              Guest reviews
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Verified stay feedback from recent guests.
          </p>
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-secondary px-4 py-3">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-[hsl(var(--gold))] text-[hsl(var(--gold))]" />
            <span className="text-2xl font-heading font-bold">
              {reviews.summary.averageRating}
            </span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-sm font-medium">
              {reviews.data.length} review{reviews.data.length > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              Based on completed stays
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {reviews.meta.total} total reviews
        </p>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as SortBy);
              setPage(1);
            }}
            className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs outline-none"
          >
            <option value="createdAt">Date</option>
            <option value="ratings">Rating</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as SortOrder);
              setPage(1);
            }}
            className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs outline-none"
          >
            <option value="desc">Newest / Highest</option>
            <option value="asc">Oldest / Lowest</option>
          </select>
        </div>
      </div>

      {/* Review list */}
      <div className="space-y-4">
        {reviews.data.map((review) => (
          <article
            key={review.id}
            className="rounded-3xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
                  {review.user.firstName?.charAt(0) ?? "?"}
                </div>
                <div>
                  <p className="font-medium">
                    {review.user.firstName} {review.user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {review.transaction.room?.name} ·{" "}
                    {formatDate(review.transaction.checkIn, "dd MMM yyyy")} –{" "}
                    {formatDate(review.transaction.checkOut, "dd MMM yyyy")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 ${
                        index < review.ratings
                          ? "fill-[hsl(var(--gold))] text-[hsl(var(--gold))]"
                          : "text-border"
                      }`}
                    />
                  ))}
                </div>
                <Badge variant="outline" className="rounded-full">
                  {formatDate(review.createdAt, "dd MMM yyyy")}
                </Badge>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-foreground">
              {review.comments}
            </p>

            {review.reply && (
              <div className="mt-4 rounded-2xl border border-primary/10 bg-primary/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Host reply
                </p>
                <p className="mt-2 text-sm text-foreground">{review.reply}</p>
              </div>
            )}
            {!!reviews.meta && !isPending && (
              <div className="pt-4">
                <PaginationSection
                  meta={reviews.meta}
                  onChangePage={onChangePage}
                />
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default PropertyReviewCard;
