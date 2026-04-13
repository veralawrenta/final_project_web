export enum TransactionStatus {
    ALL = "ALL",
    WAITING_FOR_CONFIRMATION = "WAITING_FOR_CONFIRMATION",
    WAITING_FOR_PAYMENT = "WAITING_FOR_PAYMENT",
    CANCELLED_BY_USER = "CANCELLED_BY_USER",
    CANCELLED_BY_TENANT = "CANCELLED_BY_TENANT",
    CONFIRMED = "CONFIRMED",
    EXPIRED = "EXPIRED",
    COMPLETED = "COMPLETED"
}

export enum TransactionPaymentMethod {
  BANK_TRANSFER = "BANK_TRANSFER",
  CREDIT_CARD = "CREDIT_CARD",
  SHOPEEPAY = "SHOPEEPAY",
}

export interface Transactions {
  transactionId: string;
  room: {
    roomName: string;
    roomId: number;
    property : {
      propertyName: string;
      address: string;
      propertyImages: {
        urlImages: string[];
      }
    };
  }
  firstName: string;
  lastName: string;
  email: string;
  checkIn: string;
  checkOut: string;
  status: TransactionStatus;
  totalPrice: number;
  totalGuests: number;
  paymentDate: string;
  paymentMethod: TransactionPaymentMethod;
  paymentProof?: string;
  createdAt: string;
}
