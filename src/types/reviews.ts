import { PageableResponse } from "./pagination";

export interface Reviews {
  id: number;
  user: {
    firstName: string;
    lastName: string;
    avatar: string;
  };
  ratings: number;
  comments: string;
  images?: string;
  reply?: string;
  createdAt: string;
  transaction: {
    id: string;
    checkIn: string;
    checkOut: string;
    room?: {
      name: string;
      property?: {
        name?: string;
        address?: string;
        city?: {
          name: string;
        };
        tenant: {
          tenantName: string;
        }
        propertyImages?: {
          imageUrl: string;
        }[];
      };
    };
  };
}

export interface ReviewSummary {
  pending: number;
  reviewed: number;
  averageRating?: number;
  totalCount?: number
}

export interface ReviewResponse extends PageableResponse<Reviews> {
  summary : ReviewSummary;
}



