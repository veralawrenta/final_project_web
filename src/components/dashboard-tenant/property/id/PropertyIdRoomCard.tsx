"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatLocalDate } from "@/lib/date/date";
import { RoomPropertyCard } from "@/types/room";
import { AlertCircle, Home, TrendingUp, Users } from "lucide-react";
import Image from "next/image";

interface RoomCardProps {
  room: RoomPropertyCard;
}

export default function RoomCard({ room }: RoomCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasMaintenanceBlocks =
    room.roomNonAvailability && room.roomNonAvailability.length > 0;
  const hasSeasonalRates = room.seasonalRates && room.seasonalRates.length > 0;

  const roomImage =
    room.roomImages && room.roomImages.length > 0
      ? room.roomImages[0].urlImages
      : "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=400&fit=crop";

  const toggleDetails = () => {
    setIsExpanded(!isExpanded);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return formatLocalDate(dateObj);
  };
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row">
        {/* Room Image */}
        <div className="relative w-full md:w-48 h-48 bg-muted shrink-0">
          <Image
            src={roomImage}
            alt={room.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Room Info */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-bold">{room.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  ${room.basePrice} per night
                </p>
              </div>

              <div className="flex gap-2 flex-wrap justify-end">
                {hasMaintenanceBlocks && (
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    Maintenance
                  </Badge>
                )}
                {hasSeasonalRates && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <TrendingUp className="w-3 h-3" />
                    Seasonal
                  </Badge>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{room.totalGuests} Guests Max</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Home className="w-4 h-4" />
                <span>{room.totalUnits} Unit(s)</span>
              </div>
            </div>

            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-border space-y-3">
                {hasMaintenanceBlocks && (
                  <div>
                    <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      Maintenance Blocks
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                      {room.roomNonAvailability.map((block) => (
                        <li key={block.id}>
                          {formatDate(block.startDate)} to{" "}
                          {formatDate(block.endDate)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {hasSeasonalRates && (
                  <div>
                    <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      Seasonal Rates
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                      {room.seasonalRates.map((rate) => (
                        <li key={rate.id}>
                          <span className="font-medium text-foreground">
                            {rate.name}:
                          </span>{" "}
                          ${rate.fixedPrice}
                          {" ("}
                          {formatDate(rate.startDate)} to{" "}
                          {formatDate(rate.endDate)}
                          {")"}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {(hasMaintenanceBlocks || hasSeasonalRates) && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDetails}
              className="w-fit mt-4"
            >
              {isExpanded ? "Show Less" : "Show Details"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
