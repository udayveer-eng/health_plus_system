import { z } from "zod";

export const createConsultationSchema = z.object({
  body: z.object({
    appointmentId: z.string().min(1, "Appointment ID is required"),
  }),
});
