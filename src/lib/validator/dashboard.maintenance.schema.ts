import z from "zod";
import { normalizeLocalDate } from "../date";

export const createMaintenanceBlockSchema = z
  .object({
    roomId: z.string().min(1, "Please select a room"),
    startDate: z.date(),
    endDate: z.date(),
    reason: z.string().optional(),
    roomInventory: z
      .number()
      .min(1, "Must be at least 1"),
  })
  .superRefine((data, ctx) => {
    const start = normalizeLocalDate(data.startDate);
    const end = normalizeLocalDate(data.endDate);

    if (start >= end) {
      ctx.addIssue({
        path: ["endDate"],
        message: "End date must be after start date",
        code: "custom",
      });
    }
  });

export const updateMaintenanceBlockSchema = z
  .object({
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    reason: z.string().optional(),
    roomInventory: z.number().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.startDate || !data.endDate) return;

    const today = normalizeLocalDate(new Date());
    const start = normalizeLocalDate(data.startDate);
    const end = normalizeLocalDate(data.endDate);

    if (start < today) {
      ctx.addIssue({
        path: ["startDate"],
        message: "Start date cannot be in the past",
        code: "custom",
      });
    }

    if (start >= end) {
      ctx.addIssue({
        path: ["endDate"],
        message: "End date must be after start date",
        code: "custom",
      });
    }
  });

export type CreateMaintenanceBlockValues = z.infer<typeof createMaintenanceBlockSchema>;
export type UpdateMaintenanceBlockValues = z.infer<typeof updateMaintenanceBlockSchema>;