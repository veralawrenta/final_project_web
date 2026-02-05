import z from "zod";
import { PropertyTypeEnum } from "./dashboard.create-property.schema";

export const updatePropertySchema = z.object({
    name: z.string().min(1, "Property name is required").max(150),
    description: z.string().min(1, "Description is required"),
    address: z.string().min(1, "Address is required").max(255),
    cityId: z.number().min(1, "Please select a city"),
    categoryId: z.number().min(1, "Please select a category"),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    propertyType: PropertyTypeEnum,
    amenities: z.array(z.string()).min(1, "Select at least one amenity"),
});