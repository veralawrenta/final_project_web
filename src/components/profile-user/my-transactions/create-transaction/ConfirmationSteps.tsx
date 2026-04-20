import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/price/currency";
import { TransactionPaymentMethod } from "@/types/transaction";
import { differenceInCalendarDays, formatDate } from "date-fns";
import { Badge, Check, Clock, Link, MapPin } from "lucide-react";

const Payment_Label: Record<TransactionPaymentMethod, string> = {
  BANK_TRANSFER: "Bank Transfer",
  CREDIT_CARD: "Credit Card",
  SHOPEEPAY: "ShopeePay",
};

interface ConfirmationStepsProps {
    property: {
        propertyImages: string;
        propertyName: string;
        address: string;
        city: string;
        roomName: string;
        roomPrice: string;
    }
    checkIn: string;
    checkOut: string;
    bookedUnits: number;
    transactionId?: string;
    totalPrice: number;
    paymentMethod: TransactionPaymentMethod;
};

const ConfirmationSteps = (props: ConfirmationStepsProps) => {
    const nights = differenceInCalendarDays(
        new Date(props.checkOut),
        new Date(props.checkIn),
      );
      const subTotalPrice = nights * Math.max(props.bookedUnits, 1) * parseInt(props.property.roomPrice);
      const total = subTotalPrice + Math.round(subTotalPrice * 0.1) + Math.round(subTotalPrice * 0.05);

      const isBankTransfer = props.paymentMethod === "BANK_TRANSFER";

  return (
     <div className="space-y-6">
      {/* Success banner */}
      <div className="bg-linear-to-br from-primary/5 via-card to-primary/5 rounded-3xl border border-primary/20 p-8 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce">
          <Check className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-2">You're all set!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your reservation at <strong>{props.property.propertyName}</strong> has been{" "}
          {isBankTransfer ? "submitted for verification" : "confirmed"}. A confirmation email is on its way.
        </p>
        {isBankTransfer && (
          <Badge className="mt-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
            <Clock className="h-3 w-3 mr-1" /> Pending verification (1–2 hours)
          </Badge>
        )}
      </div>
 
      {/* Booking details */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
        {props.transactionId && (
          <div className="p-5 bg-muted/30 border-b border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Transaction ID</span>
            <Badge className="font-mono text-xs px-3 py-1">
              {props.transactionId}
            </Badge>
          </div>
        )}
 
        <div className="p-6 space-y-4">
          <div className="flex gap-4">
            <img
              src={props.property.propertyImages}
              alt={props.property.propertyName}
              className="w-20 h-20 rounded-2xl object-cover shrink-0"
            />
            <div>
              <h3 className="font-bold">{props.property.propertyName}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3.5 w-3.5" /> {props.property.address}, {props.property.city}
              </p>
            </div>
          </div>
 
          <Separator />
 
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <InfoItem label="Check-in" value={formatDate(props.checkIn, "dd MM yyyy")} />
            <InfoItem label="Check-out" value={formatDate(props.checkOut, "dd MM yyyy")} />
            <InfoItem label="Duration" value={`${nights} night${nights > 1 ? "s" : ""}`} />
            <InfoItem label="Payment" value={Payment_Label[props.paymentMethod]} />
          </div>
 
          <Separator />
 
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">Total</span>
            <span className="font-bold text-2xl text-primary">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
 
      {/* Actions */}
      <div className="flex gap-3">
        <Link to="/" className="flex-1">
          <Button variant="outline" size="lg" className="w-full rounded-2xl">
            Back to Home
          </Button>
        </Link>
        <Link to="/my-bookings" className="flex-1">
          <Button variant="default" size="lg" className="w-full rounded-2xl">
            View My Bookings
          </Button>
        </Link>
      </div>
    </div>
  );
}
 
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs mb-1">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
};

export default ConfirmationSteps;
