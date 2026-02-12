import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/price/currency";
import { RoomIdPublic } from "@/types/room";
import { format } from "date-fns";
import { BedDouble } from "lucide-react";

interface Props {
  room: RoomIdPublic | null;
  nights: number;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  displayPrice: number;
}

const RoomPricePreview = ({
  room,
  nights,
  checkIn,
  checkOut,
  guests,
  displayPrice,
}: Props) => {
  if (!room) {
    return (
      <div className="hidden md:block sticky top-24 p-6 border rounded-xl bg-secondary/10 opacity-60 grayscale-50 select-none">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-muted-foreground/20 rounded animate-pulse" />
            <div className="h-6 w-full bg-muted-foreground/10 rounded" />
          </div>

          <div className="pb-4 border-b border-muted-foreground/20">
            <div className="h-8 w-32 bg-muted-foreground/10 rounded" />
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-px bg-muted-foreground/20 border border-muted-foreground/20 rounded-lg overflow-hidden opacity-50">
              <div className="bg-background/50 p-3 h-14" />
              <div className="bg-background/50 p-3 h-14" />
              <div className="col-span-2 bg-background/50 p-3 h-14 border-t border-muted-foreground/20" />
            </div>
          </div>

          <Button
            disabled
            className="w-full bg-muted-foreground border-none"
          >
            Select a room
          </Button>

          <p className="text-[11px] text-center text-primary font-bold flex items-center justify-center gap-1">
            <BedDouble className="w-3 h-3" />
            Choose a room to view total
          </p>
        </div>
      </div>
    );
  }

  const isSeasonal = room.displayPrice !== room.basePrice;
  const total = nights * room.displayPrice;

  return (
    <div className="hidden md:block sticky top-24 p-6 border rounded-xl bg-card space-y-4">
      <div>
        <p className="text-sm text-primary">Selected Room</p>
        <h3 className="font-semibold">{room.name}</h3>
      </div>

      <div>
        <div className="text-2xl font-bold">
          {formatCurrency(room.displayPrice)}
          <span className="text-sm text-muted-foreground"> / night</span>
        </div>
        {isSeasonal && (
          <p className="text-xs text-orange-600">Seasonal price applied</p>
        )}
      </div>

      {nights > 0 && (
        <div className="text-sm">
          {nights} night{nights > 1 ? "s" : ""} •{" "}
          <strong>{formatCurrency(total)}</strong>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Check-in</p>
          {format(checkIn, "MMM dd")}
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Check-out</p>
          {format(checkOut, "MMM dd")}
        </div>
        <div className="col-span-2">
          <p className="text-muted-foreground text-xs">Guests</p>
          {guests}
        </div>
      </div>

      <Button disabled={!room.isAvailable} className="w-full">
        {room.isAvailable ? "Continue" : "Unavailable"}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Price preview only — no booking yet
      </p>
    </div>
  );
};

export default RoomPricePreview;
