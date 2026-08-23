import { z } from "zod";
import { isValidCustomSlug } from "./slug";

export const destinationSchema = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .refine(
    (v) => {
      try {
        const u = new URL(v);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Enter a valid http(s) URL" }
  );

export const shortenSchema = z.object({
  destination: destinationSchema,
  customSlug: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || isValidCustomSlug(v), {
      message: "Use 3-30 letters, numbers, hyphens or underscores",
    }),
});

export const signupSchema = z.object({
  name: z.string().trim().min(1).max(60),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const linkUpdateSchema = z
  .object({
    destination: destinationSchema.optional(),
    title: z.string().trim().max(120).nullable().optional(),
    slug: z
      .string()
      .trim()
      .refine(isValidCustomSlug, {
        message: "Use 3-30 letters, numbers, hyphens or underscores",
      })
      .optional(),
    disabled: z.boolean().optional(),
    expiresAt: z.string().datetime({ offset: true }).nullable().optional(),
  })
  .refine(
    (v) =>
      v.destination !== undefined ||
      v.title !== undefined ||
      v.slug !== undefined ||
      v.disabled !== undefined ||
      v.expiresAt !== undefined,
    { message: "Nothing to update" }
  );

export const profileSchema = z.object({
  name: z.string().trim().min(1).max(60),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

const qrFill = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("solid"),
    color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/),
  }),
  z.object({
    type: z.enum(["linear", "radial"]),
    rotation: z.number().min(-180).max(180),
    stops: z
      .object({
        offset: z.number().min(0).max(1),
        color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/),
      })
      .array()
      .length(2),
  }),
]);

export const qrConfigSchema = z.object({
  dotStyle: z.enum([
    "square",
    "rounded",
    "extra-rounded",
    "dots",
    "diamond",
    "classy",
    "classy-rounded",
  ]),
  frameStyle: z.enum(["square", "rounded", "extra-rounded", "dots", "leaf"]),
  ballStyle: z.enum(["square", "rounded", "dots", "diamond"]),
  dotFill: qrFill,
  cornerFill: qrFill,
  background: z.object({
    transparent: z.boolean(),
    color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/),
  }),
  margin: z.number().int().min(0).max(6),
  ecc: z.enum(["L", "M", "Q", "H"]),
  logo: z.object({
    enabled: z.boolean(),
    src: z
      .string()
      .max(700000)
      .refine(
        (v) => v === "" || /^data:image\/(png|jpeg|jpg|webp|svg\+xml);base64,/.test(v)
      )
      .optional(),
    size: z.number().min(10).max(40),
    padding: z.number().min(0).max(20),
    shape: z.enum(["none", "square", "circle"]),
    bgColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/),
  }),
});

export const createLinkSchema = z.object({
  destination: destinationSchema,
  title: z.string().trim().max(120).nullable().optional(),
  slug: z
    .string()
    .trim()
    .refine(isValidCustomSlug, {
      message: "Use 3-30 letters, numbers, hyphens or underscores",
    })
    .optional(),
  expiresAt: z.string().datetime({ offset: true }).nullable().optional(),
});

export const qrContentSchema = z.record(z.string(), z.any());

export const createQrSchema = z.object({
  name: z.string().trim().min(1).max(80),
  type: z.enum(["URL", "TEXT", "EMAIL", "PHONE", "SMS", "WIFI", "VCARD", "LOCATION"]),
  content: qrContentSchema,
  config: qrConfigSchema,
  dynamic: z.boolean(),
  destination: destinationSchema.optional(),
});

export const updateQrSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  type: z
    .enum(["URL", "TEXT", "EMAIL", "PHONE", "SMS", "WIFI", "VCARD", "LOCATION"])
    .optional(),
  content: qrContentSchema.optional(),
  config: qrConfigSchema.optional(),
  destination: destinationSchema.nullable().optional(),
});
