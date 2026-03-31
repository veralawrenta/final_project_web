import z from "zod";
import { normalizeLocalDate } from "../date/date";

export const createSeasonalRatesSchema = z
  .object({
    propertyId: z.number().min(1, "Please select a property"),
    name: z.string().min(1, "Seasonal rate name is required"),
    startDate: z.date(),
    endDate: z.date(),
    fixedPrice: z.number().min(1, "Fixed price must be at least Rp 1"),
  })
  .superRefine((data, ctx) => {
    const start = normalizeLocalDate(data.startDate); //check this one out first monic
    const end = normalizeLocalDate(data.endDate);

    if (start > end) {
      ctx.addIssue({
        path: ["endDate"],
        message: "End date must be after start date",
        code: "custom",
      });
    };
    const hasPropertyId = data.propertyId != null && data.propertyId > 0;

    if (!hasPropertyId) {
      ctx.addIssue({
        path: ["propertyId"],
        message: "Please select a property ",
        code: "custom",
      });
    }
  });

  export const updateSeasonalRatesSchema = z
  .object({
    name: z.string().optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    fixedPrice: z.number().optional(),
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

    if (start > end) {
      ctx.addIssue({
        path: ["endDate"],
        message: "End date must be after start date",
        code: "custom",
      });
    }
  });

