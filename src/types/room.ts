export interface Room {
    id: number;
    propertyId: number;
    name: string;
    totalGuests: number;
    totalUnits: number;
    basePrice: number;
    description?: string;
    roomImages : RoomImage[];
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
};

export interface RoomImage {
    id: number;
    roomId: number;
    urlImages: string;
    isCover: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
};

export interface SeasonalRate {
    id: number;
    roomId: number;
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
    reason?: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
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
  }