import { z } from "zod";

export const ticketSchema = z.object({
  ticketTypeId: z
    .union([z.string(), z.number()])
    .refine((value) => value !== "" && value !== null && value !== undefined, {
      message: "Ticket type is required",
    }),
  userId: z
    .union([z.string(), z.number()])
    .refine((value) => value !== "" && value !== null && value !== undefined, {
      message: "Client is required",
    }),
  providerId: z.union([z.string(), z.number()]).optional().or(z.literal("")),
  assignedToGroupId: z.union([z.string(), z.number()]).optional().or(z.literal("")),
  userPhoneNumber: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(/^[0-9]+$/, "Phone number should contain digits only"),
  priority: z
    .string()
    .min(1, "Priority is required")
    .refine((value) => ["0", "1", "2"].includes(value), {
      message: "Please select a valid priority",
    }),
  description: z.string().trim().min(1, "Description is required"),
});
