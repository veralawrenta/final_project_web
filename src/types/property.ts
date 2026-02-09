import { MasterAmenity } from "./amenity";
import { NewImageData } from "./images";

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

export interface Property {
  id: number;
  name: string;
  description: string;
  address: string;
  propertyType: PropertyType;
  propertyStatus: string;
  displayPrice?: number;
  propertyImages: Array<{ id: number; urlImages: string; isCover: boolean }>;
  city: { id: number; name: string };
  category: { id: number; name: string } | null;
  amenities: MasterAmenity[];
  availableRooms?: Array<{
    room: {
      id: number;
      name: string;
      totalGuests: number;
      basePrice: number;
    };
    price: number;
    useSeasonalRate: boolean;
  }>;
  rooms?: Array<{
    basePrice: number;
  }>;
}

export interface PropertyDetail extends Property {
  rooms: Array<{
    id: number;
    name: string;
    description: string;
    totalGuests: number;
    totalUnits: number;
    basePrice: number;
    isAvailable: boolean;
    displayPrice: number;
    useSeasonalRate: boolean;
    roomImages: Array<{
      id: number;
      roomId: number;
      urlImages: string;
      isCover: boolean;
    }>;
  }>;
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
  deletedAt?: string | null;
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

export interface PropertyCard {
  id: number;
  name: string;
  city: {
    id: number;
    name: string;
  };
  propertyType: PropertyType;
  propertyImages: {
    urlImages: string;
    isCover: boolean;
  }[];
  displayPrice?: number;
  rooms?: {
    basePrice: number;
  }[];
  availableRooms?: {
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
  propertyId: number;
  urlImages: string;
  isCover: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TenantProperty {
  id: number;
  name: string;
  city: string;
  category?: string;
  propertyType: 'HOTEL' | 'HOUSE' | 'APARTMENT' | 'VILLA';
  lowestPrice: number | null;
  totalRooms: number;
  status: 'PUBLISHED' | 'DRAFT';
  propertyImages: PropertyImage[]
}

//for property id dashboard
export interface PropertyIdImages {
  id: number;
  urlImages: string;
  isCover: boolean;
}

export interface PropertyRoom {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  totalGuests: number;
  totalUnits: number;
  imageFiles: File[];
  imagePreviews: NewImageData[];
}

//for dashboard property Id tenant
export interface TenantPropertyId {
  id: number;
  name: string;
  description: string;
  propertyType: PropertyType;
  address: string;
  city: string;
  cityId: number;
  category: string | null;
  categoryId: number | null;
  latitude?: number;
  longitude?: number;
  status: PropertyStatus;
  hasMaintenance: boolean;
  hasPropertyImages: boolean;
  hasSeasonalRate: boolean;
  hasPublishableRoom: boolean;
  amenities: string[];
  rooms: Array<{
    id: number;
    name: string;
    description: string;
    basePrice: number;
    totalUnits: number;
    totalGuests: number;
    roomImages: Array<{
      id: number;
      urlImages: string;
    }>;
    roomNonAvailability: Array<{
      id: number;
      reason: string;
      startDate: Date;
      endDate: Date;
    }>;
    seasonalRates:Array<{
      id: number;
      name: string;
      startDate: Date;
      endDate: Date;
      fixedPrice: number;
    }>;
  }>;
  images: Array<{
    id: number;
    urlImages: string;
    isCover: boolean;
  }>;
}

export type EditPropertyTypes ={
  name : string
}