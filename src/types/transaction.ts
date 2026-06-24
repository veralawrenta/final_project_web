import {
  Calendar,
  CheckCircle,
  Clock,
  ClockAlert,
  XCircle,
} from "lucide-react";
import { PageableResponse } from "./pagination";
import { PaymentMethodEnum } from "@/lib/validator/profile.transaction.schema";

export interface Transactions {
  id: string;
  checkIn: string;
  checkOut: string;
  status: TransactionStatus;
  totalPrice: number;
  totalGuests: number;
  paymentDate: string;
  paymentMethod?: TransactionPaymentMethod;
  paymentProof?: string;
  createdAt?: string;
  room: {
    name: string;
    id: number;
    property: {
      id: number;
      name: string;
      address: string;
      latitude: string;
      longitude: string
      city: {
        name: string;
      };
      propertyImages: {
        urlImages: string;
      }[];
      tenant: {
        id: number,
        tenantName: string;
      }
    };
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
  };
  review?: {
    ratings?: number;
    comments?: string;
    images?: string;
    reply?: string;
  };
}

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
  | "ALL"
  | "PENDING"
  | "UPCOMING"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED";

export interface TransactionSummary {
  totalTransactions: number;
  totalIncome?: number;
  upcoming: number;
  pending: number;
  activeGuests: number;
  completed: number;
  cancelled: number;
}

export const Transaction_Steps = [
  "details",
  "payment",
  "upload_proof",
  "processing_payment",
  "confirmation",
] as const;

export type TransactionSteps = (typeof Transaction_Steps)[number];

export type TransactionPaymentMethod = PaymentMethodEnum;

export interface TransactionManagementPayload extends Transactions {
  displayStatus: Partial<TransactionStatusFilter>;
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

export type CalendarTransaction = {
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
};

export const transactionStatusConfig: Partial<
  Record<
    TransactionStatusFilter,
    { label: string; className: string; icon: typeof Clock }
  >
> = {
  PENDING: {
    label: "Pending",
    className: "text-amber-800 bg-amber-100",
    icon: ClockAlert,
  },
  UPCOMING: {
    label: "Upcoming",
    className: "text-blue-800 bg-blue-100",
    icon: Calendar,
  },
  ONGOING: {
    label: "Ongoing",
    className: "text-emerald-800 bg-emerald-100",
    icon: Clock,
  },
  COMPLETED: {
    label: "Completed",
    className: "text-zinc-800 bg-zinc-100",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    className: "text-red-900 bg-red-100",
    icon: XCircle,
  },
};

export const statusToDisplayStatus: Record<TransactionStatus, TransactionStatusFilter> = {
  [TransactionStatus.WAITING_FOR_PAYMENT]:      "PENDING",
  [TransactionStatus.WAITING_FOR_CONFIRMATION]: "PENDING",
  [TransactionStatus.CONFIRMED]:                "ONGOING",
  [TransactionStatus.COMPLETED]:                "COMPLETED",
  [TransactionStatus.CANCELLED_BY_USER]:        "CANCELLED",
  [TransactionStatus.CANCELLED_BY_TENANT]:      "CANCELLED",
  [TransactionStatus.EXPIRED]:                  "CANCELLED",
  [TransactionStatus.ALL]:                      "ALL",
};

export interface TenantTransactionResponse extends PageableResponse<TransactionManagementPayload> {
  summary: TransactionSummary;
}

export interface UserTransactionResponse extends PageableResponse<Transactions> {
  summary?: TransactionSummary;
}
