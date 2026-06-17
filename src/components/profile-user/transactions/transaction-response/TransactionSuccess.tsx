"use client"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useGetTransactionIdByUser } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/price/currency";
import { PaymentMethodEnum } from "@/lib/validator/profile.transaction.schema";
import { formatDate } from "date-fns";
import {
    ArrowRight,
    Calendar,
    Check,
    Clock,
    CreditCard,
    FileText,
    Home,
    MapPin,
    Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
const TransactionSuccess = () => {
  const params = useParams();
  const transactionId = params.transactionId as string;
  const { data: transaction, isPending } = useGetTransactionIdByUser(transactionId);

  const paymentMethod = PaymentMethodEnum;
  const isBankTransfer = transaction?.paymentMethod === paymentMethod.BANK_TRANSFER;
  
  if (isPending) {
    return (
      <div className="space-y-4 animate-pulse">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="container flex items-center justify-center h-16 px-4">
            <div className="h-5 w-32 bg-muted rounded-lg" />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-lg">
            <div className="bg-card rounded-3xl border border-border shadow-lg overflow-hidden">
              
              <div className="p-8 text-center border-b border-border bg-muted/10 space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full bg-muted/60" />
                
                <div className="h-6 w-48 bg-muted rounded-lg mx-auto" />
                <div className="h-4 w-72 bg-muted/60 rounded-md mx-auto" />
                <div className="h-5 w-36 bg-muted/40 rounded-full mx-auto mt-2" />
              </div>

              <div className="p-6 space-y-5">
                <div className="flex gap-4">

                  <div className="w-20 h-20 rounded-2xl bg-muted/60 shrink-0" />
                  
                  <div className="flex-1 space-y-2.5 mt-1">
                    <div className="h-5 w-2/3 bg-muted rounded-lg" />
                    <div className="h-3.5 w-1/2 bg-muted/60 rounded-md" />
                    <div className="h-5 w-24 bg-muted/40 rounded-md" />
                  </div>
                </div>

                <Separator />
                <div className="grid grid-cols-2 gap-5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={`grid-sk-${i}`} className="space-y-2">
                      <div className="h-3 w-16 bg-muted/50 rounded" />
                      <div className="h-4 w-28 bg-muted rounded" />
                    </div>
                  ))}
                </div>

                <Separator />
                <div className="flex items-center justify-between py-1">
                  <div className="h-4 w-20 bg-muted/60 rounded" />
                  <div className="h-7 w-32 bg-muted rounded-xl" />
                </div>
              </div>
              <div className="p-6 pt-0 space-y-3">
                <div className="h-11 w-full bg-muted rounded-2xl" />
                <div className="h-11 w-full bg-muted/60 rounded-2xl" />
              </div>

            </div>
            <div className="h-3 w-64 bg-muted/40 rounded mx-auto mt-6" />
          </div>
        </main>
      </div>
    )
  }


  return (
    <div className="space-y-4">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-center h-16 px-4">
          <h1 className="font-heading font-bold text-lg">Payment Status</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="bg-card rounded-3xl border border-border shadow-lg overflow-hidden animate-scale-in">
            <div className="relative bg-linear-to-br from-[hsl(var(--status-confirmed))]/10 via-primary/5 to-accent/5 p-8 text-center border-b border-border">
              {/* Animated rings */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div
                  className="absolute inset-0 rounded-full bg-[hsl(var(--status-confirmed))]/20 animate-ping"
                  style={{ animationDuration: "2s" }}
                />
                <div
                  className="absolute inset-2 rounded-full bg-[hsl(var(--status-confirmed))]/10 animate-ping"
                  style={{ animationDuration: "2.5s" }}
                />
                <div className="relative w-full h-full rounded-full bg-linear-to-br from-[hsl(var(--status-confirmed))] to-[hsl(var(--status-confirmed))]/80 flex items-center justify-center shadow-lg">
                  <Check className="h-12 w-12 text-white" strokeWidth={3} />
                </div>
              </div>

              <h2 className="text-2xl font-heading font-bold mb-2">
                {isBankTransfer ? "Booking Submitted!" : "Payment Successful!"}
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {isBankTransfer
                  ? "Your reservation has been submitted and is awaiting payment verification."
                  : "Your payment has been processed successfully and your reservation is confirmed."}
              </p>

              {isBankTransfer && (
                <Badge className="mt-4 bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold))] border-[hsl(var(--gold))]/20">
                  <Clock className="h-3 w-3 mr-1" /> Verification: 1-2 hours
                </Badge>
              )}
            </div>
            <div className="p-6 space-y-5">
              <div className="flex gap-4">
                {transaction?.room.property.propertyImages[0].urlImages ? (
                  <img
                    src={transaction?.room.property.propertyImages[0].urlImages}
                    alt={transaction?.room.property.name}
                    className="w-20 h-20 rounded-2xl object-cover shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-bold text-base">
                    {transaction?.room.property.name}
                  </h3>
                  {transaction?.room.property.address && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5" /> {transaction?.room.property.address}
                    </p>
                  )}
                  <Badge variant="outline" className="mt-2 font-mono text-xs">
                    {transaction?.displayStatus}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Check-in
                  </p>
                  <p className="text-sm font-semibold">{transaction?.checkIn ? formatDate(transaction?.checkIn, "dd-MM-yyyy"): "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Check-out
                  </p>
                  <p className="text-sm font-semibold">
                    {transaction?.checkOut ? formatDate(transaction?.checkOut, "dd-MM-yyyy") : "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium flex items-center gap-1">
                    <Users className="h-3 w-3" /> Guests
                  </p>
                  <p className="text-sm font-semibold">
                    {transaction?.totalGuests} guest{Number(transaction?.totalGuests) > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium flex items-center gap-1">
                    <CreditCard className="h-3 w-3" /> Method
                  </p>
                  <p className="text-sm font-semibold">{transaction?.paymentMethod}</p>
                </div>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Total Paid
                </span>
                <span className="font-heading font-bold text-2xl text-primary">
                  {formatCurrency(transaction?.totalPrice)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 space-y-3">
              <Link href={`/profile/user/transaction/${transactionId}`}>
                <Button
                  variant="link"
                  size="lg"
                  className="w-full rounded-2xl group"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View My Bookings
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Link href={"/"}>
                <Button
                  variant="outline"
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
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </main>
    </div>
  );
};
export default TransactionSuccess;
