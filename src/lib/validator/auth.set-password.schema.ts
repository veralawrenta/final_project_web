import z from "zod";


export const verifyAndSetPasswordSchema = z
    .object({
        password: z.string().min(8, "Password must be at least 8 characters long"),
        confirmPassword: z.string(),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });