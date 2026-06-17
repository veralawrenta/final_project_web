"use client"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useGetTransactionIdByUser } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/price/currency";
import { PaymentMethodEnum } from "@/lib/validator/profile.transaction.schema";
import { TransactionStatus } from "@/types/transaction";
import { formatDate } from "date-fns";
import {
    AlertCircle,
    BedDouble,
    Building2,
    Calendar,
    Clock,
    CreditCard,
    FileText,
    Home,
    MapPin,
    Users
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const TransactionPending = () => {
  const params = useParams();
  const transactionId = params.id as string;
  const { data: trx, isPending } = useGetTransactionIdByUser(transactionId);

  const pending = trx?.status === TransactionStatus.WAITING_FOR_PAYMENT;
  const paymentMethodLabel =
    trx?.paymentMethod === PaymentMethodEnum.BANK_TRANSFER
      ? "Bank Transfer"
      : (trx?.paymentMethod ?? "-");
  const formattedCheckIn = trx?.checkIn
    ? formatDate(trx.checkIn, "dd-MM-yyyy")
    : "-";
  const formattedCheckOut = trx?.checkOut
    ? formatDate(trx.checkOut, "dd-MM-yyyy")
    : "-";

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-center h-16 px-4">
          <h1 className="font-heading font-bold text-lg">Booking Pending</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="bg-card rounded-3xl border border-border shadow-lg overflow-hidden animate-scale-in">
            {/* Top Banner */}
            <div className="relative bg-linear-to-br from-[hsl(var(--gold))]/10 via-primary/5 to-accent/5 p-8 text-center border-b border-border">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div
                  className="absolute inset-0 rounded-full bg-[hsl(var(--gold))]/20 animate-ping"
                  style={{ animationDuration: "2s" }}
                />
                <div className="relative w-full h-full rounded-full bg-linear-to-br from-[hsl(var(--gold))] to-[hsl(var(--gold))]/80 flex items-center justify-center shadow-lg">
                  <Clock className="h-12 w-12 text-white" strokeWidth={2.5} />
                </div>
              </div>

              <h2 className="text-2xl font-heading font-bold mb-2">
                Booking on Hold
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Your reservation has been reserved. Complete payment by
                uploading your proof to confirm it.
              </p>

              <Badge className="mt-4 bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold))] border-[hsl(var(--gold))]/20">
                <Clock className="h-3 w-3 mr-1" /> Awaiting Payment
              </Badge>
            </div>

            {/* Property */}
            <div className="p-6 space-y-5">
              <div className="flex gap-4">
                {trx?.room.property.propertyImages ? (
                  <img
                    src={trx?.room.property.propertyImages[0].urlImages}
                    alt={trx?.room.property.name}
                    className="w-20 h-20 rounded-2xl object-cover shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-bold text-base">
                    {trx?.room.property.name}
                  </h3>
                  {location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5" />{" "}
                      {trx?.room.property.address}
                    </p>
                  )}
                  <Badge variant="outline" className="mt-2 font-mono text-xs">
                    {transactionId}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium flex items-center gap-1">
                    <BedDouble className="h-3 w-3" /> Room
                  </p>
                  <p className="text-sm font-semibold">{trx?.room.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium flex items-center gap-1">
                    <CreditCard className="h-3 w-3" /> Method
                  </p>
                  <p className="text-sm font-semibold">{trx?.paymentMethod}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Check-in
                  </p>
                  <p className="text-sm font-semibold">{formattedCheckIn}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Check-out
                  </p>
                  <p className="text-sm font-semibold">{formattedCheckOut}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium flex items-center gap-1">
                    <Users className="h-3 w-3" /> Guests
                  </p>
                  <p className="text-sm font-semibold">
                    {trx?.totalGuests} guest
                    {Number(trx?.totalGuests) > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> Amount Due
                  </p>
                  <p className="text-sm font-semibold text-primary">
                    {formatCurrency(trx?.totalPrice)}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-4 bg-[hsl(var(--gold))]/5 rounded-2xl border border-[hsl(var(--gold))]/20">
                <AlertCircle className="h-5 w-5 text-[hsl(var(--gold))] shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  Upload your payment proof within{" "}
                  <span className="font-semibold text-foreground">
                    24 hours
                  </span>{" "}
                  to keep this reservation. Otherwise it may be auto-cancelled.
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 space-y-3">
              <Link href={`/profile/user/transactions/${transactionId}`}>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-2xl"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Booking Details
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full rounded-2xl"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Confirmation <span className="font-mono">{transactionId}</span> —
            keep this for your records.
          </p>
        </div>
      </main>
    </div>
  );
};

export default TransactionPending;
