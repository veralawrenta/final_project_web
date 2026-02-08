export interface Room {
  id: number;
  propertyId?: number;
  property?: {
    name: string;
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
  seasonalRates?: SeasonalRates[];
  roomNonAvailability?: RoomNonAvailability[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

//for roomcard property ID
export interface RoomPropertyCard {
  id: number;
  name: string;
  basePrice: number;
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

export interface SeasonalRates {
  id: number;
  name?: string;
  propertyName?: string;
  startDate: string;
  endDate: string;
  fixedPrice: number;
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

export interface RoomManagementTypes {
  id: number;
  propertyId: number;
  propertyName: string;
  name: string;
  type: string;
  capacity: number;
  price: number;
  status: "Available" | "Occupied" | "Maintenance";
  description?: string;
  roomImages?: string[];
}
