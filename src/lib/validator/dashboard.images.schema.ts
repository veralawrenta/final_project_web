import z from "zod";

const MAX_FILE_SIZE = 1 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpg",
  "image/png",
  "image/jpeg",
  "image/gif",
];

export const imageFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, "Max image size is 1 MB")
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    "Only JPG, PNG, JPEG, GIF are allowed"
  );