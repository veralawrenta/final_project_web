export enum PropertyType {
  APARTMENT = "APARTMENT",
  HOTEL = "HOTEL",
  VILLA = "VILLA",
  HOUSE = "HOUSE",
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
  amenities: Array<{ id: number; name: string }>;
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

export interface PropertyPayload {
  name: string;
  description: string;
  categoryId: number;
  cityId: number;
  address: string;
  latitude: number;
  longitude: number;
  propertyType: "APARTMENT" | "HOUSE" | "VILLA" | "HOTEL";
  propertyImages: File[];
  amenities: string[];
  rooms: Array<{
    name: string;
    description: string;
    basePrice: number;
    totalGuests: number;
    totalUnits: number;
    roomImages: File[];
  }>;
}

export interface PropertyRoomImage {
  file: File;
  preview: string;
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
  imagePreviews: PropertyRoomImage[];
}