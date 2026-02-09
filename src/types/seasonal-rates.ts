export interface SeasonalRates {
  id: number;
  name?: string;
  startDate: string;
  endDate: string;
  fixedPrice: number;
  propertyId?: number | null;
  property?: {
    id: number;
    name: string;
    category?: {
      id: number;
      name: string;
    };
    city?: {
      id: number;
      name: string;
    };
  } | null;
  roomId: number | null;
  room?: {
    id: number;
    name: string;
    property: {
      id: number;
      name: string;
      category: {
        id: number;
        name: string;
      };
      city: {
        id: number;
        name: string;
      };
    };
  } | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}
