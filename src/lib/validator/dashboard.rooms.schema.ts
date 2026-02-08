import z from "zod";
import { imageFileSchema } from "./dashboard.images.schema";

export const roomsWithImageSchema = z.object({
    name: z.string().min(1, "Room name is required"),
    description: z.string().min(1, "Room description is required"),
    basePrice: z.number().min(1, "Base price must be greater than 0"),
    totalGuests: z.number().min(1, "Total guests must be at least 1"),
    totalUnits : z.number().min(1, "Total units must be at least 1"),
    roomImages: z.array(imageFileSchema).min(1, "At least one room image is required").max(10, "Only can be uploaded maximum of 10 images")
  });
  //before createpropertyroomsschema

  export const roomBaseSchema = z.object({
    propertyId: z.number().min(1, "Please select a property"),
    name: z.string().min(1, "Room name is required"),
    description: z.string().min(1, "Room description is required"),
    basePrice: z.number().min(1, "Base price must be greater than 0"),
    totalGuests: z.number().min(1, "Total guests must be at least 1"),
    totalUnits : z.number().min(1, "Total units must be at least 1"),
    roomImages: z.array(imageFileSchema).min(1, "At least one room image is required").max(10, "Only can be uploaded maximum of 10 images")
  });
  //before was createroomschema

  export const updateRoomSchema = z.object({
    propertyId: z.number().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    basePrice: z.number().optional(),
    totalGuests: z.number().optional(),
    totalUnits : z.number().optional(),
  });

  export type CreateRoomFormData = z.infer<typeof roomsWithImageSchema>;
  export type UpdateRoomFormData = z.infer<typeof updateRoomSchema>;