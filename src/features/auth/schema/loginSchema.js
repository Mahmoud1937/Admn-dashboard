import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

// The login page uses stable keys so client-side errors can be translated at
// display time without changing messages returned by the API.
export const localizedLoginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "validationEmailRequired")
    .email("validationEmailInvalid"),
  password: z.string().min(1, "validationPasswordRequired"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z.string().min(6, "Password must be at least 6 characters."),
    confirmNewPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match.",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from the current one.",
    path: ["newPassword"],
  });

export const localizedChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "validationCurrentRequired"),
    newPassword: z.string().min(6, "validationNewTooShort"),
    confirmNewPassword: z.string().min(1, "validationConfirmRequired"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "validationPasswordsMismatch",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "validationNewMustDiffer",
    path: ["newPassword"],
  });
