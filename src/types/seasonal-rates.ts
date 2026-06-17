import { PropertyImage } from "./property";
export interface SeasonalRates {
  id: number;
  name?: string;
  startDate: string;
  endDate: string;
  fixedPrice: number;
  property: {
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
    propertyImages : PropertyImage[];
    room: {
      id: number;
      name: number;
      basePrice: number;
    }
  }
  createdAt?: string;
  updatedAt?: string;
}
