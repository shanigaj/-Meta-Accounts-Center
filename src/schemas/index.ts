import { z } from "zod";

// Shared field rules — reused by both the API and the forms so a password
// that's valid on the client is valid on the server too.
const email = z.string().trim().toLowerCase().email("Enter a valid email address.");
const password = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password is too long.");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  email,
  password,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required."),
});

export const forgotPasswordSchema = z.object({ email });

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: email.optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s-]{6,18}$/, "Enter a valid phone number.")
    .optional()
    .or(z.literal("")),
  dateOfBirth: z.string().datetime().optional().or(z.literal("")),
  avatarUrl: z.string().url("Enter a valid image URL.").optional().or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: password,
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    message: "New password must be different from the current one.",
    path: ["newPassword"],
  });

export const connectAccountSchema = z.object({
  provider: z.enum(["FACEBOOK", "INSTAGRAM", "WHATSAPP"]),
  providerUsername: z.string().trim().min(2, "Enter a username.").max(60),
});

export const privacySchema = z.object({
  profileVisibility: z.enum(["PUBLIC", "FRIENDS", "PRIVATE"]).optional(),
  emailVisibility: z.enum(["PUBLIC", "FRIENDS", "PRIVATE"]).optional(),
  phoneVisibility: z.enum(["PUBLIC", "FRIENDS", "PRIVATE"]).optional(),
  personalizedAds: z.boolean().optional(),
  dataSharing: z.boolean().optional(),
});

export const twoFactorSchema = z.object({ enabled: z.boolean() });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
