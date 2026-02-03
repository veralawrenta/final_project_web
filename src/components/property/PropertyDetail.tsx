"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPropertyWithAvailability } from "@/hooks/useProperty";
import {
  countNights,
  formatLocalDate,
  fromDateString,
  normalizeLocalDate,
} from "@/lib/date/date";
import { formatCurrency } from "@/lib/price/currency";
import { format } from "date-fns";
import {
  ArrowLeft,
  Car,
  Heart,
  MapPin,
  Share,
  Tv,
  Utensils,
  Waves,
  Wifi,
  Wind,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "../Navbar";
import { PropertyDetailSearchBar } from "./SearchBarProperty";

const amenityIcons: Record<string, any> = {
  "Free WiFi": Wifi,
  "Free Parking": Car,
  Pool: Waves,
  Kitchen: Utensils,
  "Smart TV": Tv,
  "Air Conditioning": Wind,
};

export default function PropertyDetail() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);

  const propertyId = Number(params.id);
  const checkInParam = searchParams.get("checkIn");
  const checkOutParam = searchParams.get("checkOut");
  const guestsParam = searchParams.get("guests");


  const [checkIn, setCheckIn] = useState<Date>(() => {
    if (checkInParam) {
      return normalizeLocalDate(fromDateString(checkInParam));
    }
    return normalizeLocalDate(new Date());
  });

  const [checkOut, setCheckOut] = useState<Date>(() => {
    if (checkOutParam) {
      return normalizeLocalDate(fromDateString(checkOutParam));
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return normalizeLocalDate(tomorrow);
  });

  const [guests, setGuests] = useState(
    guestsParam ? Number(guestsParam) : 1
  );

  useEffect(() => {
    if (checkInParam) {
      setCheckIn(normalizeLocalDate(fromDateString(checkInParam)));
    }
    if (checkOutParam) {
      setCheckOut(normalizeLocalDate(fromDateString(checkOutParam)));
    }
    if (guestsParam) {
      setGuests(Number(guestsParam));
    }
  }, [checkInParam, checkOutParam, guestsParam]);

  const {
    data: property,
    isLoading,
    isError,
    error,
  } = useGetPropertyWithAvailability(
    propertyId,
    checkIn,
    checkOut,
    guests,
    !!(propertyId && checkIn && checkOut)
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8 space-y-6">
          <Skeleton className="h-[400px] w-full rounded-2xl" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4 text-destructive">
            {error?.message || "Property Not Found"}
          </h1>
          <p className="text-muted-foreground mb-6">
            We couldn't load this property. It may not exist or be unavailable.
          </p>
          <Button onClick={() => router.push("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const images =
    property.propertyImages.length > 0
      ? property.propertyImages.map((img) => img.urlImages)
      : ["/placeholder-property.jpg"];

  const availableRooms = property.rooms.filter((room) => room.isAvailable);

  const lowestPrice =
    availableRooms.length > 0
      ? Math.min(...availableRooms.map((r) => r.displayPrice))
      : property.rooms[0]?.basePrice || 0;

  // Calculate booking details
  const nights = countNights(checkIn, checkOut);
  const subtotal = nights * lowestPrice;
  const serviceFee = Math.round(subtotal * 0.1);
  const total = subtotal + serviceFee;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Mobile Back Button */}
      <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-md border-b border-border md:hidden">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Share className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <main className="container pb-32 md:pb-12">
        <div className="mt-6 px-4 md:px-0">
          <PropertyDetailSearchBar
            propertyId={propertyId}
            maxGuests={Math.max(...property.rooms.map((r) => r.totalGuests))}
          />
        </div>
        <div className="relative mt-6">
          <div className="aspect-4/3 md:aspect-21/9 overflow-hidden md:rounded-2xl">
            <img
              src={images[selectedImage]}
              alt={property.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === selectedImage ? "bg-primary w-6" : "bg-card/70"
                }`}
              />
            ))}
          </div>
          <div className="hidden md:flex absolute top-4 right-4 gap-2">
            <Button variant="secondary" size="sm" className="gap-2">
              <Share className="h-4 w-4" />
              Share
            </Button>
            <Button variant="secondary" size="sm" className="gap-2">
              <Heart className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-6 px-4 md:px-0">
          {/* Left Content */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-secondary rounded-lg text-xs font-medium capitalize">
                  {property.propertyType.toLowerCase()}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {property.name}
              </h1>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{property.city.name}</span>
              </div>
            </div>

            {/* Available Rooms */}
            <div className="py-4 border-y border-border">
              <h3 className="font-semibold mb-3">
                Available Rooms ({availableRooms.length})
              </h3>
              <div className="space-y-2">
                {availableRooms.length > 0 ? (
                  availableRooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm">
                        {room.name} - up to {room.totalGuests} guests
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(room.displayPrice)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No rooms available for selected dates
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold mb-3">About this place</h2>
              <p className="text-muted-foreground leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            {property.amenities.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  What this place offers
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity.name] || Wifi;
                    return (
                      <div
                        key={amenity.id}
                        className="flex items-center gap-3 p-3 bg-secondary rounded-xl"
                      >
                        <Icon className="h-5 w-5 text-primary" />
                        <span className="text-sm">{amenity.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="hidden md:block">
            <div className="sticky top-24 bg-card rounded-2xl p-6 shadow-lg border border-border">
              <div className="flex items-baseline justify-between mb-6">
                <div>
                  <span className="text-2xl font-bold">
                    {formatCurrency(lowestPrice)}
                  </span>
                  <span className="text-muted-foreground"> / night</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="p-3 bg-secondary rounded-xl">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    Check-in
                  </div>
                  <div className="text-sm font-medium">
                    {format(checkIn, "MMM dd, yyyy")}
                  </div>
                </div>
                <div className="p-3 bg-secondary rounded-xl">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    Check-out
                  </div>
                  <div className="text-sm font-medium">
                    {format(checkOut, "MMM dd, yyyy")}
                  </div>
                </div>
                <div className="p-3 bg-secondary rounded-xl">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    Guests
                  </div>
                  <div className="text-sm font-medium">
                    {guests} guest{guests > 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              <Button
                variant="default"
                size="lg"
                className="w-full mb-4"
                disabled={availableRooms.length === 0}
                onClick={() => {
                  router.push(
                    `/booking/${property.id}?checkIn=${formatLocalDate(
                      checkIn
                    )}&checkOut=${formatLocalDate(checkOut)}&guests=${guests}`
                  );
                }}
              >
                Reserve Now
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                You won't be charged yet
              </p>

              <div className="mt-6 pt-4 border-t border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {formatCurrency(lowestPrice)} x {nights} night
                    {nights > 1 ? "s" : ""}
                  </span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service fee</span>
                  <span>{formatCurrency(serviceFee)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-border">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 inset-x-0 bg-card border-t border-border p-4 md:hidden z-50">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold">
                {formatCurrency(lowestPrice)}
              </span>
              <span className="text-sm text-muted-foreground">/ night</span>
            </div>
          </div>
          <Button
            variant="default"
            size="lg"
            disabled={availableRooms.length === 0}
            onClick={() => {
              router.push(
                `/booking/${property.id}?checkIn=${formatLocalDate(
                  checkIn
                )}&checkOut=${formatLocalDate(checkOut)}&guests=${guests}`
              );
            }}
          >
            Reserve Now
          </Button>
        </div>
      </div>
    </div>
  );
}