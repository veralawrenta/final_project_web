import { PropertyCard } from "@/types/property";

export function getPropertyPrice(property: PropertyCard): number {
    // Search result (best case)
    if (property.displayPrice) return property.displayPrice;
  
    // Fallback: homepage → lowest room base price
    if (property.rooms && property.rooms.length > 0) {
      return Math.min(...property.rooms.map((r) => r.basePrice));
    }
  
    return 0;
  }
  