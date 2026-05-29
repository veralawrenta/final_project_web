export interface Reviews {
  id: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    avatar: string;
  };
  ratings: number;
  comments: string;
  images?: string;
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
        propertyImages?: {
          imageUrl : string;
        } [];
      }
    }
  }
}
