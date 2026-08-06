import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

const medicineSchema = z.object({
  medicineName: z.string().min(1, "Medicine name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().min(1, "Duration is required"),
  instructions: z.string().optional(),
});

export const createPrescriptionSchema = z.object({
  body: z.object({
    appointmentId: objectIdSchema,
    medicalRecordId: objectIdSchema.optional().nullable(),
    diagnosis: z.string().min(1, "Diagnosis is required"),
    medicines: z.array(medicineSchema).min(1, "At least one medicine is required"),
    additionalNotes: z.string().optional(),
    followUpDate: z.string().optional(),
  }),
});

export const updatePrescriptionSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    diagnosis: z.string().optional(),
    medicines: z.array(medicineSchema).optional(),
    additionalNotes: z.string().optional(),
    followUpDate: z.string().optional(),
  }),
});
