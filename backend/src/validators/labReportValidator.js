import { z } from "zod";
import { LAB_REPORT_STATUS } from "../constants/labReportConstants.js";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

export const createLabReportSchema = z.object({
  body: z.object({
    medicalRecordId: objectIdSchema,
    appointmentId: objectIdSchema.optional().nullable(),
    reportName: z.string().min(1, "Report name is required"),
    laboratoryName: z.string().optional(),
    reportType: z.string().optional(),
    reportDate: z.string().optional(),
    status: z.enum(Object.values(LAB_REPORT_STATUS)).optional(),
    results: z.record(z.any()).optional(),
    attachments: z.array(z.string()).optional(),
    doctorRemarks: z.string().optional(),
  }),
});

export const updateLabReportSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    reportName: z.string().optional(),
    laboratoryName: z.string().optional(),
    reportType: z.string().optional(),
    reportDate: z.string().optional(),
    status: z.enum(Object.values(LAB_REPORT_STATUS)).optional(),
    results: z.record(z.any()).optional(),
    attachments: z.array(z.string()).optional(),
    doctorRemarks: z.string().optional(),
  }),
});
