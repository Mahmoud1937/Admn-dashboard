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
  .max(100, "Email can't exceed 100 characters")
  .email("Please enter a valid email address");

const mapUrlField = z
  .string()
  .trim()
  .min(1, "Map URL is required")
  .max(2048, "Map URL can't exceed 2048 characters")
  .refine((val) => /^https?:\/\//.test(val), {
    message: "Map URL must start with http:// or https://",
  })
  .refine(
    (val) =>
      /(^|\.)google\.[a-z.]+\//.test(val) ||
      /^https?:\/\/(maps\.app\.)?goo\.gl\//.test(val),
    { message: "Map URL must be a valid Google Maps link" }
  );

const fullAddressField = z
  .string()
  .trim()
  .min(10, "Full address should be at least 10 characters long")
  .max(150, "Address can't exceed 150 characters");

const branchSchema = z.object({
  branchName: nameField("Branch name"),
  governorateId: requiredIdField("Governorate"),
  cityId: requiredIdField("City"),
  email: emailField,
  mapUrl: mapUrlField,
  fullAddress: fullAddressField,
  isActive: isActiveField,
});

// Add/Edit Branch now share the same shape (no more password field on either).
export const createBranchSchema = branchSchema;
export const updateBranchSchema = branchSchema;