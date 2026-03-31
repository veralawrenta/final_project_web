import z from "zod";

export const TransactionPaymentMethodEnum = z.enum([
  "BANK_TRANSFER",
  "CREDIT_CARD",
  "SHOPEEPAY"
])

export const createTransactionSchema = z
  .object({
    roomId: z.number().min(1, "Please select a room"),
    checkIn: z.date().min(1, "Please select your check in date"),
    checkOut: z.date().min(1, "Please select your check out date"),
    bookedUnits: z.number().min(1, "At least one unit must be booked"),
    paymentMethod: TransactionPaymentMethodEnum,
  })
  .superRefine((data, ctx) => {
    const checkInDate = data.checkIn;
    const checkOutDate = data.checkOut;
    const today = new Date();

    if (checkOutDate > checkInDate) {
      ctx.addIssue({
        path: ["checkOut"],
        message: "Check out date must be after check in date",
        code: "custom",
      });
    }

    if (checkInDate >= today) {
      ctx.addIssue({
        path: ["checkIn"],
        message: "Check in date must be after today",
        code: "custom",
      });
    }
  });
