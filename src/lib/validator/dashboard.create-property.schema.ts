import { PropertyType } from "@/types/property";
import z from "zod";

const MAX_FILE_SIZE = 1 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpeg", "image/gif"];

export const imageFileSchema = z.instanceof(File).refine((file)=> file.size <= MAX_FILE_SIZE, "Max image size is 1 MB").refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), "Only JPG, PNG, JPEG, GIF are allowed");

export const createPropertySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  address: z.string().min(1, "Address is required"),
  cityId: z.number(),
  categoryId: z.number(),
  latitude: z.number(),
  longitude: z.number(),
  propertyType: z.enum(PropertyType),
  amenities: z.array(z.string()).min(1, "Select at least one amenity"),
  propertyImages: z.array(imageFileSchema).min(1).max(5),
});
