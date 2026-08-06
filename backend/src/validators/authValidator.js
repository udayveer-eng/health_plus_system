import { z } from "zod";
import ROLES from "../constants/roles.js";

// Registration requires either hospital details OR personal details based on role
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(Object.values(ROLES)),
    
    // Base personal details (used by Doctor/Patient)
    name: z.string().optional(),
    phone: z.string().optional(),
    
    // Hospital specific
    city: z.string().optional(),
    location: z.object({
      address: z.string(),
      coordinates: z.tuple([z.number(), z.number()]).optional(),
    }).optional(),
    // Patient specific
    age: z.number().optional(),
    gender: z.string().optional(),
    bloodGroup: z.string().optional(),
  }).refine((data) => {
    // Basic structural validation
    if (data.role === ROLES.HOSPITAL && !data.city) return false;
    if (data.role === ROLES.PATIENT && !data.name) return false;
    return true;
  }, {
    message: "Missing required profile fields based on selected role",
    path: ["body"],
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});
