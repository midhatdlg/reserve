import type { Event, Photo } from '@/types';
import { DARK_BG, DARK_TEXT, HEADING_FONT, BODY_FONT, MUTED } from './shared';

interface Props {
  events: Event[];
  photo: Photo | undefined;
}

function formatTime(timeStr: string | null): string {
  if (!timeStr) return '';
  const d = new Date(timeStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function ScheduleSection({ events, photo }: Props) {
  if (events.length === 0) return null;

  return (
    <section style={{
      background: DARK_BG,
      padding: '80px 40px',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        gap: 60,
        alignItems: 'stretch',
        flexWrap: 'wrap',
      }}>
        {/* Timeline */}
        <div style={{ flex: '1 1 340px' }}>
          <h2 style={{
            fontFamily: HEADING_FONT,
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 400,
            fontStyle: 'italic',
            color: DARK_TEXT,
            margin: '0 0 40px',
            lineHeight: 1.1,
          }}>
            Schedule<br />of Events
          </h2>

          <div style={{ borderLeft: `1px solid rgba(242,240,236,0.2)`, paddingLeft: 24 }}>
            {events.map((ev) => (
              <div key={ev.id} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'baseline' }}>
                  <span style={{
                    fontFamily: BODY_FONT,
                    fontSize: 13,
                    fontWeight: 400,
                    color: MUTED,
                    minWidth: 80,
                    letterSpacing: '0.5px',
                  }}>
                    {formatTime(ev.start_time)}
                  </span>
                  <span style={{
                    fontFamily: BODY_FONT,
                    fontSize: 15,
                    fontWeight: 400,
                    color: DARK_TEXT,
                  }}>
                    {ev.name}
                  </span>
                </div>
                {ev.location && (
                  <p style={{
                    fontFamily: BODY_FONT,
                    fontSize: 12,
                    fontWeight: 300,
                    color: MUTED,
                    margin: '4px 0 0 100px',
                  }}>
                    {ev.location}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Photo */}
        {photo && (
          <div style={{ flex: '1 1 300px', maxWidth: 480 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.image_url}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
