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
import { DisplayStatus, TransactionManagementPayload, Transactions, TransactionStatus, transactionStatusConfig } from "@/types/transaction";
import { formatDate } from "date-fns";
import {
  AlertTriangle,
  CalendarDays,
  Clock,
  Eye,
  Link,
  MapPin,
  Star,
  Upload,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";

const statusToDisplayStatus: Record<TransactionStatus, DisplayStatus> = {
  [TransactionStatus.WAITING_FOR_PAYMENT]:      "PENDING",
  [TransactionStatus.WAITING_FOR_CONFIRMATION]: "PENDING",
  [TransactionStatus.CONFIRMED]:                "ONGOING",
  [TransactionStatus.COMPLETED]:                "COMPLETED",
  [TransactionStatus.CANCELLED_BY_USER]:        "CANCELLED",
  [TransactionStatus.CANCELLED_BY_TENANT]:      "CANCELLED",
  [TransactionStatus.EXPIRED]:                  "CANCELLED",
  [TransactionStatus.ALL]:                      "PENDING",
};
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
    transaction.room.property.propertyImages?.urlImages ||
    "/placeholder-image.png";

  const canCancel =
    transaction.status === TransactionStatus.WAITING_FOR_PAYMENT &&
    !transaction.paymentDate;
  const isCompleted =
    transaction.status === TransactionStatus.COMPLETED &&
    new Date(transaction.checkOut) < new Date();

  const { mutate: cancelTransaction, isPending: isCancelling } =
    useCancelTransactionByUser();

  const handleCancelBooking = async () => {
    cancelTransaction(transaction.transactionId);
    setShowCancelDialog(false);
    setIsCancelled(true);
  };

  return (
    <div>
      <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
        <div className="flex flex-col lg:flex-row">
          {/* Image */}
          <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-secondary lg:h-auto lg:w-56 xl:w-64 shrink-0">
            <img
              src={image}
              alt={transaction.room.property.propertyName}
              className="h-full w-full object-cover"
            />
            <Badge
              className={`absolute left-3 top-3 rounded-lg border px-2.5 py-1 text-xs font-semibold gap-1 ${statusConfig.color} ${statusConfig.bgColor}`}
            >
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </Badge>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-4 sm:p-5">
            {/* Title row */}
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/my-bookings/${transaction.transactionId}`}
                    className="text-base sm:text-lg font-heading font-bold hover:text-primary transition-colors truncate"
                  >
                    {transaction.room.property.propertyName}
                  </Link>
                  <Link to={`/my-bookings/${transaction.transactionId}`}>
                    <Badge
                      variant="outline"
                      className="rounded-lg font-mono text-[11px] px-2 py-0.5 hover:bg-primary/10 hover:border-primary/30 transition-colors cursor-pointer shrink-0"
                    >
                      {transaction.transactionId.toUpperCase()}
                    </Badge>
                  </Link>
                </div>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {transaction.room.property.address},{" "}
                  {transaction.room.property.city}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Badge
                    variant="secondary"
                    className="rounded-lg px-2.5 py-1 text-xs"
                  >
                    {transaction.room.roomName}
                  </Badge>
                </div>
              </div>

              {/* Price */}
              <div className="rounded-xl bg-primary/5 border border-primary/10 px-4 py-2.5 sm:py-3 xl:min-w-36 text-right xl:text-left shrink-0">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                  Total
                </p>
                <p className="mt-0.5 text-xl sm:text-2xl font-heading font-bold text-primary">
                  {formatCurrency(transaction.totalPrice)}
                </p>
              </div>
            </div>

            {/* Date grid */}
            <div className="mt-4 grid gap-3 rounded-xl border border-border bg-muted/30 p-3 sm:p-3.5 grid-cols-1 sm:grid-cols-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
                  Check-in
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium">
                  <CalendarDays className="h-3.5 w-3.5 text-primary shrink-0" />
                  {formatDate(transaction.checkIn, "dd MMM yyyy")}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
                  Check-out
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium">
                  <CalendarDays className="h-3.5 w-3.5 text-primary shrink-0" />
                  {formatDate(transaction.checkOut, "dd MMM yyyy")}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
                  Guests
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium">
                  <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                  {transaction.totalGuests} guest
                  {transaction.totalGuests > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {isCompleted && transaction.review?.comment && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-[hsl(var(--status-pending))]/10 px-2.5 py-1 text-xs font-medium">
                    <Star className="h-3.5 w-3.5 fill-[hsl(var(--status-pending))] text-[hsl(var(--status-pending))]" />
                    Rated {transaction.review?.rating}/5
                  </span>
                )}
                {canCancel && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-[hsl(var(--status-cancelled))]/10 px-2.5 py-1 text-xs font-medium text-[hsl(var(--status-cancelled))]">
                    <XCircle className="h-3.5 w-3.5" />
                    Cancelled
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-xl gap-1.5"
                >
                  <Link
                    to={`/profile/user/transaction/${transaction.transactionId}`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View details
                  </Link>
                </Button>

                {transaction.status === TransactionStatus.WAITING_FOR_PAYMENT &&
                  !isCancelled && (
                    <Button
                      asChild
                      size="sm"
                      className="rounded-xl gap-1.5 bg-[hsl(var(--status-pending))] hover:bg-[hsl(var(--status-pending))]/90 text-white"
                    >
                      <Link
                        to={`/profile/user/transaction/${transaction.transactionId}/upload-proof`}
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Upload proof
                      </Link>
                    </Button>
                  )}

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-xl gap-1.5"
                >
                  <Link
                    to={`/property/${transaction.room.property.propertyName}`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View property
                  </Link>
                </Button>

                {isCompleted && !transaction.review?.comment && (
                  <Button
                    asChild
                    size="sm"
                    className="rounded-xl gap-1.5 bg-primary hover:bg-primary/90"
                  >
                    <Link
                      to={`/profile/user/review/${transaction.transactionId}`}
                    >
                      <Star className="h-3.5 w-3.5" />
                      Submit review
                    </Link>
                  </Button>
                )}

                {canCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl gap-1.5 text-[hsl(var(--status-cancelled))] hover:text-[hsl(var(--status-cancelled))] hover:bg-[hsl(var(--status-cancelled))]/5"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Cancel booking
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
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
              Are you sure you want to cancel your reservation at{" "}
              <span className="font-semibold text-foreground">
                {transaction.room.property.propertyName}
              </span>{" "}
              ({transaction.room.roomName})? This action cannot be undone. A refund will
              be processed according to the cancellation policy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Keep Booking
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelBooking}
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

export default TransactionCardList;
