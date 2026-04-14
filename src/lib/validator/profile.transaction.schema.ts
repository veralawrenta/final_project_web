import z from "zod";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "./dashboard.images.schema";

export enum PaymentMethodEnum {
  BANK_TRANSFER = "BANK_TRANSFER",
  CREDIT_CARD = "CREDIT_CARD",
  SHOPEEPAY = "SHOPEEPAY",
}

export const createTransactionSchema = z.object({
    roomId : z.number().min(1, "Room ID is required"),
    checkIn: z.string().min(1, "Check-in date is required"),
    checkOut: z.string().min(1, "Check-out date is required"),
    totalGuests: z.number().min(1, "Total guests must be at least 1"),
    bookedUnits: z.number().min(1, "Booked units must be at least 1"),
    paymentMethod: z.enum(Object.values(PaymentMethodEnum), "Invalid payment method")
})
 .superRefine((data, ctx) => {
    const start = data.checkIn;
    const end = data.checkOut;

    if (start >= end) {
      ctx.addIssue({
        path: ["checkOut"],
        message: "Check-out must be after check-in",
        code: "custom",
      });
    }
  });

  export const uploadPaymentProofSchema = z.object({
    transactionId: z.string().min(1, "Transaction ID is required"),
    paymentProof: z.instanceof(File)
      .refine(file => file.size <= MAX_FILE_SIZE, "Max image size is 1 MB")
      .refine(file => ACCEPTED_IMAGE_TYPES.includes(file.type), "Only JPG, PNG, JPEG, GIF are allowed")
  });