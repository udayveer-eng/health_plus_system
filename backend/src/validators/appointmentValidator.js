import { z } from "zod";
import { CONSULTATION_TYPES } from "../constants/scheduleConstants.js";
import { APPOINTMENT_STATUS } from "../constants/appointmentConstants.js";

// Validation for Mongo ObjectIds
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

export const createAppointmentSchema = z.object({
  body: z.object({
    scheduleId: objectIdSchema,
    doctorId: objectIdSchema,
    hospitalId: objectIdSchema.optional(),
    consultationType: z.enum(Object.values(CONSULTATION_TYPES)),
    reason: z.string().min(3, "Reason is required and must be clear"),
    notes: z.string().optional(),
  }),
});

export const updateAppointmentStatusSchema = z.object({
  body: z.object({
    status: z.enum(Object.values(APPOINTMENT_STATUS)),
  }),
  params: z.object({
    id: objectIdSchema,
  }),
});

export const cancelAppointmentSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});
