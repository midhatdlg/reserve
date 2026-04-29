import { z } from 'zod';

export const rsvpGuestSchema = z.object({
  person_name: z.string().trim().min(1, 'Name is required').max(100),
  attending: z.boolean(),
  meal_preference: z.string().trim().max(100).optional(),
  dietary_notes: z.string().trim().max(500).optional(),
});

/**
 * Raised from the legacy 10-seat cap to 20 so large families and group
 * invites can RSVP through a single link. Mirrors the SQL CHECK set by the
 * 20260421 migration.
 */
export const rsvpSubmitSchema = z.object({
  guests: z.array(rsvpGuestSchema).min(1).max(20),
});

export const questionSubmitSchema = z.object({
  question_text: z.string().trim().min(1, 'Question is required').max(500),
  author_name: z.string().trim().min(1).max(100).optional(),
  author_email: z.string().trim().email().max(200).optional(),
});

/**
 * Body of POST /api/invite/[slug]/lookup. `name` is required; `email`
 * disambiguates the rare case where two guests share a name.
 */
export const lookupSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name').max(200),
  email: z
    .string()
    .trim()
    .email()
    .max(200)
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

/**
 * Body of POST /api/invite/[slug]/message (the "message the couple"
 * fallback for unknown-name attempts).
 */
export const messageCoupleSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(200).optional().or(z.literal('').transform(() => undefined)),
  message: z.string().trim().min(1, 'Please include a short message').max(2000),
});

export type RsvpGuest = z.infer<typeof rsvpGuestSchema>;
export type RsvpSubmit = z.infer<typeof rsvpSubmitSchema>;
export type LookupInput = z.infer<typeof lookupSchema>;
export type MessageCoupleInput = z.infer<typeof messageCoupleSchema>;
