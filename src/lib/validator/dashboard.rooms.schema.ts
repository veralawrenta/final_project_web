import z from "zod";
import { imageFileSchema } from "./dashboard.property.schema";

export const createRoomSchema = z.object({
    propertyId: z.number().min(1, "Please select a property"),
    name: z.string().min(1, "Room name is required"),
    description: z.string().min(1, "Room description is required"),
    basePrice: z.number().min(0, "Base price must be at least 0"),
    totalGuests: z.number().min(1, "Total guests must be at least 1"),
    totalUnits : z.number().min(1, "Total units must be at least 1"),
  });

  export const updateRoomSchema = z.object({
    propertyId: z.number().min(1, "Please select a property"),
    name: z.string().optional(),
    description: z.string().optional(),
    basePrice: z.number().optional(),
    totalGuests: z.number().optional(),
    totalUnits : z.number().optional(),
  });

  export const uploadRoomImagesSchema = z.object({
    roomImages: z.array(imageFileSchema).min(1).max(3),
    isCover : z.boolean().optional(),
  });