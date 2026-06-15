import { Calendar, CheckCircle, Clock, ClockAlert, XCircle } from "lucide-react";
import { PageableResponse } from "./pagination";
import { PaymentMethodEnum } from "@/lib/validator/profile.transaction.schema";

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
  | "completed"
  | "cancelled"
  | "pending";

export interface TransactionSummary {
  totalTransactions: number;
  totalIncome?: number;
  upcoming: number;
  pending: number;
  activeGuests: number;
  completed: number;
  cancelled: number;
};

export const Transaction_Steps = [
  "details",
  "payment",
  "upload_proof",
  "processing_payment",
  "confirmation",
] as const;

export type TransactionSteps = (typeof Transaction_Steps)[number];

export type TransactionPaymentMethod = PaymentMethodEnum;

export interface Transactions {
  transactionId: string;
  room: {
    roomName: string;
    roomId: number;
    property: {
      propertyId: number;
      propertyName: string;
      address: string;
      city: string;
      propertyImages: {
        urlImages: string;
      };
    };
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
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

export type DisplayStatus = "PENDING" | "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
export interface TransactionManagementPayload extends Transactions {
    displayStatus: DisplayStatus;
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

export const transactionStatusConfig: Record<
  DisplayStatus,
  { label: string; color: string; bgColor: string; icon: typeof Clock }
> = {
  PENDING: {
    label: "Pending",
    color: "text-amber-800",
    bgColor: "bg-amber-100",
    icon: ClockAlert,
  },
  UPCOMING: {
    label: "Upcoming",
    color: "text-blue-800",
    bgColor: "bg-blue-100",
    icon: Calendar,
  },
  ONGOING: {
    label: "Ongoing",
    color: "text-emerald-800",
    bgColor: "bg-emerald-100",
    icon: Clock,
  },
  COMPLETED: {
    label: "Completed",
    color: "text-zinc-800",
    bgColor: "bg-zinc-100",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-900",
    bgColor: "text-red-100",
    icon: XCircle,
  },
};

export interface TenantTransactionResponse extends PageableResponse<TransactionManagementPayload> {
  summary: TransactionSummary;
}

export interface UserTransactionResponse extends PageableResponse<Transactions> {
  summary?: TransactionSummary;
}

export const filterToDisplayStatus: Record<Exclude<TransactionStatusFilter, "all">,
  DisplayStatus
> = {
  pending:   "PENDING",
  upcoming:  "UPCOMING",
  ongoing:   "ONGOING",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
};

