import z from "zod";

export const updateDataTenantSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  tenantName: z.string().min(1, "Business name is required").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  aboutMe: z.string().optional(),
  bankName: z.string().min(1, "Bank name is required").optional(),
  bankNumber: z.string().min(1, "Bank account number is required").optional(),
});

export type UpdateTenantData = z.infer<typeof updateDataTenantSchema>;
