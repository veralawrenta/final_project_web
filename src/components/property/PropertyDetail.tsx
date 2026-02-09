// app/property/[id]/page.tsx
"use client";

import { ArrowLeft, MapPin } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyDetailSearchBar } from "@/components/property/SearchBarProperty";
import { PropertyAmenities } from "./amenities/PropertyAmenities";
import RoomCard from "./property-detail/RoomCard";

import { useGetPropertyWithAvailability } from "@/hooks/useProperty";
import {
  countNights,
  fromDateString,
  normalizeLocalDate,
} from "@/lib/date/date";
import { RoomIdPublic } from "@/types/room";
import { RoomPricePreview } from "./property-detail/RoomPricePreview";

const mapRoomToCard = (room: any): RoomIdPublic => ({
  id: room.id,
  name: room.name,
  basePrice: room.basePrice,
  displayPrice: room.displayPrice,
  totalGuests: room.totalGuests,
  isAvailable: room.isAvailable,
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

  const today = normalizeLocalDate(new Date());
  const checkIn = checkInParam ? fromDateString(checkInParam) : today;
  const checkOut = checkOutParam
    ? fromDateString(checkOutParam)
    : new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const guests = guestsParam ? Number(guestsParam) : 1;
  const nights = countNights(checkIn, checkOut);

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
    Boolean(propertyId)
  );

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

  const rooms: RoomIdPublic[] = property.rooms.map(mapRoomToCard);
  const availableRooms = rooms.filter((r) => r.isAvailable);

  const lowestPrice =
    availableRooms.length > 0
      ? Math.min(...availableRooms.map((r) => r.displayPrice))
      : rooms[0]?.basePrice ?? 0;

  const displayPrice = selectedRoom?.displayPrice ?? lowestPrice;

  const images =
    property.propertyImages.length > 0
      ? property.propertyImages.map((img) => img.urlImages)
      : ["/placeholder-property.jpg"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="md:hidden p-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      <main className="container mx-auto pb-20 md:pb-12 mt-16">
        <div className="mt-6 px-4 md:px-0">
          <PropertyDetailSearchBar
            propertyId={propertyId}
            maxGuests={Math.max(...rooms.map((r) => r.totalGuests))}
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

        <div className="grid md:grid-cols-3 gap-8 mt-6 px-4 md:px-0">
          <div className="md:col-span-2 space-y-6">
            <div>
              <span className="inline-block px-3 py-1 bg-secondary rounded-full text-sm mb-2">
                {property.propertyType.toLowerCase()}
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

            {/* Rooms */}
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
          </div>
          <RoomPricePreview
            room={selectedRoom}
            nights={nights}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            displayPrice={displayPrice}
          />
        </div>
      </main>
    </div>
  );
}
