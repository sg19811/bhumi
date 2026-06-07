import { z } from "zod";

// Server-side validation for listing create/edit. Used by /api/listings/validate.
// Uses version-stable zod primitives (regex for email/url checks) to avoid v4 API churn.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const STORAGE_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/`;

const PHONE = /^\d{7,15}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Empty string is treated as "not provided" for optional formatted fields.
const optionalPhone = z.string().trim().regex(PHONE, "Enter 7–15 digits only").optional().or(z.literal(""));

const storageUrl = z
  .string()
  .refine((u) => !SUPABASE_URL || u.startsWith(STORAGE_PREFIX), "Media must be an uploaded AcreHub file");

export const listingSchema = z.object({
  title: z.string().trim().min(3, "Title is required (min 3 chars)").max(120, "Title is too long (max 120)"),
  description: z.string().trim().max(4000, "Description is too long (max 4000)").optional().or(z.literal("")),
  land_type: z.string().trim().min(1, "Pick a land type"),
  price: z.coerce.number({ message: "Enter a price" }).positive("Price must be greater than 0"),
  price_basis: z.enum(["total", "per_acre", "per_guntha", "per_sqft"]).optional().or(z.literal("")),
  area_value: z.coerce.number({ message: "Enter the area" }).positive("Area must be greater than 0"),
  area_unit: z.string().trim().min(1, "Pick an area unit"),
  latitude: z.coerce.number({ message: "Drop a pin / enter latitude" }).min(-90, "Latitude must be between −90 and 90").max(90, "Latitude must be between −90 and 90"),
  longitude: z.coerce.number({ message: "Drop a pin / enter longitude" }).min(-180, "Longitude must be between −180 and 180").max(180, "Longitude must be between −180 and 180"),
  district: z.string().trim().max(80, "District is too long").optional().or(z.literal("")),
  taluka: z.string().trim().max(80, "Taluka is too long").optional().or(z.literal("")),
  village: z.string().trim().max(80, "Village is too long").optional().or(z.literal("")),
  water_source: z.string().trim().max(40).optional().or(z.literal("")),
  road_access: z.string().trim().max(40).optional().or(z.literal("")),
  contact_phone: optionalPhone,
  contact_whatsapp: optionalPhone,
  contact_email: z.string().trim().regex(EMAIL, "Enter a valid email").optional().or(z.literal("")),
  photos: z.array(storageUrl).max(20, "Too many photos").optional(),
  videos: z.array(storageUrl).max(10, "Too many videos").optional(),
});

export type ListingInput = z.infer<typeof listingSchema>;

// Validate a payload; returns first error message per field (empty object if valid).
export function validateListing(input: unknown): { ok: boolean; fieldErrors: Record<string, string> } {
  const result = listingSchema.safeParse(input);
  if (result.success) return { ok: true, fieldErrors: {} };
  const fieldErrors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "_form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { ok: false, fieldErrors };
}
