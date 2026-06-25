import z from "zod";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "./dashboard.images.schema";

export enum PaymentMethodEnum {
  BANK_TRANSFER = "BANK_TRANSFER",
  CREDIT_CARD = "CREDIT_CARD",
  SHOPEEPAY = "SHOPEEPAY",
}

export const createTransactionSchema = z
  .object({
    roomId: z.number().min(1, "Room ID is required"),
    checkIn: z.string().min(1, "Check-in date is required"),
    checkOut: z.string().min(1, "Check-out date is required"),
    bookedUnits: z.number().min(1, "Booked units must be at least 1"),
    totalGuests: z.number().min(1, "Total guest must at least 1"),
    paymentMethod: z.enum(PaymentMethodEnum),
  })
  .superRefine((data, ctx) => {
    const checkInDate = new Date(data.checkIn);
    const checkOutDate = new Date(data.checkOut);
    const today = new Date();

    if (checkOutDate <= checkInDate) {
      ctx.addIssue({
        path: ["checkOut"],
        message: "Check out date must be after check in date",
        code: "custom",
      });
    }

    if (checkInDate <= today) {
      ctx.addIssue({
        path: ["checkIn"],
        message: "Check in date must be after today",
        code: "custom",
      });
    }
  });

export const uploadPaymentProofSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
  paymentProof: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, "Max image size is 1 MB")
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only JPG, PNG, JPEG, GIF are allowed",
    ),
});

export const cardDetailsSchema = z.object({
  cardNumber: z
    .string()
    .min(16, "Card number must be at least 16 digits")
    .max(19, "Card number must be at most 19 digits"),
  cardHolderFirstName: z.string().min(1, "Card holder first name is required"),
  cardHolderLastName: z.string().min(1, "Card holder last name is required"),
  expiredMonth: z
    .string()
    .regex(/^(0[1-9]|1[0-2])$/, "Expired month must be between 01 and 12"),
  expiredYear: z
    .string()
    .regex(/^\d{2}$/, "Expired year must be a 2-digit number")
    .refine(
      (year) => Number(`20${year}`) >= new Date().getFullYear(),
      "Expired year must be this year or later",
    ),
  cvv: z
    .string()
    .min(1, "CVV is required")
    .regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
  cardholderEmail: z.string().email("Invalid email address").optional(),
  cardholderPhone: z.string().optional(),
});

export type CreateTransactionValues = z.infer<typeof createTransactionSchema>;
export type CardDetailsFormValues = z.infer<typeof cardDetailsSchema>;
export type CreateTransactionFormValues = CreateTransactionValues &
  Partial<CardDetailsFormValues> & { tokenId?: string };
