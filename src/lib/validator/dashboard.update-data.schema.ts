import z from "zod";

export const updateTenantDataSchema = z.object({
  tenantName: z.string().min(1, "Business name is required").optional(),
  address: z.string().optional(),
  aboutMe: z.string().optional(),
  bankName: z.string().min(1, "Bank name is required").optional(),
  bankNumber: z.string().min(1, "Bank account number is required").optional(),
});

export type UpdateTenantData = z.infer<typeof updateTenantDataSchema>;
