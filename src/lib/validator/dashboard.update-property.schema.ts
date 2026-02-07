import z from "zod";
import { PropertyTypeEnum } from "./dashboard.create-property.schema";

export const updatePropertySchema = z.object({
    name: z.string().min(1, "Property name is required").optional(),
    description: z.string().min(1, "Description is required").optional(),
    address: z.string().min(1, "Address is required").optional(),
    cityId: z.number().min(1, "Please select one city").optional(),
    categoryId: z.number().min(1, "Please select a category").optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    propertyType: PropertyTypeEnum.optional(),
    amenities: z.array(z.string()).min(1, "Select at least one amenity").optional(),
});

export type UpdatePropertFormValues = z.infer<typeof updatePropertySchema>;