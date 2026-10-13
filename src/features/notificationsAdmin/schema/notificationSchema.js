import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || /^https?:\/\/\S+$/i.test(v), {
    message: "Enter a valid URL starting with http:// or https://",
  });

const optionalId = z.union([z.string(), z.number()]).refine(
  (value) => value === "" || (Number.isInteger(Number(value)) && Number(value) > 0),
  { message: "Select a valid item" }
);

export const notificationSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(100, "Max 100 characters"),
    messageEn: z
      .string()
      .trim()
      .min(1, "English message is required")
      .max(500, "Max 500 characters"),
    messageAr: z
      .string()
      .trim()
      .min(1, "Arabic message is required")
      .max(500, "Max 500 characters"),
    imageUrl: optionalUrl,
    isMale: z.enum(["", "true", "false"]),
    governmentId: optionalId,
    targetType: z.enum(["1", "2"]),
    targetId: optionalId,
    sendMode: z.enum(["now", "schedule"]),
    scheduledAt: z.string().optional(),
    durationDay: z
      .string()
      .optional()
      .refine((v) => !v || (/^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 365), {
        message: "Enter a whole number between 1 and 365",
      }),
  })
  .superRefine((val, ctx) => {
    if (val.sendMode === "schedule") {
      if (!val.scheduledAt) {
        ctx.addIssue({
          code: "custom",
          path: ["scheduledAt"],
          message: "Pick a date and time",
        });
      } else if (new Date(val.scheduledAt).getTime() <= Date.now()) {
        ctx.addIssue({
          code: "custom",
          path: ["scheduledAt"],
          message: "Scheduled time must be in the future",
        });
      }
    }
  });

export const defaultNotificationValues = {
  title: "",
  messageEn: "",
  messageAr: "",
  imageUrl: "",
  isMale: "",
  governmentId: "",
  targetType: "1",
  targetId: "",
  sendMode: "now",
  scheduledAt: "",
  durationDay: "",
};

// Convert form values -> API payload (nullable fields become null)
export const toPayload = (v) => ({
  title: v.title.trim(),
  messageEn: v.messageEn.trim(),
  messageAr: v.messageAr.trim(),
  imageUrl: v.imageUrl?.trim() || null,
  isMale: v.isMale == null || v.isMale === "" ? null : v.isMale === "true",
  governmentId: v.governmentId ? Number(v.governmentId) : null,
  targetType: Number(v.targetType),
  targetId: v.targetId ? Number(v.targetId) : null,
  durationDay: v.durationDay ? Number(v.durationDay) : null,
  scheduledAt:
    v.sendMode === "schedule" && v.scheduledAt
      ? v.scheduledAt
      : null,
});
