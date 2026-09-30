export type PlanTier = 'free' | 'standard' | 'premium';
export type InviteStatus = 'pending' | 'responded' | 'declined';

export interface Couple {
  id: string;
  email: string;
  name_1: string;
  name_2: string;
  plan_tier: PlanTier;
  stripe_customer_id: string | null;
  created_at: string;
}

export interface Wedding {
  id: string;
  couple_id: string;
  slug: string;
  title: string | null;
  wedding_date: string | null;
  venue_name: string | null;
  venue_address: string | null;
  venue_lat: number | null;
  venue_lng: number | null;
  template_id: string;
  custom_design_url: string | null;
  video_embed_url: string | null;
  design_zones: DesignZone[];
  selected_blocks: string[];
  languages: string[];
  is_published: boolean;
  save_the_date_mode: boolean;
  envelope_enabled: boolean;
  envelope_wax_color: string;
  envelope_initials: string | null;
  invite_bg_color: string;
  meal_options: string[];
  strict_name_match: boolean;
  timezone: string;
  template_overrides: TemplateOverrides;
  template_content: TemplateContent;
  settings: Record<string, unknown>;
  created_at: string;
}

export interface ZoneOverride {
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
}

export interface HeroLayoutOverride {
  textPosition?: 'top' | 'center' | 'bottom';
  overlayOpacity?: number;
  fadeInText?: boolean;
}

export type TemplateOverrides = {
  couple_names?: ZoneOverride;
  date?: ZoneOverride;
  venue?: ZoneOverride;
  hero?: HeroLayoutOverride;
};

export interface Event {
  id: string;
  wedding_id: string;
  name: string;
  event_type: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface Invite {
  id: string;
  wedding_id: string;
  token: string;
  guest_name: string;
  max_guests: number;
  table_number: number | null;
  table_name: string | null;
  group_name: string | null;
  /** Wedding-party side — every guest should be bride or groom. */
  side: 'bride' | 'groom' | null;
  email: string | null;
  phone: string | null;
  status: InviteStatus;
  responded_at: string | null;
  created_at: string;
}

export interface Rsvp {
  id: string;
  invite_id: string;
  wedding_id: string;
  person_name: string;
  attending: boolean;
  meal_preference: string | null;
  dietary_notes: string | null;
  table_number: number | null;
  table_name: string | null;
  created_at: string;
}

export interface Question {
  id: string;
  wedding_id: string;
  invite_id: string | null;
  question_text: string;
  answer_text: string | null;
  is_pinned: boolean;
  is_public: boolean;
  author_name: string | null;
  author_email: string | null;
  created_at: string;
}

export interface Photo {
  id: string;
  wedding_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  role: string | null;
  created_at: string;
}

export interface TemplateContent {
  greeting?: string;
  footer?: string;
  love_story_heading?: string;
  love_story_text?: string;
  ceremony_dress_code?: string;
  ceremony_post_text?: string;
  gift_text?: string;
  gift_qr_url?: string;
  contact_email?: string;
  contact_phone?: string;
  hashtag?: string;
  /** Sage hero — script line under couple names (e.g. “Renewing our vows after 25 years”) */
  hero_tagline?: string;
}

export interface WeddingStats {
  wedding_id: string;
  total_invites: number;
  total_seats: number;
  attending: number;
  declined: number;
  pending: number;
  updated_at: string;
}

export type DesignZone = {
  id: string;
  type: 'couple_names' | 'date' | 'venue' | 'guest_name' | 'custom';
  x: number;
  y: number;
  width: number;
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  fontWeight: string;
  textAlign: 'left' | 'center' | 'right';
  content: string;
};

// Data shape passed to invite page components
export interface InvitePageData {
  invite: Invite;
  wedding: Wedding;
  events: Event[];
  rsvps: Rsvp[];
  photos: Photo[];
  questions: Question[];
}
