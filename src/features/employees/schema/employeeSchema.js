import { z } from "zod";

const employeeName = (label) =>
  z.string().trim().min(1, `${label} is required`).max(50, `${label} can't exceed 50 characters`);

export const employeeSchema = z.object({
  firstName: employeeName("First name"),
  lastName: employeeName("Last name"),
  email: z.string().trim().email("Please enter a valid email address"),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^01[0125][0-9]{8}$/, "Please enter a valid Egyptian mobile number"),
  employeeGroupId: z.union([z.string(), z.number()]).refine(
    (value) => value !== "" && value !== null && value !== undefined,
    "Please select an employee group"
  ),
});
export const resetEmployeePasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters."),
    confirmNewPassword: z.string().min(1, "Confirm the new password."),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match.",
    path: ["confirmNewPassword"],
  });