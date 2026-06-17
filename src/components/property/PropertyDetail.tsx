"use client";

import Navbar from "@/components/Navbar";
import { PropertyDetailSearchBar } from "@/components/property/SearchBarProperty";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPropertyWithAvailability } from "@/hooks/useProperty";
import { formatCurrency } from "@/lib/price/currency";
import { RoomIdPublic } from "@/types/room";
import { differenceInCalendarDays, format, parse } from "date-fns";
import { MapPin } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PropertyAmenities } from "./amenities/PropertyAmenities";
import RoomCard from "./property-detail/RoomCard";
import RoomPricePreview from "./property-detail/RoomPricePreview";
import PropertyReviewCard from "./PropertyReviewCard";

const mapRoomToCard = (room: any): RoomIdPublic => ({
  id: room.id,
  name: room.name,
  basePrice: room.basePrice,
  description: room.description,
  displayPrice: room.displayPrice,
  totalGuests: room.totalGuests,
  isAvailable: room.isAvailable,
  useSeasonalRate: room.useSeasonalRate,
  roomImages: room.roomImages.map((img: any) => ({
    urlImages: img.urlImages,
    isCover: img.isCover,
  })),
});

export default function PropertyDetail() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const propertyId = Number(params.id);
  const checkInParam = searchParams.get("checkIn");
  const checkOutParam = searchParams.get("checkOut");
  const guestsParam = searchParams.get("guests");

  const today = new Date();
  const checkIn = checkInParam
    ? parse(checkInParam, "dd-MM-yyyy", new Date())
    : today;
  const checkOut = checkOutParam
    ? parse(checkOutParam, "dd-MM-yyyy", new Date())
    : new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const guests = guestsParam ? Number(guestsParam) : 1;
  const nights = differenceInCalendarDays(checkOut, checkIn);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<RoomIdPublic | null>(null);

  const {
    data: property,
    isLoading,
    isError,
  } = useGetPropertyWithAvailability(
    propertyId,
    checkIn,
    checkOut,
    guests,
    Boolean(propertyId),
  );

  const rooms: RoomIdPublic[] = property?.rooms.map(mapRoomToCard) ?? [];

  useEffect(() => {
    if (property && !selectedRoom) {
      const firstAvailable = rooms.find((r) => r.isAvailable);
      if (firstAvailable) {
        setSelectedRoom(firstAvailable);
      }
    }
  }, [property]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8 space-y-6">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
          <Button onClick={() => router.push("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const availableRooms = rooms.filter((r) => r.isAvailable);

  const lowestPrice =
    availableRooms.length > 0
      ? Math.min(...availableRooms.map((r) => r.displayPrice))
      : (rooms[0]?.basePrice ?? 0);

  const displayPrice = selectedRoom?.displayPrice ?? lowestPrice;

  const images =
    property.propertyImages.length > 0
      ? property.propertyImages.map((img) => img.urlImages)
      : ["/placeholder-property.jpg"];

  const handleContinue = () => {
    if (!selectedRoom) return;
    const qs = new URLSearchParams({
      checkIn: format(checkIn, "dd-MM-yyyy"),
      checkOut: format(checkOut, "dd-MM-yyyy"),
      guests: String(guests),
      roomId: String(selectedRoom.id),
    });
    router.push(
      `/properties/${propertyId}/rooms/${selectedRoom.id}/transaction?${qs.toString()}`,
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="md:hidden p-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium"
        ></button>
      </div>

      <main className="container mx-auto pb-20 md:pb-12 mt-16">
        <div className="mt-6 px-4 md:px-0">
          <PropertyDetailSearchBar
            propertyId={propertyId}
            maxGuests={Math.max(...rooms.map((r) => r.totalGuests), 10)}
            defaultCheckIn={checkIn}
            defaultCheckOut={checkOut}
            defaultGuests={guests}
          />
        </div>
        <div className="relative mt-6 px-4 md:px-0">
          <div className="aspect-video overflow-hidden rounded-xl">
            <img
              src={images[selectedImage]}
              alt={property.name}
              className="w-full h-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-2 h-2 rounded-full ${
                    i === selectedImage ? "bg-white w-6" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6 px-4 md:px-0">
          <div className="md:col-span-1 lg:col-span-2 space-y-6">
            <div>
              <span className="inline-block px-3 py-1 bg-secondary rounded-full text-sm mb-2 font-semibold">
                {property.propertyType}
              </span>
              <h1 className="text-3xl font-bold">{property.name}</h1>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {property.city.name}
              </div>
            </div>

            <h2 className="text-muted-foreground">Property Description</h2>
            <div
              className="prose prose-neutral max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{
                __html: property.description as string,
              }}
            />

            <PropertyAmenities amenities={property.amenities} />
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Rooms ({availableRooms.length})
              </h2>

              <div className="space-y-4">
                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    nights={nights}
                    isSelected={selectedRoom?.id === room.id}
                    onSelect={() => room.isAvailable && setSelectedRoom(room)}
                  />
                ))}
              </div>
            </div>
            <div>
              <PropertyReviewCard propertyId={propertyId} />
            </div>
          </div>
          <div className="hidden md:block">
            <RoomPricePreview
              room={selectedRoom}
              nights={nights}
              checkIn={checkIn}
              checkOut={checkOut}
              guests={guests}
              displayPrice={displayPrice}
              onContinue={handleContinue}
            />
          </div>
        </div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t shadow-lg px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            {nights} night{nights !== 1 ? "s" : ""}
          </p>
          <p className="text-lg font-bold">
            {formatCurrency(displayPrice * nights)}
          </p>
          {selectedRoom && (
            <p className="text-xs text-muted-foreground">{selectedRoom.name}</p>
          )}
        </div>
        <Button
          onClick={handleContinue}
          disabled={!selectedRoom}
          className="px-6"
        >
          Reserve
        </Button>
      </div>
    </div>
  );
}
