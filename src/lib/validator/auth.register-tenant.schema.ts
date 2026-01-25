import z from "zod";

export const registerSchemaTenant = z.object({
    email: z.email(),
    tenantName: z.string()
    .min(1, "Tenant name is required")
    .transform((val) => val.charAt(0).toUpperCase()+ val.slice(1))
  });