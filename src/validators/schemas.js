import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const doctorSchema = z.object({
  name: z.string().trim().min(2),
  specialization: z.string().trim().min(2),
  hospital: z.string().trim().min(2),
  phone: z.string().trim().min(6),
  email: z.string().trim().email(),
});

export const patientSchema = z.object({
  name: z.string().trim().min(2),
  age: z.coerce.number().int().min(0).max(130),
  gender: z.enum(["Male", "Female", "Other"]),
  phone: z.string().trim().min(6),
  condition: z.string().trim().min(2),
  notes: z.string().optional(),
  doctor: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Doctor ID"),
});

export const patientUpdateSchema = patientSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required",
  );
