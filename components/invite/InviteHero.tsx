import type { Wedding, Invite, DesignZone, TemplateOverrides, ZoneOverride } from '@/types';
import { getTemplate } from '@/lib/templates';

interface Props {
  wedding: Wedding;
  invite: Invite;
}

const DESIGN_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Yeseva+One&display=swap';

function resolveZoneContent(
  content: string,
  wedding: Wedding,
  invite: Invite
): string {
  const [n1, n2] = (wedding.title ?? '').split(' & ');
  const dateFmt = wedding.wedding_date
    ? new Date(wedding.wedding_date + 'T12:00:00').toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';
  return content
    .replace(/\{\{name_1\}\}/g, n1?.trim() ?? '')
    .replace(/\{\{name_2\}\}/g, n2?.trim() ?? '')
    .replace(/\{\{wedding_date\}\}/g, dateFmt)
    .replace(/\{\{venue_name\}\}/g, wedding.venue_name ?? '')
    .replace(/\{\{guest_name\}\}/g, invite.guest_name || 'Guest');
}

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
  'beige-watercolor': { couple_names: { fontFamily: 'Cormorant Garamond', fontSize: 48, fontColor: '#5C4033' }, date: { fontFamily: 'Montserrat', fontSize: 13, fontColor: '#7A6B5D' }, venue: { fontFamily: 'Montserrat', fontSize: 12, fontColor: '#7A6B5D' } },
  'minimal-serif':    { couple_names: { fontFamily: 'Playfair Display', fontSize: 56, fontColor: '#1A1A1A' }, date: { fontFamily: 'Montserrat', fontSize: 14, fontColor: '#666666' }, venue: { fontFamily: 'Montserrat', fontSize: 12, fontColor: '#666666' } },
  'sage-garden':      { couple_names: { fontFamily: 'Cormorant Garamond', fontSize: 48, fontColor: '#2C3E2D' }, date: { fontFamily: 'Cormorant Garamond', fontSize: 40, fontColor: '#2C3E2D' }, venue: { fontFamily: 'Montserrat', fontSize: 11, fontColor: '#4A5D4B' } },
  'midnight-gold':    { couple_names: { fontFamily: 'Cormorant Garamond', fontSize: 48, fontColor: '#C5A55A' }, date: { fontFamily: 'Montserrat', fontSize: 13, fontColor: '#D4C8A8' }, venue: { fontFamily: 'Montserrat', fontSize: 12, fontColor: '#D4C8A8' } },
};

function resolveStyle(templateId: string, zone: string, overrides?: TemplateOverrides | null): Required<ZoneOverride> {
  const d = TMPL_DEFAULTS[templateId]?.[zone] ?? TMPL_DEFAULTS.heritage[zone];
  const o = overrides?.[zone as keyof TemplateOverrides];
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

  if (templateId === 'beige-watercolor') {
    return (
      <>
        <link rel="stylesheet" href={ALL_FONTS_URL} />
        <div style={{ aspectRatio: '5 / 7', background: '#EDE4D3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 32px' }}>
          <p style={{ fontFamily: `"${ns.fontFamily}", serif`, fontSize: ns.fontSize, color: ns.fontColor, margin: 0, fontWeight: 400, textTransform: 'uppercase', letterSpacing: '4px', lineHeight: 1.1, textAlign: 'center' }}>
            {n1.toUpperCase()}
          </p>
          <p style={{ fontFamily: `"${ns.fontFamily}", serif`, fontSize: ns.fontSize * 0.58, color: '#C4A882', margin: '8px 0', fontStyle: 'italic' }}>
            &amp;
          </p>
          <p style={{ fontFamily: `"${ns.fontFamily}", serif`, fontSize: ns.fontSize, color: ns.fontColor, margin: '0 0 32px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '4px', lineHeight: 1.1, textAlign: 'center' }}>
            {n2.toUpperCase()}
          </p>
          <div style={{ width: 40, height: 1, background: '#C4A882', margin: '0 0 28px' }} />
          {dateObj && (
            <p style={{ fontFamily: `"${ds.fontFamily}", sans-serif`, fontSize: ds.fontSize, color: ds.fontColor, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '2px' }}>
              {dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          )}
          {venue && (
            <p style={{ fontFamily: `"${vs.fontFamily}", sans-serif`, fontSize: vs.fontSize, color: vs.fontColor, margin: '0 0 32px', letterSpacing: '1px' }}>
              {venue}
            </p>
          )}
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 14, color: '#A89B8C', margin: 0, fontStyle: 'italic' }}>
            reception to follow
          </p>
        </div>
      </>
    );
  }

  if (templateId === 'minimal-serif') {
    return (
      <>
        <link rel="stylesheet" href={ALL_FONTS_URL} />
        <div style={{ aspectRatio: '5 / 7', background: '#FAFAFA', display: 'flex', flexDirection: 'column', padding: '48px 32px 32px', position: 'relative' }}>
          <p style={{ fontFamily: `"${ns.fontFamily}", serif`, fontSize: ns.fontSize, color: ns.fontColor, margin: 0, fontWeight: 400, lineHeight: 0.95, letterSpacing: '3px' }}>
            {n1.toUpperCase()}
          </p>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: ns.fontSize * 0.46, color: ns.fontColor, margin: '4px 0 0 60px', fontStyle: 'italic', fontWeight: 400 }}>
            and
          </p>
          <p style={{ fontFamily: `"${ns.fontFamily}", serif`, fontSize: ns.fontSize, color: ns.fontColor, margin: '0 0 28px', fontWeight: 400, lineHeight: 0.95, letterSpacing: '3px' }}>
            {n2.toUpperCase()}
          </p>
          <div style={{ width: 1, height: 36, background: '#1A1A1A', margin: '0 auto 28px' }} />
          <div style={{ textAlign: 'center', marginTop: 'auto' }}>
            <p style={{ fontFamily: `"${ds.fontFamily}", sans-serif`, fontSize: ds.fontSize * 0.85, color: ds.fontColor, margin: '0 0 6px' }}>
              Invite you to their wedding on
            </p>
            {dateObj && (
              <p style={{ fontFamily: `"${ds.fontFamily}", sans-serif`, fontSize: ds.fontSize, color: ds.fontColor, margin: '0 0 6px', fontWeight: 500 }}>
                {dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
            {venue && (
              <p style={{ fontFamily: `"${vs.fontFamily}", sans-serif`, fontSize: vs.fontSize, color: vs.fontColor, margin: 0 }}>
                {venue}
              </p>
            )}
          </div>
          {dateObj && (
            <div style={{ position: 'absolute', bottom: 24, left: 32 }}>
              <p style={{ fontFamily: `"${ns.fontFamily}", serif`, fontSize: 24, color: '#1A1A1A', margin: 0, fontWeight: 400, letterSpacing: '2px' }}>
                {String(dateObj.getMonth() + 1).padStart(2, '0')}.{String(dateObj.getDate()).padStart(2, '0')}.{String(dateObj.getFullYear()).slice(2)}
              </p>
            </div>
          )}
          <div style={{ position: 'absolute', bottom: 24, right: 32, width: 50, borderTop: '1px solid #1A1A1A' }} />
        </div>
      </>
    );
  }

  if (templateId === 'sage-garden') {
    return (
      <>
        <link rel="stylesheet" href={ALL_FONTS_URL} />
        <div style={{ aspectRatio: '5 / 7', background: '#DDE5D6', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '32px' }}>
          <p style={{ fontFamily: `"${ns.fontFamily}", serif`, fontSize: ns.fontSize, color: ns.fontColor, margin: 0, fontWeight: 400, fontStyle: 'italic', lineHeight: 1.1 }}>
            {n1}
          </p>
          <p style={{ fontFamily: `"${ns.fontFamily}", serif`, fontSize: ns.fontSize, color: ns.fontColor, margin: '0 0 16px', fontWeight: 400, fontStyle: 'italic', lineHeight: 1.1 }}>
            &amp; {n2}
          </p>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: '#4A5D4B', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '2.5px', lineHeight: 1.6 }}>
            Request your company<br />at their wedding
          </p>
          {dateObj && (
            <p style={{ fontFamily: `"${ds.fontFamily}", serif`, fontSize: ds.fontSize, color: ds.fontColor, margin: '8px 0', fontWeight: 400 }}>
              {String(dateObj.getMonth() + 1).padStart(2, '0')}.{String(dateObj.getDate()).padStart(2, '0')}.{dateObj.getFullYear()}
            </p>
          )}
          {venue && (
            <p style={{ fontFamily: `"${vs.fontFamily}", sans-serif`, fontSize: vs.fontSize, color: vs.fontColor, margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '2px', lineHeight: 1.6 }}>
              {venue}
            </p>
          )}
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: '#4A5D4B', margin: 0, fontStyle: 'italic' }}>
            Reception to follow
          </p>
        </div>
      </>
    );
  }

  if (templateId === 'midnight-gold') {
    return (
      <>
        <link rel="stylesheet" href={ALL_FONTS_URL} />
        <div style={{ aspectRatio: '5 / 7', background: '#1E2A3A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 32px' }}>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: '#D4C8A8', margin: '0 0 24px', textTransform: 'uppercase', letterSpacing: '4px' }}>
            Together with their families
          </p>
          <p style={{ fontFamily: `"${ns.fontFamily}", serif`, fontSize: ns.fontSize, color: ns.fontColor, margin: 0, fontWeight: 400, textTransform: 'uppercase', letterSpacing: '5px', lineHeight: 1.1, textAlign: 'center' }}>
            {n1.toUpperCase()}
          </p>
          <p style={{ fontFamily: `"${ns.fontFamily}", serif`, fontSize: ns.fontSize * 0.54, color: ns.fontColor, margin: '6px 0', fontStyle: 'italic' }}>
            &amp;
          </p>
          <p style={{ fontFamily: `"${ns.fontFamily}", serif`, fontSize: ns.fontSize, color: ns.fontColor, margin: '0 0 24px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '5px', lineHeight: 1.1, textAlign: 'center' }}>
            {n2.toUpperCase()}
          </p>
          <div style={{ width: 50, height: 1, background: '#C5A55A', margin: '0 0 24px' }} />
          {dateObj && (
            <p style={{ fontFamily: `"${ds.fontFamily}", sans-serif`, fontSize: ds.fontSize, color: ds.fontColor, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '2px' }}>
              {dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          )}
          {venue && (
            <p style={{ fontFamily: `"${vs.fontFamily}", sans-serif`, fontSize: vs.fontSize, color: vs.fontColor, margin: '0 0 24px', letterSpacing: '1px' }}>
              {venue}
            </p>
          )}
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: '#8A7F6A', margin: 0, letterSpacing: '1.5px' }}>
            Dinner &amp; Dancing to follow
          </p>
        </div>
      </>
    );
  }

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
