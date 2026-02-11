"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/price/currency";
import { Room } from "@/types/room";
import { format, isValid, parseISO } from "date-fns";
import {
  ArrowLeft,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  Home,
  Info,
  Pencil,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaMoneyBill1Wave } from "react-icons/fa6";

interface TenantRoomDetailsProps {
  room: Room;
}

const typeLabels: Record<string, string> = {
  APARTMENT: "Apartment",
  HOTEL: "Hotel",
  VILLA: "Villa",
  HOUSE: "House",
};

const formatDate = (date: string | Date): string => {
  const parsed = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsed)) return "-";
  return format(parsed, "MMM d, yyyy");
};

const RoomDetailsTenant = ({ room }: TenantRoomDetailsProps) => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const propertyName = room.property?.name;
  const roomType = room.property?.propertyType ?? "HOTEL";
  const capacity = room.totalGuests;
  const price = Number(room.basePrice);

  const maintenanceBlocks = room.roomNonAvailability || [];
  const seasonalRates = room.seasonalRates ?? [];

  const validImages = (room.roomImages || [])
    .sort((a, b) => Number(b.isCover) - Number(a.isCover))
    .map((img) => img.urlImages);

  const totalImages = validImages.length;
  const hasImages = totalImages > 0;
  const currentImage = validImages[currentImageIndex];

  const nextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % totalImages);
  const prevImage = () =>
    setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="w-fit -ml-2 text-muted-foreground hover:text-primary transition-colors"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to listing
          </Button>

          <Button
            variant="default"
            className="gap-2 bg-slate-600"
            onClick={() => router.push(`/dashboard/tenant/room/update/${room.id}`)}
          >
            <Pencil className="h-4 w-4" />
            Edit Room
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{room.name}</h1>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <Home className="h-4 w-4" />
              <span className="font-medium">{propertyName}</span>
              <span>•</span>
              <Badge variant="outline" className="font-normal capitalize">
                {typeLabels[roomType] || roomType.toLowerCase()}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(price)}
            </p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Base Price / Night
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="space-y-3">
            <div className="relative aspect-video w-full bg-muted rounded-2xl overflow-hidden group border border-border">
              {hasImages ? (
                <Image
                  src={currentImage}
                  alt={room.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No Images
                </div>
              )}

              {totalImages > 1 && (
                <>
                  <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full shadow-md"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full shadow-md"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md">
                    {currentImageIndex + 1} / {totalImages}
                  </div>
                </>
              )}
            </div>
            {totalImages > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {validImages.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === idx
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={url}
                      alt="Thumbnail"
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-border">
            <div className="space-y-1">
              <Users className="h-5 w-5 text-primary" />
              <p className="text-xs text-muted-foreground font-semibold uppercase">
                Capacity
              </p>
              <p className="font-bold">{capacity} Guests</p>
            </div>
            <div className="space-y-1">
              <BedDouble className="h-5 w-5 text-primary" />
              <p className="text-xs text-muted-foreground font-semibold uppercase">
                Type
              </p>
              <p className="font-bold">{typeLabels[roomType] || roomType}</p>
            </div>
            <div className="space-y-1">
              <Home className="h-5 w-5 text-primary" />
              <p className="text-xs text-muted-foreground font-semibold uppercase">
                Units
              </p>
              <p className="font-bold">{room.totalUnits || 0} Total</p>
            </div>
            <div className="space-y-1">
              <FaMoneyBill1Wave className="h-5 w-5 text-primary" />
              <p className="text-xs text-muted-foreground font-semibold uppercase">
                Price
              </p>
              <p className="font-bold">{formatCurrency(room.basePrice)}</p>
            </div>
          </div>

          {room.description && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Info className="h-5 w-5" /> About this room
              </h3>
              <div
                className="text-muted-foreground leading-relaxed prose prose-neutral dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: room.description }}
              />
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Seasonal Rates
            </h3>
            {seasonalRates.length > 0 ? (
              <div className="space-y-3">
                {seasonalRates.map((rate: any) => (
                  <div
                    key={rate.id}
                    className="p-3 rounded-xl bg-muted/50 border border-border/50"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-sm">{rate.name}</span>
                      <span className="font-bold text-primary">
                        {formatCurrency(Number(rate.fixedPrice))}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {formatDate(rate.startDate)} — {formatDate(rate.endDate)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No seasonal adjustments.
              </p>
            )}
          </div>

          {maintenanceBlocks.length > 0 && (
            <div className="bg-amber-50/50 dark:bg-amber-950/10 rounded-2xl border border-amber-200 dark:border-amber-900 p-6 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2 text-amber-800 dark:text-amber-400">
                <Wrench className="h-5 w-5" />
                Maintenance
              </h3>
              <div className="space-y-3">
                {maintenanceBlocks.map((block) => (
                  <div
                    key={block.id}
                    className="text-sm border-l-2 border-amber-400 pl-3"
                  >
                    <p className="font-medium">{block.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(block.startDate)} —{" "}
                      {formatDate(block.endDate)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsTenant;
