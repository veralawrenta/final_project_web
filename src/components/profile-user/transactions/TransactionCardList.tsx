"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCancelTransactionByUser } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/price/currency";
import {
  statusToDisplayStatus,
  Transactions,
  TransactionStatus,
  transactionStatusConfig
} from "@/types/transaction";
import { format } from "date-fns";
import {
  AlertTriangle,
  CalendarDays,
  Clock,
  Eye,
  Loader2,
  MapPin,
  Star,
  Upload,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface TransactionCardProps {
  transaction: Transactions;
}

const TransactionCardList = ({ transaction }: TransactionCardProps) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  const displayStatus = statusToDisplayStatus[transaction.status];
  const statusConfig = transactionStatusConfig[displayStatus] ?? {
    label: transaction.status,
    className: "bg-muted text-muted-foreground border-border",
    icon: Clock,
  };

  const StatusIcon = statusConfig.icon;
  const image =
    transaction.room.property.propertyImages?.[0]?.urlImages ||
    "/placeholder-image.png";

  const canCancel =
    transaction.status === TransactionStatus.WAITING_FOR_PAYMENT &&
    !transaction.paymentDate &&
    !isCancelled;

  const isCompleted =
    transaction.status === TransactionStatus.COMPLETED &&
    new Date(transaction.checkOut) < new Date();

  const { mutate: cancelTransaction, isPending: isCancelling } =
    useCancelTransactionByUser();

  const handleCancelBooking = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent accidental dual submissions
    cancelTransaction(transaction.id, {
      onSuccess: () => {
        setShowCancelDialog(false);
        setIsCancelled(true);
      },
    });
  };

  return (
    <div>
      <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="flex flex-col lg:flex-row">
          {/* Image Banner */}
          <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-secondary lg:h-auto lg:w-60 xl:w-72 shrink-0">
            <img
              src={image}
              alt={transaction.room.property.name}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
            <Badge
              className={`absolute left-3 top-3 rounded-lg border px-2.5 py-1 text-xs font-semibold gap-1.5 shadow-sm backdrop-blur-md ${statusConfig.className} `}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {statusConfig.label}
            </Badge>
          </div>

          {/* Content Body */}
          <div className="flex flex-1 flex-col p-4 sm:p-6 justify-between">
            <div>
              {/* Title row */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/profile/user/transactions/${transaction.id}`}
                      className="text-base sm:text-xl font-heading font-bold hover:text-primary transition-colors line-clamp-1"
                    >
                      {transaction.room.property.name}
                    </Link>
                    <Link href={`/my-bookings/${transaction.id}`}>
                      <Badge
                        variant="outline"
                        className="rounded-lg font-mono text-[10px] px-2 py-0.5 hover:bg-primary/10 hover:border-primary/30 transition-colors cursor-pointer shrink-0"
                      >
                        {transaction.id.toUpperCase()}
                      </Badge>
                    </Link>
                  </div>
                  <p className="flex items-start gap-1.5 text-xs sm:text-sm text-muted-foreground max-w-full">
                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground/70" />
                    <span className="line-clamp-2 wrap-break-words">
                      {transaction.room.property.address},{" "}
                      {transaction.room.property.city.name}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <Badge
                      variant="secondary"
                      className="rounded-md px-2 py-0.5 text-xs font-medium"
                    >
                      {transaction.room.name}
                    </Badge>
                  </div>
                </div>

                {/* Pricing Widget */}
                <div className="rounded-xl bg-primary/3 border border-primary/10 px-4 py-2 sm:text-right shrink-0 min-w-[140px] self-start sm:self-auto">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                    Total Paid
                  </p>
                  <p className="mt-0.5 text-lg sm:text-xl font-heading font-bold text-primary">
                    {formatCurrency(transaction.totalPrice)}
                  </p>
                </div>
              </div>

              {/* Information Meta Grid */}
              <div className="mt-5 grid gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 sm:p-4 grid-cols-2 md:grid-cols-3">
                <div className="col-span-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
                    Check-in
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm font-semibold">
                    <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                    {format(transaction.checkIn, "dd-MM-yyyy")}
                  </p>
                </div>
                <div className="col-span-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
                    Check-out
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm font-semibold">
                    <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                    {format(transaction.checkOut, "dd-MM-yyyy")}
                  </p>
                </div>
                <div className="col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-border/80 pt-2.5 md:pt-0 md:pl-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
                    Guests
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm font-semibold">
                    <Users className="h-4 w-4 text-primary shrink-0" />
                    {transaction.totalGuests} guest
                    {transaction.totalGuests > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="mt-5 flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {isCompleted && transaction.review?.comments && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--status-pending))]/10 px-2.5 py-1 text-xs font-semibold text-[hsl(var(--status-pending))]">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    Rated {transaction.review?.ratings}/5
                  </span>
                )}
                {isCancelled && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--status-cancelled))]/10 px-2.5 py-1 text-xs font-semibold text-[hsl(var(--status-cancelled))]">
                    <XCircle className="h-3.5 w-3.5" />
                    Cancelled
                  </span>
                )}
              </div>

              {/* Action Buttons list */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-xl gap-1.5 text-xs h-9 flex-1 sm:flex-initial"
                >
                  <Link href={`/profile/user/transactions/${transaction.id}`}>
                    <Eye className="h-3.5 w-3.5" />
                    Details
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-xl gap-1.5 text-xs h-9 flex-1 sm:flex-initial"
                >
                  <Link href={`/properties/${transaction.room.property.id}`}>
                    <Eye className="h-3.5 w-3.5" />
                    Property
                  </Link>
                </Button>

                {transaction.status === TransactionStatus.WAITING_FOR_PAYMENT &&
                  !isCancelled && (
                    <Button
                      asChild
                      size="sm"
                      className="rounded-xl gap-1.5 text-xs h-9 bg-[hsl(var(--status-pending))] hover:bg-[hsl(var(--status-pending))]/90 text-white flex-1 sm:flex-initial"
                    >
                      <Link
                        href={`/profile/user/transaction/${transaction.id}/upload-proof`}
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Upload proof
                      </Link>
                    </Button>
                  )}

                {isCompleted && !transaction.review?.comments && (
                  <Button
                    asChild
                    size="sm"
                    className="rounded-xl gap-1.5 text-xs h-9 bg-primary hover:bg-primary/90 flex-1 sm:flex-initial"
                  >
                    <Link href={`/profile/user/review/${transaction.id}`}>
                      <Star className="h-3.5 w-3.5" />
                      Submit review
                    </Link>
                  </Button>
                )}

                {canCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isCancelling}
                    className="rounded-xl gap-1.5 text-xs h-9 text-[hsl(var(--status-cancelled))] border-[hsl(var(--status-cancelled))]/30 hover:text-[hsl(var(--status-cancelled))] hover:bg-[hsl(var(--status-cancelled))]/5 flex-1 sm:flex-initial"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    {isCancelling ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    Cancel booking
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog
        open={showCancelDialog}
        onOpenChange={isCancelling ? undefined : setShowCancelDialog}
      >
        <AlertDialogContent className="rounded-2xl max-w-md mx-4">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-xl bg-[hsl(var(--status-cancelled))]/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-[hsl(var(--status-cancelled))]" />
              </div>
              <AlertDialogTitle className="text-lg font-heading font-bold">
                Cancel this booking?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm leading-relaxed">
              Are you sure you want to cancel your reservation at{" "}
              <span className="font-semibold text-foreground text-inline">
                {transaction.room.property.name}
              </span>{" "}
              ({transaction.room.name})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2 gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl" disabled={isCancelling}>
              Keep Booking
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelBooking}
              disabled={isCancelling}
              className="rounded-xl bg-[hsl(var(--status-cancelled))] text-white hover:bg-[hsl(var(--status-cancelled))]/90 min-w-[120px]"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel Booking"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TransactionCardList;
