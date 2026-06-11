import { TransactionStatus } from "@/types/transaction";
import z from "zod";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "./dashboard.images.schema";

export const createReviewSchema = z
  .object({
    transactionId: z.string().min(1, "Transaction id is required"),
    checkOut: z.date(),
    status: z.enum(TransactionStatus),
    ratings: z.number().min(1, "Rating is required"),
    comments: z.string().min(1, "Comment is required"),
    images: z
      .instanceof(File)
      .refine((file) => file.size <= MAX_FILE_SIZE, "Max image size is 1 MB")
      .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
        "Only JPG, PNG, JPEG, GIF are allowed",
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status !== TransactionStatus.CONFIRMED) {
      ctx.addIssue({
        path: ["status"],
        code: "custom",
        message: "Transaction must be confirmed before reviewing",
      });
      return;
    }
    if (!data.checkOut) return;
    const today = new Date();
    if (data.checkOut >= today) {
      ctx.addIssue({
        path: ["checkOut"],
        message: "Review can only be submitted after checkout date has passed",
        code: "custom",
      });
    }
  });

export const createReplyReviewSchema = z.object({
  reviewId: z.number().min(1, "Please select the review"),
  reply: z.string().min(1, "Reply is required"),
});

export type CreateReviewPayload = Pick<
z.infer<typeof createReviewSchema>, "transactionId" | "ratings" | "comments" | "images">