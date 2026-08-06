import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

export const createMedicalRecordSchema = z.object({
  body: z.object({
    patientId: objectIdSchema,
    diagnosis: z.string().min(2, "Diagnosis is required"),
    symptoms: z.array(z.string()).min(1, "At least one symptom is required"),
    vitalSigns: z.object({
      bloodPressure: z.string().optional(),
      heartRate: z.number().optional(),
      temperature: z.number().optional(),
      weight: z.number().optional(),
    }).optional(),
    notes: z.string().optional(),
    attachments: z.array(z.string()).optional(),
  }),
});

export const updateMedicalRecordSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    diagnosis: z.string().optional(),
    symptoms: z.array(z.string()).optional(),
    vitalSigns: z.object({
      bloodPressure: z.string().optional(),
      heartRate: z.number().optional(),
      temperature: z.number().optional(),
      weight: z.number().optional(),
    }).optional(),
    notes: z.string().optional(),
  }),
});
