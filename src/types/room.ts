export interface Room {
    id: number;
    propertyId?: number;
    name: string;
    totalGuests: number;
    totalUnits: number;
    basePrice: number;
    description: string;
    roomImages : RoomImage[];
    seasonalRates?: SeasonalRates[];
    roomNonAvailability? : RoomNonAvailability[];
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
};

export interface RoomPropertyCard {
    id: number;
    name: string;
    basePrice: number;
    totalGuests: number;
    totalUnits: number;
    roomImages: RoomImage[];
    roomNonAvailability: RoomNonAvailability[];
    seasonalRates : SeasonalRates[];
}

export interface RoomImage {
    id: number;
    roomId: number;
    urlImages: string;
    isCover: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
};

export interface SeasonalRates {
    id: number;
    roomId: number;
    name?: string;
    propertyName?: string;
    startDate: string;
    endDate: string;
    fixedPrice: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
};

export interface RoomNonAvailability{
    id: number;
    roomId: number;
    startDate: string;
    endDate: string;
    reason: string;
    roomInventory: number;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    room? : {
        id: number;
        name: string;
        totalUnits: number;
        property?: {
            id: number;
            name: string;
        };
    };
};

export interface RoomManagementTypes {
    id: number;
    propertyId: number;
    propertyName: string;
    name: string;
    type: string;
    capacity: number;
    price: number;
    status: 'Available' | 'Occupied' | 'Maintenance';
    description?: string;
    roomImages?: string[];
  };