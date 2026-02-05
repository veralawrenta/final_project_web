"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/price/currency";
import { cn } from "@/lib/utils";
import { RoomPropertyCard } from "@/types/room";
import { Check, Users } from "lucide-react";

interface RoomCardProps {
  room: RoomPropertyCard;
  nights: number;
  isSelected?: boolean;
  onSelect: () => void;
  onBook?: () => void;
}

const RoomCard = ({
  room,
  nights,
  isSelected = false,
  onSelect,
  onBook,
}: RoomCardProps) => {
  const image = room.roomImages.find((img) => img.isCover) ||
    room.roomImages[0] || { imageUrl: "/placeholder.svg" };

  const totalPrice = room.displayPrice * nights;
  return (
    <Card 
      className={cn(
        "overflow-hidden cursor-pointer transition-all",
        !room.isAvailable && 'opacity-50',
        isSelected && "ring-2 ring-primary",
      )}
      onClick={() => room.isAvailable && onSelect?.()} 
    >
      <div className="md:flex">
        <div className="relative w-full md:w-48 h-48">
          <img
            src={image.imageUrl}
            alt={room.name}
            className="w-full h-full object-cover"
          />
          {!room.isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold">Unavailable</span>
            </div>
          )}
          {isSelected && room.isAvailable && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1.5">
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{room.name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Users className="h-4 w-4" />
                <span>Up to {room.totalGuests} guests</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl font-bold text-primary">
                {formatCurrency(room.displayPrice)}
              </div>
              <div className="text-xs text-muted-foreground">per night</div>
            </div>
          </div>

          {nights > 0 && room.isAvailable && (
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <div>
                <span className="text-sm text-muted-foreground">
                  {nights} night{nights > 1 ? 's' : ''} total:
                </span>
                <span className="ml-2 font-semibold">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  onBook?.();
                }}
                variant={isSelected ? "default" : "outline"}
              >
                {isSelected ? "Book This Room" : "Select & Book"}
              </Button>
            </div>
          )}

          {!room.isAvailable && (
            <div className="mt-4 text-sm text-destructive">
              Not available for selected dates
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
export default RoomCard;
