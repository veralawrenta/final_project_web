import z from "zod"

export const changeEmailSchema = z.object({
    oldEmail : z.email(),
    newEmail : z.email()
});