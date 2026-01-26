import z from "zod"

export const changeEmailSchema = z.object({
    newEmail : z.email()
});