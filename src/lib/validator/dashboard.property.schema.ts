import { PropertyType } from "@/types/property";
import z from "zod";
import { AMENITIES, AmenityId } from "../constant/amenities.constant";
import { create } from "domain";

const amenityIds = AMENITIES.map(a => a.id) as [AmenityId, ...AmenityId[]];
const MAX_FILE_SIZE = 1 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpeg", "image/gif"];

export const imageFileSchema = z.instanceof(File).refine((file)=> file.size <= MAX_FILE_SIZE, "Max image size is 1 MB").refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), "Only JPG, PNG, JPEG, GIF are allowed");

export const roomSchema = z.object({
    name: z.string().min(1, "Room name is required"),
    description: z.string().min(1, "Room description is required"),
    basePrice: z.number().min(1, "Base price must be greater than zero"),
    totalGuests: z.number().min(1, "Total guests must be at least one"),
    totalUnits: z.number().min(1, "Total units must be at least one"),
    roomImages: z.array(imageFileSchema).min(1, "At least one room image is required"),
  });

export const createPropertySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  address: z.string().min(1, "Address is required"),
  cityId: z.number().min(1, "Please select a city"),
  categoryId: z.number().min(1, "Please select a category"),
  latitude: z.number(),
  longitude: z.number(),
  propertyType: z.enum(PropertyType, {error: "Please select a property type"}),
  amenities: z.array(z.enum(amenityIds)).min(1, "Select at least one amenity"),
  propertyImages: z.array(imageFileSchema).min(1, "At least one property image required").max(5, "Maximum five property images allowed"),
  rooms: z.array(roomSchema).min(1, "At least one room is required"),
});

export type CreatePropertyForm = z.infer<typeof createPropertySchema>

