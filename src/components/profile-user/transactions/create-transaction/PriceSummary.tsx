import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  TransactionSteps,
  TransactionPaymentMethod,
} from "@/types/transaction";
import { Star, Shield, Check, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/price/currency";
import { Property, PropertyRoomDetail } from "@/types/property";
import { RoomIdPublic } from "@/types/room";

interface PriceSummaryProps {
  property: PropertyRoomDetail;
  selectedRoom: RoomIdPublic;
  nights: number;
  bookedUnits: number;
  step: TransactionSteps;
  selectedPaymentMethod: TransactionPaymentMethod;
  isProcessing: boolean;
  onContinue: () => void;
}

const PriceSummary = ({
  property,
  selectedRoom,
  nights,
  bookedUnits,
  step,
  selectedPaymentMethod,
  isProcessing,
  onContinue,
}: PriceSummaryProps) => {
  const total =
    nights > 0
      ? selectedRoom.basePrice * nights * Math.max(bookedUnits, 1)
      : 0;

  const ctaLabel = () => {
    if (isProcessing) return null;
    if (step === "details") return "Continue to Payment";
    if (selectedPaymentMethod === "BANK_TRANSFER") return "Create Booking";
    return `Pay ${nights > 0 ? `Rp ${total.toLocaleString("id-ID")}` : ""}`;
  };

  return (
    <div className="sticky top-24 space-y-6">
      <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <img
            src={
              property.propertyImages.find((img) => img.isCover)?.urlImages ??
              property.propertyImages[0]?.urlImages
            }
            alt={property.name}
            className="w-14 h-14 rounded-xl object-cover"
          />
          {/*
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">{property.name}</h4>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-current text-yellow-400" />
              {property.rooms.transactions.reviews.ratings}
            </div>
          </div>
          */}
        </div>

        <Separator className="mb-5" />

        <h4 className="font-bold mb-4">Price Breakdown</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {formatCurrency(selectedRoom.basePrice)} ×{" "}
              {nights > 0 ? `${nights} nights` : "—"}
              {bookedUnits > 1 ? ` × ${bookedUnits} units` : ""}
            </span>
            <span className="font-medium">
              {nights > 0 ? formatCurrency(total) : "—"}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">
              {nights > 0 ? formatCurrency(total) : "—"}
            </span>
          </div>
        </div>

        <Button
          variant="default"
          size="lg"
          className="w-full mt-6 rounded-2xl"
          onClick={onContinue}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            ctaLabel()
          )}
        </Button>
      </div>
      <div className="bg-card rounded-3xl border border-border p-5 shadow-sm">
        <div className="space-y-3">
          {[
            { icon: Shield, text: "Secure checkout with SSL encryption" },
            { icon: Check, text: "Free cancellation up to 24h before" },
            { icon: Clock, text: "Instant booking confirmation" },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PriceSummary;
