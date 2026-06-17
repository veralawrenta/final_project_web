import { NewImageData } from "./images";
import { PropertyStatus, PropertyType } from "./property";

export interface RoomImage {
  id: number;
  urlImages: string;
  isCover: boolean;
}
export interface RoomNonAvailability {
  id: number;
  startDate: string;
  endDate: string;
  reason: string;
  roomInventory: number;
  room?: {
    id: number;
    name: string;
    totalUnits: number;
    property?: {
      id: number;
      name: string;
    };
  };
}
export interface Room {
  id: number;
  name: string;
  totalGuests: number;
  totalUnits: number;
  basePrice: number;
  description: string;
  property?: {
    id: number;
    name: string;
    propertyStatus?: PropertyStatus;
    propertyType?: PropertyType;
    category: {
      id: number;
      name: string;
    };
    city: {
      id: number;
      name: string;
    };
  };
  roomImages: Array<{ id: number; urlImages: string; isCover?: boolean }>;
  seasonalRates?: Array<{
    id: number;
    name: string;
    startDate: Date;
    endDate: Date;
    fixedPrice: number;
  }>;
  roomNonAvailability?: Array<{
    id: number;
    reason: string;
    startDate: Date;
    endDate: Date;
  }>;
  createdAt?: string;
  updatedAt?: string;
}
export interface RoomIdPublic {
  id: number;
  name: string;
  totalGuests: number;
  description: string;
  basePrice: number;
  roomImages: RoomImage[];
  displayPrice: number;
  isAvailable: boolean;
  price?: number;
  useSeasonalRate: boolean;
  transactions?: {
    reviews?: {
      ratings: number;
      comments: string;
    };
  };
}

export interface PropertyRoom extends Room {
  imageFiles: File[];
  imagePreviews: NewImageData[];
}
