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
