"use client";

import { formatCurrency } from "@/lib/price/currency";
import { getPropertyPrice } from "@/lib/price/property-price";
import { PropertyCard } from "@/types/property";
import { Heart, MapPin } from "lucide-react";
import Link from "next/link";

interface Props {
  property: PropertyCard;
}

const PropertyCardForm = ({ property }: Props) => {
  const coverImage =
    property.propertyImages.find((img) => img.isCover)?.urlImages ??
    property.propertyImages[0]?.urlImages ??
    "/placeholder.jpg";

  const price = getPropertyPrice(property);

  return (
    <Link
      href={`/property/${property.id}`}
      className="group block bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition"
    >
      <div className="relative aspect-4/3 overflow-hidden">
        <img
          src={coverImage}
          alt={property.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        <span className="absolute top-3 left-3 px-2.5 py-1 bg-card/90 rounded-lg text-xs font-medium capitalize">
          {property.propertyType}
        </span>

        <button
          onClick={(e) => e.preventDefault()}
          className="absolute top-3 right-3 p-2 bg-card/90 rounded-full"
        >
          <Heart className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary">
          {property.name}
        </h3>

        <div className="flex items-center gap-1 text-muted-foreground mt-1">
          <MapPin className="h-3.5 w-3.5" />
          <span className="text-sm">{property.city?.name}</span>
        </div>

        <div className="flex items-end justify-between pt-4 mt-4 border-t border-border">
          <div>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(price)}
            </span>
            <span className="text-xs text-muted-foreground"> / night</span>
          </div>

          {property.availableRooms && (
            <span className="text-xs text-emerald-600 font-medium">
              Available
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
export default PropertyCardForm;
