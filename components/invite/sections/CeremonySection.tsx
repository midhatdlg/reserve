import type { ReactNode } from 'react';
import type { TemplateTheme } from '@/lib/template-theme';
import { PAD_CEREMONY_INNER, FS_DISPLAY_LG, GAP_LAYOUT, SECTION_MIN_HEIGHT } from '@/lib/template-theme';
import { LineHint } from './Placeholders';

interface Props {
  theme: TemplateTheme;
  venueName: string | null;
  venueAddress: string | null;
  dressCode?: string;
  postCeremony?: string;
  showPlaceholders?: boolean;
}

export function CeremonySection({
  theme: t,
  venueName,
  venueAddress,
  dressCode,
  postCeremony,
  showPlaceholders = false,
}: Props) {
  const venueText = [venueName, venueAddress].filter(Boolean).join('\n');
  const hasContent = venueText || dressCode || postCeremony;
  if (!hasContent && !showPlaceholders) return null;

  type CardDef = { title: string; text: string; placeholder: string; icon: ReactNode };

  const defs: CardDef[] = [
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke={t.ink3} strokeWidth="1.2">
          <path d="M14 3v22M6 7h16M4 7l3 18h14l3-18" />
        </svg>
      ),
      title: 'Ceremony Venue',
      text: venueText,
      placeholder: 'Venue name & address — Wedding Settings',
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke={t.ink3} strokeWidth="1.2">
          <path d="M10 4v4M18 4v4M14 14v6M11 17h6M5 8h18v16H5z" />
        </svg>
      ),
      title: 'Dress Code',
      text: dressCode ?? '',
      placeholder: 'Dress code — Design → Content',
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke={t.ink3} strokeWidth="1.2">
          <circle cx="14" cy="14" r="10" />
          <path d="M14 8v6l4 2" />
        </svg>
      ),
      title: 'Post-Ceremony',
      text: postCeremony ?? '',
      placeholder: 'Post-ceremony note — Design → Content',
    },
  ];

  const cards = defs.filter((c) => c.text.trim() || showPlaceholders);

  return (
    <section style={{
      minHeight: SECTION_MIN_HEIGHT,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        background: t.pageBg,
        padding: PAD_CEREMONY_INNER,
        textAlign: 'center',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: t.displayFont,
            fontSize: FS_DISPLAY_LG,
            fontWeight: 400,
            color: t.ink,
            margin: '0 0 clamp(28px, 8cqi, 48px)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            THE CEREMONY
          </h2>

          {cards.length > 0 && (
            <>
            <style dangerouslySetInnerHTML={{ __html: `
              .tl-ceremony-cards{flex-direction:column;gap:clamp(32px,8cqi,48px);}
              @container(min-width:600px){.tl-ceremony-cards{flex-direction:row;}}
            `}} />
            <div
              className="tl-ceremony-cards"
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: GAP_LAYOUT,
              }}
            >
              {cards.map((card) => {
                const empty = !card.text.trim();
                return (
                  <div key={card.title} style={{
                    flex: '1 1 0',
                    maxWidth: 280,
                    textAlign: 'center',
                  }}>
                    <div style={{
                      width: 'clamp(48px, 12cqi, 56px)',
                      height: 'clamp(48px, 12cqi, 56px)',
                      borderRadius: '50%',
                      border: `1px solid ${t.rule}`,
                      margin: '0 auto 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {card.icon}
                    </div>
                    <h3 style={{
                      fontFamily: t.bodyFont,
                      fontSize: 'clamp(12px, 3cqi, 13px)',
                      fontWeight: 600,
                      color: t.ink,
                      margin: '0 0 10px',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}>
                      {card.title}
                    </h3>
                    {empty && showPlaceholders ? (
                      <LineHint theme={t}>{card.placeholder}</LineHint>
                    ) : (
                      <p style={{
                        fontFamily: t.bodyFont,
                        fontSize: 'clamp(12px, 3cqi, 13px)',
                        fontWeight: 400,
                        color: t.ink2,
                        margin: 0,
                        lineHeight: 1.7,
                        whiteSpace: 'pre-line',
                      }}>
                        {card.text}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
