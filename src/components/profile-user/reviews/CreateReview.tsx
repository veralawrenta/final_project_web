"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateReviewByUser } from "@/hooks/useReviews";
import { useGetTransactionIdByUser } from "@/hooks/useTransactions";
import { createReviewSchema } from "@/lib/validator/dashboard.reviews.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  MessageSquare,
  Send,
  Star,
} from "lucide-react";
import { useParams } from "next/navigation";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

const CreateReviewComponent = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const [comments, setComments] = useQueryState(
    "comments",
    parseAsString.withDefault(""),
  );
  const [ratings, setRatings] = useQueryState(
    "ratings",
    parseAsInteger.withDefault(1),
  );
  const [hoverRatings, setHoverRatings] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: userTransaction, isPending } =
    useGetTransactionIdByUser(transactionId);
  const {data: createReview, isPending: isLoading} = useCreateReviewByUser();
  const form = useForm<z.infer<typeof createReviewSchema>>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      transactionId: transactionId,
      checkOut: undefined,
      status: undefined,
      ratings: 1,
      comments: "",
      images: undefined,
    },
  });

  const handleSubmitReview = async (
    value: z.infer<typeof createReviewSchema>,
  ) => {
    try {
      await createReview.mutateAsync({
        transactionId: value.transactionId,
        ratings: value.ratings,
        comments: value.comments,
        images: value.images,
      });
      setIsSubmitted(true);
    } catch (error) {
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-muted/30">
        <main className="container mx-auto max-w-2xl px-4 py-16 sm:py-20 space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col items-center text-center space-y-3">
            <Skeleton className="h-9 w-48 rounded-lg animate-pulse" />
            <Skeleton className="h-4 w-64 rounded-md animate-pulse" />
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs">
            <div className="space-y-3">
              <Skeleton className="h-5 w-1/3 rounded-md" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>

            <div className="space-y-3">
              <Skeleton className="h-5 w-1/4 rounded-md" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16 rounded-md" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            </div>
            <div className="pt-4 border-t border-border/50">
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!userTransaction) {
    return (
      <div className="min-h-screen bg-muted/30">
        <main className="container mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="text-3xl font-heading font-bold">Booking not found</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            The review link is invalid or this booking is not available anymore.
          </p>
          <Button
            variant="outline"
            className="border-slate-600 bg-slate-300 text-black hover:bg-primary/20 hover:font-bold"
            onClick={() =>
              (window.location.href = "/profile/user/transactions")
            }
          >
            Back to My Bookings
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="max-w-3xl md:max-w-xl mx-auto p-6 mt-20 bg-background border-2 border-border rounded-lg shadow">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container flex h-16 items-center px-4">
          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back
          </button>
          <h1 className="flex-1 text-center text-lg font-heading font-bold">
            {isSubmitted ? "✨ Review Submitted" : "Write a Review"}
          </h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="container mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-4 p-5">
            <img
              src={userTransaction?.room?.property?.propertyImages?.[0].urlImages}
              alt={userTransaction?.room.property.name}
              className="h-20 w-20 rounded-2xl object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-heading font-bold">
                {userTransaction?.room.property.name}
              </h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />{" "}
                {userTransaction?.room.property.address}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{userTransaction?.room.name}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(userTransaction?.checkIn, "dd-MM-yyyy")} –{" "}
                  {format(userTransaction?.checkOut, "dd-MM-yyyy")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {!isSubmitted ? (
          <>
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-2 text-lg font-heading font-bold">
                How was your stay?
              </h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Tap a star to rate your experience
              </p>

              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatings(star)}
                      onMouseEnter={() => setHoverRatings(star)}
                      onMouseLeave={() => setHoverRatings(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-10 w-10 transition-colors ${
                          star <= (hoverRatings || ratings)
                            ? "fill-[hsl(var(--gold))] text-[hsl(var(--gold))]"
                            : "text-border"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {(hoverRatings || ratings) > 0 && (
                  <Badge className="border-[hsl(var(--gold))]/20 bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold))] text-sm font-semibold">
                    {ratingLabels[hoverRatings || ratings]}
                  </Badge>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-2 flex items-center gap-2 text-lg font-heading font-bold">
                <MessageSquare className="h-5 w-5 text-primary" />
                Tell us more
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Share details about your experience to help other travelers.
              </p>

              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="What did you enjoy? How was the room, cleanliness, and service?"
                rows={5}
                maxLength={1000}
                className="w-full resize-none rounded-2xl border border-border bg-secondary px-4 py-3.5 text-sm outline-none transition focus:border-primary"
              />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Minimum 10 characters
                </p>
                <p className="text-xs text-muted-foreground">
                  {comments.length}/1000
                </p>
              </div>
            </div>

            <Button
              variant="default"
              size="lg"
              className="w-full rounded-2xl"
              onClick={form.handleSubmit(handleSubmitReview)}
              disabled={isLoading || ratings === 0}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-4 w-4" /> Submit Review
                </span>
              )}
            </Button>
          </>
        ) : (
          <div className="rounded-3xl border border-primary/20 bg-linear-to-br from-primary/5 via-card to-primary/5 p-8 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Star className="h-10 w-10 fill-current text-primary" />
            </div>
            <h2 className="mb-2 text-2xl font-heading font-bold">
              Thank you for your review!
            </h2>
            <p className="mx-auto mb-4 max-w-md text-muted-foreground">
              Your feedback has been sent to the host. They'll be notified and
              may reply from their dashboard.
            </p>
            <div className="mb-6 flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-6 w-6 ${star <= ratings ? "fill-[hsl(var(--gold))] text-[hsl(var(--gold))]" : "text-border"}`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              className="border-slate-600 bg-slate-300 text-black hover:bg-primary/20 hover:font-bold"
              onClick={() =>
                (window.location.href = "/profile/user/transactions")
              }
            >
              Back to My Bookings
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreateReviewComponent;
