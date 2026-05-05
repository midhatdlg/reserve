import type { Wedding, Invite, DesignZone, TemplateOverrides, ZoneOverride } from '@/types';
import { getTemplate } from '@/lib/templates';
import { resolveZoneContent } from '@/lib/resolve-zone';

interface Props {
  wedding: Wedding;
  invite: Invite;
}

const DESIGN_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Yeseva+One&display=swap';

// Numeric date: "Saturday, September 12, 2026"
function formatDateNumeric(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/* Default font styles per template (must match DesignEditor's TEMPLATE_DEFAULTS) */
const TMPL_DEFAULTS: Record<string, Record<string, ZoneOverride>> = {
  heritage:           { couple_names: { fontFamily: 'Cormorant Garamond', fontSize: 48, fontColor: '#2C2C2C' }, date: { fontFamily: 'Cormorant Garamond', fontSize: 15, fontColor: '#6B6560' }, venue: { fontFamily: 'Cormorant Garamond', fontSize: 12, fontColor: '#8B7355' } },
  'monochrome':       { couple_names: { fontFamily: 'NewYork', fontSize: 64, fontColor: '#000000' }, date: { fontFamily: 'Montserrat', fontSize: 11, fontColor: '#000000' }, venue: { fontFamily: 'Montserrat', fontSize: 11, fontColor: '#3A3A3A' } },
};

type TextZoneKey = 'couple_names' | 'date' | 'venue';

function resolveStyle(templateId: string, zone: TextZoneKey, overrides?: TemplateOverrides | null): Required<ZoneOverride> {
  const d = TMPL_DEFAULTS[templateId]?.[zone] ?? TMPL_DEFAULTS.heritage[zone];
  const o = overrides?.[zone];
  return {
    fontFamily: o?.fontFamily ?? d.fontFamily!,
    fontSize:   o?.fontSize   ?? d.fontSize!,
    fontColor:  o?.fontColor  ?? d.fontColor!,
  };
}

const ALL_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;500;600&family=Lora:ital,wght@0,400;0,700;1,400&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Great+Vibes&family=Josefin+Sans:wght@300;400;600&family=Raleway:wght@300;400;600&display=swap';

export function InviteHero({ wedding, invite }: Props) {
  const [name1, name2] = (wedding.title ?? '').split(' & ');
  const initials = `${(name1 ?? 'O').trim().charAt(0)} & ${(name2 ?? 'R').trim().charAt(0)}`;
  const zones = (wedding.design_zones ?? []) as DesignZone[];

  // Custom design hero — image + positioned text zones
  if (wedding.custom_design_url && zones.length > 0) {
    return (
      <>
        <link rel="stylesheet" href={DESIGN_FONTS_URL} />
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '9 / 16',
            overflow: 'hidden',
            containerType: 'inline-size',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={wedding.custom_design_url}
            alt={wedding.title ?? 'Wedding invite'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
          {zones.map((zone) => (
            <div
              key={zone.id}
              style={{
                position: 'absolute',
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.width}%`,
                textAlign: zone.textAlign,
                pointerEvents: 'none',
              }}
            >
              <span
                style={{
                  fontFamily: `"${zone.fontFamily}", serif`,
                  fontSize: `${zone.fontSize * 0.125}cqi`,
                  color: zone.fontColor,
                  fontWeight: zone.fontWeight,
                  display: 'block',
                  lineHeight: 1.2,
                }}
              >
                {resolveZoneContent(zone.content, wedding, invite)}
              </span>
            </div>
          ))}
        </div>
      </>
    );
  }

  // Pre-designed template heroes with font overrides
  const templateId = wedding.template_id;
  const n1 = name1?.trim() ?? 'Partner';
  const n2 = name2?.trim() ?? 'Partner';
  const dateObj = wedding.wedding_date ? new Date(wedding.wedding_date + 'T12:00:00') : null;
  const venue = wedding.venue_name ?? '';
  const ov = wedding.template_overrides as TemplateOverrides | null;
  const ns = resolveStyle(templateId, 'couple_names', ov);
  const ds = resolveStyle(templateId, 'date', ov);
  const vs = resolveStyle(templateId, 'venue', ov);

  // Video embed hero
  if (wedding.video_embed_url) {
    return (
      <div style={{
        position: 'relative',
        width: '100%',
        paddingBottom: '177.78%',
        background: '#000',
        overflow: 'hidden',
      }}>
        <iframe
          src={wedding.video_embed_url}
          loading="lazy"
          allowFullScreen
          allow="autoplay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        />
      </div>
    );
  }

  // Moss & Vellum typographic hero
  const dateStr = wedding.wedding_date ? formatDateNumeric(wedding.wedding_date) : null;

  return (
    <div style={{
      padding: '56px 32px 44px',
      textAlign: 'center',
    }}>
      {/* Couple names */}
      <h1 style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: 42,
        fontWeight: 400,
        color: '#2C2C2C',
        margin: '0 0 20px',
        lineHeight: 1.15,
        textTransform: 'uppercase',
        letterSpacing: '2px',
      }}>
        {name1?.trim() ?? 'Partner'} <span style={{ fontStyle: 'italic', letterSpacing: 0 }}>&amp;</span> {name2?.trim() ?? 'Partner'}
      </h1>

      {/* Date */}
      {dateStr && (
        <p style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 15,
          color: '#6B6560',
          margin: '0 0 20px',
        }}>
          {dateStr}
        </p>
      )}

      {/* Venue */}
      {wedding.venue_name && (
        <p style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 12,
          letterSpacing: '3px',
          color: '#8B7355',
          margin: 0,
          textTransform: 'uppercase',
        }}>
          {wedding.venue_name}{wedding.venue_address ? ` · ${wedding.venue_address.split(',').pop()?.trim()}` : ''}
        </p>
      )}
    </div>
  );
}
