import z from "zod";
import { createPropertyRoomSchema, createRoomSchema } from "./dashboard.rooms.schema";

const MAX_FILE_SIZE = 1 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpeg",
  "image/gif",
];
export const PropertyTypeEnum = z.enum(["APARTMENT", "HOUSE", "VILLA", "HOTEL"]);
export const imageFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, "Max image size is 1 MB")
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    "Only JPG, PNG, JPEG, GIF are allowed"
  );

export const createPropertyOneSchema = z.object({
  name: z.string().min(1, "Property name is required").max(150),
  description: z.string().min(1, "Description is required"),
  address: z.string().min(1, "Address is required").max(255),
  cityId: z.number().min(1, "Please select a city"),
  categoryId: z.number().min(1, "Please select a category"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  propertyType: PropertyTypeEnum,
  amenities: z.array(z.string()).min(1, "Select at least one amenity"),
  urlImages: z
    .array(imageFileSchema)
    .min(1, "At least one property image required")
    .max(10, "Maximum 10 images allowed"),
});

export const createPropertyRoom = z.object({
  rooms: z.array(createRoomSchema).min(1, "At least one room is required"),
});

export const createPropertyTwoSchema = z.object({
  rooms: z
    .array(createPropertyRoomSchema)
    .min(1, "At least one room with room image is required"),
});

export type StepOneFormData = z.infer<typeof createPropertyOneSchema>;
export type RoomFormData = z.infer<typeof createPropertyRoomSchema>;
export type StepTwoFormData = z.infer<typeof createPropertyTwoSchema>;
