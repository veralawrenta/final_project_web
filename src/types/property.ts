
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
    city: string;
    category: string
    propertyType: PropertyType;
    latitude: number;
    longitude: number;
    tenantId: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
};

export interface PropertyImages {
    id: number;
    propertyId: number;
    imageUrl: string;
    isCover: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
};

export interface Amenity {
    id: number;
    name: string;
    propertyId: number;
    iconUrl?: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

