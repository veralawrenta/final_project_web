import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STATUS_CONFIG } from "@/lib/transaction-config";
import { Transactions, TransactionStatus } from "@/types/transaction";
import { differenceInCalendarDays, formatDate, startOfDay } from "date-fns";
import { CalendarDays, Clock, Eye, Link, MapPin, Star, Upload, Users, XCircle } from "lucide-react";

interface TransactionCardProps {
  transaction: Transactions;
  onCancel?: () => void;
  isCancellable?: boolean;
}

const TransactionCard = ({
  transaction,
  onCancel,
  isCancellable,
}: TransactionCardProps) => {
  const statusConfig = STATUS_CONFIG[transaction.status] ?? {
    label: transaction.status,
    className: "bg-muted text-muted-foreground border-border",
    icon: Clock,
  };

  const StatusIcon = statusConfig.icon;
  const image =
    transaction.room.property.propertyImages?.urlImages ||
    "/placeholder-image.png";

  const nights = differenceInCalendarDays(
    new Date(startOfDay(transaction.checkOut)),
    new Date(startOfDay(transaction.checkIn)),
  );

  const canCancel = transaction.status === TransactionStatus.WAITING_FOR_PAYMENT && !transaction.paymentDate;

  const isCompleted = transaction.status === TransactionStatus.COMPLETED && new Date (transaction.checkOut) < new Date();

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex flex-col lg:flex-row">
        {/* Image */}
        <div className="relative h-52 w-full overflow-hidden bg-secondary lg:h-auto lg:w-64">
          <img src={transaction.room.property.propertyImages?.urlImages || "/placeholder-image.png"} alt={transaction.room.property.propertyName} className="h-full w-full object-cover" />
          <Badge className={`absolute left-3 top-3 rounded-lg border px-2.5 py-1 text-xs font-semibold gap-1 ${statusConfig.className}`}>
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5">
          {/* Title row */}
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Link to={`/my-bookings/${transaction.transactionId}`} className="text-lg font-heading font-bold hover:text-primary transition-colors">
                  {transaction.room.property.propertyName}
                </Link>
                <Link to={`/my-bookings/${transaction.transactionId}`}>
                  <Badge variant="outline" className="rounded-lg font-mono text-[11px] px-2 py-0.5 hover:bg-primary/10 hover:border-primary/30 transition-colors cursor-pointer">
                    {transaction.transactionId}
                  </Badge>
                </Link>
              </div>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {transaction.room.property.address}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Badge variant="secondary" className="rounded-lg px-2.5 py-1 text-xs">
                  {transaction.room.roomName}
                </Badge>
                <Badge variant="outline" className="rounded-lg px-2.5 py-1 text-xs">
                  {transaction.paymentMethod}
                </Badge>
              </div>
            </div>

            {/* Price */}
            <div className="rounded-xl bg-primary/5 border border-primary/10 px-4 py-3 xl:min-w-36 text-right xl:text-left">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Total</p>
              <p className="mt-0.5 text-2xl font-heading font-bold text-primary">formatCurrency({transaction.totalPrice})</p>
            </div>
          </div>

          {/* Date grid */}
          <div className="mt-4 grid gap-3 rounded-xl border border-border bg-muted/30 p-3.5 md:grid-cols-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">Check-in</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium">
                <CalendarDays className="h-3.5 w-3.5 text-primary" />
                {formatDate(transaction.checkIn, "dd MM yyyy")}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">Check-out</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium">
                <CalendarDays className="h-3.5 w-3.5 text-primary" />
                {formatDate(transaction.checkOut, "dd MM yyyy")}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">Guests</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium">
                <Users className="h-3.5 w-3.5 text-primary" />
                {transaction.totalGuests} guest{transaction.totalGuests > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {transaction.status === TransactionStatus.COMPLETED && transaction.review && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-[hsl(var(--status-pending))]/10 px-2.5 py-1 text-xs font-medium">
                  <Star className="h-3.5 w-3.5 fill-[hsl(var(--status-pending))] text-[hsl(var(--status-pending))]" />
                  Rated {transaction.review?.rating ?? 0}/5
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm" className="rounded-xl gap-1.5">
                <Link to={`/profile/user/transactions/${transaction.transactionId}`}>
                  <Eye className="h-3.5 w-3.5" />
                  View details
                </Link>
              </Button>

              {transaction.status === TransactionStatus.WAITING_FOR_PAYMENT && (
                <Button asChild size="sm" className="rounded-xl gap-1.5 bg-[hsl(var(--status-pending))] hover:bg-[hsl(var(--status-pending))]/90 text-white">
                  <Link to={`/profile/user/transactions/${transaction.transactionId}`}>
                    <Upload className="h-3.5 w-3.5" />
                    Upload proof
                  </Link>
                </Button>
              )}

              <Button asChild variant="outline" size="sm" className="rounded-xl gap-1.5">
                <Link to={`/property/${transaction.room.property.propertyName}`}>
                  <Eye className="h-3.5 w-3.5" />
                  View property
                </Link>
              </Button>

              {transaction.status === TransactionStatus.COMPLETED && !transaction.review && (
                <Button asChild size="sm" className="rounded-xl gap-1.5 bg-primary hover:bg-primary/90">
                  <Link to={`/review/${transaction.transactionId}`}>
                    <Star className="h-3.5 w-3.5" />
                    Submit review
                  </Link>
                </Button>
              )}

              {(transaction.status === TransactionStatus.WAITING_FOR_PAYMENT || transaction.status === TransactionStatus.WAITING_FOR_CONFIRMATION) && (
                <Button variant="outline" size="sm" onClick={onCancel} className="rounded-xl gap-1.5 text-[hsl(var(--status-cancelled))] hover:text-[hsl(var(--status-cancelled))] hover:bg-[hsl(var(--status-cancelled))]/5">
                  <XCircle className="h-3.5 w-3.5" />
                  Cancel booking
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default TransactionCard;
