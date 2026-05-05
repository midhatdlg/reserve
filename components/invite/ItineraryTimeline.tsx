import type { Event } from '@/types';

interface Props {
  events: Event[];
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function ItineraryTimeline({ events }: Props) {
  if (events.length === 0) return null;

  return (
    <div>
      <p style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: 13,
        letterSpacing: '3px',
        color: '#1A1A1A',
        textTransform: 'uppercase',
        textAlign: 'center',
        margin: '0 0 24px',
      }}>
        The Day
      </p>

      <div style={{ position: 'relative' }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute',
          left: 72,
          top: 8,
          bottom: 8,
          width: 1,
          background: 'rgba(26,26,26,0.12)',
        }} />

        {events.map((event, i) => (
          <div key={event.id} style={{
            display: 'flex',
            gap: 0,
            marginBottom: i < events.length - 1 ? 28 : 0,
            position: 'relative',
          }}>
            {/* Time */}
            <div style={{
              width: 64,
              flexShrink: 0,
              textAlign: 'right',
              paddingRight: 0,
            }}>
              {event.start_time && (
                <span style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: 13,
                  color: '#9E9E9E',
                  letterSpacing: '0.5px',
                }}>
                  {formatTime(event.start_time)}
                </span>
              )}
            </div>

            {/* Dot */}
            <div style={{
              width: 16,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: 3,
            }}>
              <div style={{
                width: i === 0 ? 10 : 8,
                height: i === 0 ? 10 : 8,
                borderRadius: '50%',
                background: i === 0 ? '#1A1A1A' : 'transparent',
                border: `${i === 0 ? 0 : 1.5}px solid ${i === 0 ? 'transparent' : 'rgba(26,26,26,0.3)'}`,
                flexShrink: 0,
              }} />
            </div>

            {/* Content */}
            <div style={{ flex: 1, paddingLeft: 12 }}>
              <p style={{
                fontFamily: 'NewYork, Georgia, serif',
                fontSize: 16,
                color: '#1A1A1A',
                margin: '0 0 3px',
                lineHeight: 1.3,
              }}>
                {event.name}
              </p>
              {event.location && (
                <p style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: 13,
                  color: '#1A1A1A',
                  margin: '0 0 3px',
                  fontStyle: 'italic',
                }}>
                  {event.location}
                </p>
              )}
              {event.description && (
                <p style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: 14,
                  color: '#9E9E9E',
                  margin: 0,
                  lineHeight: 1.5,
                }}>
                  {event.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
