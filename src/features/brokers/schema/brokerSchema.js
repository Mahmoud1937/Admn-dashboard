import { z } from "zod";
import { nameField } from "../../../shared/schema/validation";

export const brokerSchema = z.object({
  name: nameField("Name"),
  phoneNumber: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(/^01[0125][0-9]{8}$/, "Please enter a valid Egyptian mobile number"),
});
