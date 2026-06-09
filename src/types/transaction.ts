export enum TransactionStatus {
  ALL = "ALL",
  WAITING_FOR_CONFIRMATION = "WAITING_FOR_CONFIRMATION",
  WAITING_FOR_PAYMENT = "WAITING_FOR_PAYMENT",
  CANCELLED_BY_USER = "CANCELLED_BY_USER",
  CANCELLED_BY_TENANT = "CANCELLED_BY_TENANT",
  CONFIRMED = "CONFIRMED",
  EXPIRED = "EXPIRED",
  COMPLETED = "COMPLETED",
}

export type TransactionStatusFilter =
  | "all"
  | "upcoming"
  | "ongoing"
  | "completed";

export interface TransactionSummary {
  all: number;
  upcoming: number;
  ongoing: number;
  completed: number;
  cancelled: number;
  pending: number;
}

export const Transaction_Steps = [
  "details",
  "payment",
  "upload_proof",
  "processing_payment",
  "confirmation",
] as const;

export type TransactionSteps = (typeof Transaction_Steps)[number];

export type TransactionPaymentMethod =
  | "BANK_TRANSFER"
  | "CREDIT_CARD"
  | "SHOPEEPAY";

export interface Transactions {
  transactionId: string;
  room: {
    roomName: string;
    roomId: number;
    property: {
      propertyName: string;
      address: string;
      city: string;
      propertyImages: {
        urlImages: string;
      };
    };
  };
  user: {
    userId?: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  review?: {
    rating?: number;
    comment?: string;
    reply?: string;
  };
  checkIn: string;
  checkOut: string;
  status: TransactionStatus;
  totalPrice: number;
  totalGuests: number;
  paymentDate: string;
  paymentMethod?: TransactionPaymentMethod;
  paymentProof?: string;
  createdAt?: string;
}

export interface CreateTransactionPayload {
  roomId: number;
  checkIn: string;
  checkOut: string;
  totalGuests: number;
  bookedUnits: number;
  paymentMethod: TransactionPaymentMethod;
  specialRequest?: string;
}

export interface CardFormPayload {
  cardNumber: string;
  cardHolderFirstName: string;
  cardHolderLastName: string;
  expiredMonth: string;
  expiredYear: string;
  cvv: string;
  cardholderEmail?: string;
  cardholderPhoneNumber?: string;
}

export const BANK = {
  name: "Bank Central Asia (BCA)",
  number: "1234567890",
  holder: "PT Staynuit Indonesia",
};

export type MonthlyRevenue = {
  month: number;
  revenue: number;
};

export type RecentTransaction = {
  totalPrice: number;
  status: TransactionStatus;
  room: {
    name: string;
    property: {
      name: string;
    };
  };
  user: {
    firstName: string;
    lastName: string;
    avatar: string;
  };
};

export type RecentMaintenance = {
  startDate: string;
  endDate: string;
  reason: string;
  room: {
    name: string;
    property: {
      name: string;
    };
  };
};

export type RecentReviews = {
  ratings: number;
  comment: string;
  transaction: {
    user: {
      firstName: string;
      lastName: string;
      avatar: string;
    };
    room: {
      name: string;
      property: {
        name: string;
      };
    };
  };
};

export type TenantActivityResponse = {
  recentTransactions: RecentTransaction[];
  recentMaintenances: RecentMaintenance[];
  recentReviews: RecentReviews[];
}

export type CalendarTransaction= {
  id: string;
  checkIn: string;
  checkOut: string;
  status: string;
  room: {
    name: string;
    property: {
      name: string;
    };
  };
  user: {
    firstName: string | null;
    lastName: string | null;
  };
}
