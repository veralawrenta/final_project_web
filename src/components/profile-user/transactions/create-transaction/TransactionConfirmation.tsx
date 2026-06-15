import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/price/currency";
import { PropertyInfo } from "@/types/property";
import { TransactionPaymentMethod } from "@/types/transaction";
import { differenceInCalendarDays, format } from "date-fns";
import { Check, Clock, MapPin } from "lucide-react";
import Link from "next/link";

interface TransactionConfirmationProps {
  property: PropertyInfo;
  checkIn: string;
  checkOut: string;
  totalGuests: number;
  bookedUnits: number;
  selectedPaymentMethod: TransactionPaymentMethod;
  confirmationNumber: string;
  basePrice: number;
}

const paymentMethodLabels: Record<TransactionPaymentMethod, string> = {
  BANK_TRANSFER: "Bank Transfer",
  CREDIT_CARD: "Credit Card",
  SHOPEEPAY: "ShopeePay",
};

const TransactionConfirmation = ({
  property,
  checkIn,
  checkOut,
  totalGuests,
  bookedUnits,
  selectedPaymentMethod,
  confirmationNumber,
  basePrice,
}: TransactionConfirmationProps) => {
  const nights = differenceInCalendarDays(new Date(checkOut), new Date(checkIn));
  const subtotal = nights * Math.max(bookedUnits, 1) * basePrice;
  const serviceFee = Math.round(subtotal * 0.1);
  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee + taxes;

  const formatDate = (d: string) =>
    format(new Date(d), "EEE, MMM d, yyyy");

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <div className="bg-linear-to-br from-primary/5 via-card to-primary/5 rounded-3xl border border-primary/20 p-8 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce">
          <Check className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-2">You're all set!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your reservation at{" "}
          <strong>{property.name}</strong> has been{" "}
          {selectedPaymentMethod === "BANK_TRANSFER"
            ? "submitted for verification"
            : "confirmed"}
          . A confirmation email is on its way.
        </p>
        {selectedPaymentMethod === "BANK_TRANSFER" && (
          <Badge className="mt-3 bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" /> Pending verification (1–2 hours)
          </Badge>
        )}
      </div>

      {/* Confirmation Details */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
        <div className="p-6 bg-muted/30 border-b border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Confirmation number
            </span>
            <Badge
              variant="outline"
              className="font-mono text-sm px-3 py-1"
            >
              {confirmationNumber}
            </Badge>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Property */}
          <div className="flex gap-4">
            <img
              src={property.propertyImage.urlImage}
              alt={property.name}
              className="w-20 h-20 rounded-2xl object-cover shrink-0"
            />
            <div>
              <h3 className="font-bold">{property.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3.5 w-3.5" />
                {property.address}
              </p>
            </div>
          </div>

          <Separator />

          {/* Booking details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Check-in</p>
              <p className="font-semibold">{formatDate(checkIn)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Check-out</p>
              <p className="font-semibold">{formatDate(checkOut)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Guests</p>
              <p className="font-semibold">
                {totalGuests} guest{totalGuests > 1 ? "s" : ""}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Units</p>
              <p className="font-semibold">
                {bookedUnits} unit{bookedUnits > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment method</span>
            <span className="font-semibold">
              {paymentMethodLabels[selectedPaymentMethod]}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">Total paid</span>
            <span className="font-bold text-2xl text-primary">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/" className="flex-1">
          <Button variant="outline" size="lg" className="w-full rounded-2xl">
            Back to Home
          </Button>
        </Link>
        <Link href="/profile/user/transactions" className="flex-1">
          <Button size="lg" className="w-full rounded-2xl">
            View My Bookings
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default TransactionConfirmation;