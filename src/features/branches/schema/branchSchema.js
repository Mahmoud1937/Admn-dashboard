import { z } from "zod";
import {
  nameField,
  requiredIdField,
  isActiveField,
} from "../../../shared/schema/validation";

const emailField = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

const userNameField = z
  .string()
  .trim()
  .min(3, "Username should be at least 3 characters long")
  .max(30, "Username can't exceed 30 characters")
  .regex(/^[a-zA-Z0-9_.]+$/, "Username can only contain letters, numbers, underscores and dots");

const passwordField = z
  .string()
  .min(6, "Password should be at least 6 characters long");

const mapUrlField = z
  .string()
  .trim()
  .min(1, "Map URL is required")
  .refine((val) => /^https?:\/\//.test(val), {
    message: "Map URL must start with http:// or https://",
  });

const coordinateField = z
  .union([z.string(), z.number()])
  .refine((val) => val !== "" && val !== null && val !== undefined, {
    message: "This field is required",
  })
  .transform((val) => Number(val))
  .refine((val) => !Number.isNaN(val), {
    message: "Must be a valid number",
  });

const fullAddressField = z
  .string()
  .trim()
  .min(1, "Full address is required")
  .max(200, "Address can't exceed 200 characters");

const branchBaseSchema = z.object({
  branchName: nameField("Branch name"),
  governorateId: requiredIdField("Governorate"),
  cityId: requiredIdField("City"),
  email: emailField,
  userName: userNameField,
  mapUrl: mapUrlField,
  latitude: coordinateField,
  longitude: coordinateField,
  fullAddress: fullAddressField,
  isActive: isActiveField,
});

// Add Branch: password required
export const createBranchSchema = branchBaseSchema.extend({
  password: passwordField,
});

// Edit Branch: password optional (leave blank to keep current)
export const updateBranchSchema = branchBaseSchema.extend({
  password: passwordField.optional().or(z.literal("")),
});