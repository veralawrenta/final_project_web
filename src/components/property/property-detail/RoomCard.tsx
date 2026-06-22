"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/price/currency";
import { cn } from "@/lib/utils";
import { RoomIdPublic } from "@/types/room";
import { Check, Users } from "lucide-react";

interface RoomCardProps {
  room: RoomIdPublic;
  nights: number;
  isSelected?: boolean;
  onSelect: () => void;
}

const RoomCard = ({
  room,
  nights,
  isSelected = false,
  onSelect,
}: RoomCardProps) => {
  const image = room.roomImages.find((img) => img.isCover) ||
    room.roomImages[0] || { urlImages: "/placeholder.svg" };

  const totalPrice = room.displayPrice * nights;
  
  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md",
        !room.isAvailable && 'opacity-60 cursor-not-allowed',
        isSelected && "ring-2 ring-primary",
      )}
      onClick={() => room.isAvailable && onSelect?.()}
    >
      {/* Changes layout to horizontal ONLY at 1024px (lg). 
        Stays vertical and neat at 768px (md) to prevent text crowding.
      */}
      <div className="flex flex-col lg:flex-row">
        
        {/* Image Container */}
        <div className="relative w-full lg:w-56 xl:w-64 aspect-video lg:aspect-square shrink-0 bg-muted">
          <img
            src={image.urlImages}
            alt={room.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-102"
          />
          {!room.isAvailable && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                Unavailable
              </span>
            </div>
          )}
          {isSelected && room.isAvailable && (
            <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1.5 shadow-sm">
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="flex-1 p-5 flex flex-col justify-between gap-4">
          
          {/* Top Section: Title & Price */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-4">
            <div className="space-y-1.5">
              <h3 className="font-semibold text-lg lg:text-xl tracking-tight line-clamp-2">
                {room.name}
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="h-4 w-4 shrink-0" />
                <span>Up to {room.totalGuests} guests</span>
              </div>
            </div>

            <div className="sm:text-right shrink-0">
              <div className="text-xl font-bold text-primary">
                {formatCurrency(room.displayPrice)}
              </div>
              <div className="text-xs text-muted-foreground">per night</div>
            </div>
          </div>

          {/* Bottom Section: Total & CTA Action */}
          {nights > 0 && room.isAvailable && (
            <div className="pt-4 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-auto">
              <div>
                <span className="text-sm text-muted-foreground">
                  {nights} night{nights > 1 ? 's' : ''} total:
                </span>
                <span className="ml-2 font-bold text-lg text-foreground">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
              <Button 
                variant={isSelected ? "default" : "outline"}
                className="w-full sm:w-auto font-medium shadow-sm"
              >
                {isSelected ? "Selected" : "Select Room"}
              </Button>
            </div>
          )}

          {!room.isAvailable && (
            <div className="pt-4 border-t text-sm font-medium text-destructive mt-auto">
              Not available for selected dates
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default RoomCard;