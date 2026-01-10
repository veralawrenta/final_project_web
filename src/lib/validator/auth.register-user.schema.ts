import z from "zod";


export const registerSchemaCredentials = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.email(),
    role: z.enum(["USER"]),
  });