import { LIGHT_BG, LIGHT_TEXT, HEADING_FONT, BODY_FONT, MUTED } from './shared';

interface Props {
  venueName: string | null;
  venueAddress: string | null;
  dressCode?: string;
  postCeremony?: string;
}

export function CeremonySection({ venueName, venueAddress, dressCode, postCeremony }: Props) {
  const hasContent = venueName || dressCode || postCeremony;
  if (!hasContent) return null;

  const cards = [
    { title: 'Ceremony Venue', text: [venueName, venueAddress].filter(Boolean).join('\n') },
    { title: 'Dress Code', text: dressCode ?? '' },
    { title: 'Post-Ceremony', text: postCeremony ?? '' },
  ].filter((c) => c.text);

  return (
    <section style={{
      background: LIGHT_BG,
      padding: '80px 40px',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: HEADING_FONT,
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 400,
          fontStyle: 'italic',
          color: LIGHT_TEXT,
          margin: '0 0 48px',
        }}>
          The Ceremony
        </h2>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 40,
          flexWrap: 'wrap',
        }}>
          {cards.map((card) => (
            <div key={card.title} style={{
              flex: '1 1 200px',
              maxWidth: 280,
              textAlign: 'center',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                border: `1px solid ${LIGHT_TEXT}`,
                margin: '0 auto 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: HEADING_FONT, fontSize: 18, color: LIGHT_TEXT,
              }}>
                {card.title.charAt(0)}
              </div>
              <h3 style={{
                fontFamily: BODY_FONT,
                fontSize: 14,
                fontWeight: 500,
                color: LIGHT_TEXT,
                margin: '0 0 8px',
                letterSpacing: '1px',
              }}>
                {card.title}
              </h3>
              <p style={{
                fontFamily: BODY_FONT,
                fontSize: 13,
                fontWeight: 300,
                color: MUTED,
                margin: 0,
                lineHeight: 1.7,
                whiteSpace: 'pre-line',
              }}>
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
