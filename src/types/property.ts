import { MasterAmenity } from "./amenity";
import { RoomIdPublic, RoomImage } from "./room";

export enum PropertyType {
  APARTMENT = "APARTMENT",
  HOTEL = "HOTEL",
  VILLA = "VILLA",
  HOUSE = "HOUSE",
}

export enum PropertyStatus {
  PUBLISHED = "PUBLISHED",
  DRAFT = "DRAFT",
}

//for one property
export interface Property {
  id: number;
  name: string;
  description: string;
  address: string;
  propertyType: PropertyType;
  propertyStatus: PropertyStatus;
  latitude?: string;
  longitude?: string;
  displayPrice?: number;
  propertyImages: Array<{ id: number; urlImages: string; isCover: boolean }>;
  city: { id: number; name: string };
  category: { id: number; name: string } | null;
  amenities: MasterAmenity[];
  rooms?: Array<{
    id: number;
    name: string;
    basePrice: number;
    totalGuests: number;
    description: string;
    displayPrice?: number;
    roomImages: RoomImage[];
    transactions?: Array<{
      id: string;
      reviews?: {
        comments: string;
        ratings: number;
      };
    }>;
  }>;
}

export interface PropertyRoomDetail extends Omit<Property, "rooms"> {
  rooms: RoomIdPublic[];
  averageRating: number | null;
  searchContext: {
    checkIn: string;
    checkOut: string;
    totalGuests: number;
  };
  tenant: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CalendarDay {
  date: string;
  lowestPrice: number | null;
  availableRoomsCount: number;
  roomPrices: Array<{
    roomId: number;
    roomName: string;
    price: number;
    isSeasonalRate: boolean;
  }>;
}

export interface PropertyCard extends Property {
  availableRooms?: {
    id: number;
    name: string;
    description: string;
    totalGuests: number;
    totalUnits: number;
    basePrice: number;
    price: number;
    useSeasonalRate: boolean;
  }[];
  rating?: number;
  reviewsCount?: number;
}

export interface CalendarResponse {
  propertyId: number;
  propertyName: string;
  calendar: CalendarDay[];
}

export interface PropertyImage {
  id: number;
  propertyId?: number;
  urlImages: string;
  isCover: boolean;
  createdAt?: string;
}
[];

//for dashboard property Id tenant
export interface TenantProperty extends Omit<
  Property,
  "amenities" | "rooms" | "latitude" | "longitude"
> {
  latitude?: number;
  longitude?: number;
  status: PropertyStatus;
  amenities: string[];
  rooms: Array<{
    id: number;
    name: string;
    description: string;
    basePrice: number;
    totalUnits: number;
    totalGuests: number;
    roomImages: RoomImage[];
    roomNonAvailability: Array<{
      id: number;
      reason: string;
      startDate: Date;
      endDate: Date;
    }>;
    seasonalRates: Array<{
      id: number;
      name: string;
      startDate: Date;
      endDate: Date;
      fixedPrice: number;
    }>;
  }>;
}
export interface TenantProperties extends TenantProperty {
  hasMaintenance: boolean;
  hasPropertyImages: boolean;
  hasSeasonalRate: boolean;
  hasPublishableRoom: boolean;
  lowestPrice: number | null;
  totalRooms: number;
}

export type EditPropertyTypes = {
  name: string;
};
