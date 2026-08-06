export const BED_TYPES = ["general", "icu", "ventilator", "emergency"];
export const BLOOD_GROUPS = [
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
];
export const RESOURCE_TYPES = ["bed", "blood", "oxygen"];

export const REQUEST_STATUSES = [
  "pending",
  "accepted",
  "in_progress",
  "completed",
  "cancelled",
  "expired",
  // Uppercase for newer implementations based on requirements
  "PENDING",
  "ACCEPTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED"
];

export const PRIORITY_LEVELS = ["low", "medium", "high", "critical", "LOW", "MEDIUM", "HIGH", "CRITICAL"];
