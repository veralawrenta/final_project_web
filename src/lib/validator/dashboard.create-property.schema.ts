import z from "zod";
import { imageFileSchema } from "./dashboard.images.schema";
import { roomsWithImageSchema } from "./dashboard.rooms.schema";

export const PropertyTypeEnum = z.enum([
  "APARTMENT",
  "HOUSE",
  "VILLA",
  "HOTEL",
]);

export const createPropertyOneSchema = z.object({
  name: z.string().min(1, "Property name is required").max(150),
  description: z.string().min(1, "Description is required"),
  address: z.string().min(1, "Address is required").max(255),
  cityId: z.number().min(1, "Please select a city"),
  categoryId: z.number().min(1).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  propertyType: PropertyTypeEnum,
  amenities: z.array(z.string()).min(1, "Select at least one amenity"),
  propertyImages: z
    .array(imageFileSchema)
    .min(1, "At least one property image required")
    .max(10, "Only accepted maximum of 10 images"),
});

export const createPropertyTwoSchema = z.object({
  rooms: z
    .array(roomsWithImageSchema)
    .min(1, "At least one room with room image is required"),
});

export type StepOneFormData = z.infer<typeof createPropertyOneSchema>;
export type StepTwoFormData = z.infer<typeof createPropertyTwoSchema>;
