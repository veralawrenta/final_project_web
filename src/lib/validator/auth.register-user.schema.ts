import { z } from "zod";

export const registerSchemaCredentials = z.object({
  email: z.email(),
});
