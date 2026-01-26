import z from "zod";

export const updateDataUserSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    aboutMe: z.string().optional(),
});