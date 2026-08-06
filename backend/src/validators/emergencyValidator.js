import { z } from "zod";
import { RESOURCE_TYPES, BED_TYPES, BLOOD_GROUPS, PRIORITY_LEVELS, REQUEST_STATUSES } from "../constants/resourceConstants.js";

export const createEmergencyRequestSchema = z.object({
  body: z.object({
    patientName: z.string().min(2),
    phone: z.string().min(10),
    city: z.string().min(2),
    resourceType: z.enum(RESOURCE_TYPES),
    bedType: z.enum(BED_TYPES).optional(),
    bloodGroup: z.enum(BLOOD_GROUPS).optional(),
    quantity: z.number().int().min(1).default(1),
    priority: z.enum(PRIORITY_LEVELS).default("medium"),
    message: z.string().max(500).optional(),
  }).superRefine((data, ctx) => {
    if (data.resourceType === "bed" && !data.bedType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "bedType is required when resourceType is bed",
        path: ["bedType"],
      });
    }
    if (data.resourceType === "blood" && !data.bloodGroup) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "bloodGroup is required when resourceType is blood",
        path: ["bloodGroup"],
      });
    }
  }),
});

export const updateEmergencyRequestStatusSchema = z.object({
  body: z.object({
    status: z.enum(REQUEST_STATUSES),
  }),
});
