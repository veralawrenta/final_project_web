import { PropertyStatus, PropertyType } from "./property";

export interface Room {
  id: number;
  propertyId: number;
  property?: {
    name: string;
    propertyStatus?: PropertyStatus;
    propertyType?: PropertyType
    category: {
      id: number;
      name: string;
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
    };
    city: {
      id: number;
      name: string;
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
    };
  };
  name: string;
  totalGuests: number;
  totalUnits: number;
  basePrice: number;
  description: string;
  roomImages: RoomImage[];
  seasonalRates?: {
    id: number;
    name: string;
    fixedPrice: string;
    startDate: Date | string;
    endDate: Date | string;
  };
  roomNonAvailability?: RoomNonAvailability[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

//for roomcard property ID
export interface RoomPropertyCard {
  id: number;
  name: string;
  basePrice?: number;
  totalGuests: number;
  totalUnits: number;
  roomImages: {
    id: number;
    urlImages: string;
    isCover?: boolean;
  }[];
  roomNonAvailability: {
    id: number;
    startDate: Date | string;
    endDate: Date | string;
    reason?: string;
  }[];
  seasonalRates: {
    id: number;
    name: string;
    fixedPrice: number;
    startDate: Date | string;
    endDate: Date | string;
  }[];
}

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

export interface RoomIdPublic {
  id: number;
  name: string;
  basePrice: number;
  totalUnits?: number;
  totalGuests: number;
  displayPrice: number;
  description?: string;
  isAvailable: boolean;
  roomImages: {
    id?: number;
    urlImages: string;
    isCover: boolean;
  }[];
  seasonalRates?: {
    id: number;
    name: string;
    fixedPrice: number;
    startDate: Date | string;
    endDate: Date | string;
  }[];
  roomNonAvailability?: {
    id: number;
    startDate: Date | string;
    endDate: Date | string;
    reason?: string;
  }[];
}
