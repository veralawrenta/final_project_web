import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/price/currency";
import { RoomPropertyCard } from "@/types/room";
import { format } from "date-fns";

interface Props {
  room: RoomPropertyCard | null;
  nights: number;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  displayPrice: number;
}

export function RoomPricePreview({
  room,
  nights,
  checkIn,
  checkOut,
  guests,
  displayPrice,
}: Props) {
  if (!room) {
    return (
      <div className="hidden md:block sticky top-24 p-6 border rounded-xl bg-card text-sm text-muted-foreground">
        Select a room to preview price
      </div>
    );
  }

  const isSeasonal = room.displayPrice !== room.basePrice;
  const total = nights * room.displayPrice;

  return (
    <div className="hidden md:block sticky top-24 p-6 border rounded-xl bg-card space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Selected Room</p>
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
}
