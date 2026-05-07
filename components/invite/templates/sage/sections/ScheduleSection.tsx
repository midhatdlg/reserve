/**
 * Sage template — schedule/program block on cream background.
 * Includes venue/date info (absorbs what CeremonySection showed) and
 * botanical decorations (RoseLine left, ButterflyBloom right).
 */
import type { Event } from '@/types';
import type { TemplateTheme } from '@/lib/template-theme';
import { LineHint } from '@/components/invite/templates/monochrome/sections/Placeholders';
import { RoseLine, ButterflyBloom } from '../decorations';
import {
  CREAM_PAPER,
  INK_ON_CREAM,
  INK_ON_CREAM_2,
  INK_ON_CREAM_3,
  RULE_ON_CREAM,
} from '../shared';

interface Props {
  theme: TemplateTheme;
  events: Event[];
  weddingDate?: string | null;
  venueName?: string | null;
  venueAddress?: string | null;
  showPlaceholders?: boolean;
}

function formatTime(timeStr: string | null): string {
  if (!timeStr) return '';
  const d = new Date(timeStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase();
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const SCHEDULE_DEMO: Pick<Event, 'id' | 'name' | 'start_time'>[] = [
  { id: '__demo_1', start_time: '2026-06-01T16:30:00.000Z', name: 'Ceremony' },
  { id: '__demo_2', start_time: '2026-06-01T17:00:00.000Z', name: 'Cocktails' },
  { id: '__demo_3', start_time: '2026-06-01T17:45:00.000Z', name: 'Dinner' },
  { id: '__demo_4', start_time: '2026-06-01T20:00:00.000Z', name: 'Dancing' },
];

export function ScheduleSection({
  theme: t,
  events,
  weddingDate,
  venueName,
  venueAddress,
  showPlaceholders = false,
}: Props) {
  const usingDemo = events.length === 0 && showPlaceholders;
  const rows: Pick<Event, 'id' | 'name' | 'start_time'>[] = events.length > 0 ? events : usingDemo ? SCHEDULE_DEMO : [];

  if (rows.length === 0 && !showPlaceholders) return null;

  const hasVenueInfo = weddingDate || venueName;

  return (
    <section style={{
      position: 'relative',
      background: CREAM_PAPER,
      padding: 'clamp(64px, 14cqi, 120px) clamp(24px, 6cqi, 56px)',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      {/* Botanical decorations */}
      <RoseLine
        color={INK_ON_CREAM_3}
        size={160}
        style={{
          position: 'absolute',
          top: 'clamp(40px, 8cqi, 80px)',
          left: 'clamp(-20px, -2cqi, -8px)',
          width: 'clamp(100px, 24cqi, 180px)',
          height: 'auto',
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      />
      <ButterflyBloom
        color={INK_ON_CREAM_3}
        size={140}
        style={{
          position: 'absolute',
          bottom: 'clamp(40px, 8cqi, 80px)',
          right: 'clamp(-16px, -2cqi, -6px)',
          width: 'clamp(90px, 22cqi, 160px)',
          height: 'auto',
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      />

      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: 560,
        margin: '0 auto',
        textAlign: 'center',
      }}>
        {/* Heading */}
        <h2 style={{
          fontFamily: t.displayFont,
          fontSize: 'clamp(1.6rem, 5cqi + 0.4rem, 2.8rem)',
          fontWeight: 400,
          color: INK_ON_CREAM,
          margin: '0 0 clamp(16px, 4cqi, 28px)',
          lineHeight: 1.1,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          PROGRAM
        </h2>

        {/* Date & venue */}
        {hasVenueInfo && (
          <div style={{ marginBottom: 'clamp(28px, 7cqi, 44px)' }}>
            {weddingDate && (
              <p style={{
                fontFamily: t.displayFont,
                fontSize: 'clamp(13px, 3cqi, 15px)',
                fontWeight: 400,
                color: INK_ON_CREAM_2,
                margin: '0 0 4px',
                lineHeight: 1.5,
              }}>
                {formatDate(weddingDate)}
                {venueName ? ` at ${venueName}` : ''}
              </p>
            )}
            {!weddingDate && venueName && (
              <p style={{
                fontFamily: t.displayFont,
                fontSize: 'clamp(13px, 3cqi, 15px)',
                fontWeight: 400,
                color: INK_ON_CREAM_2,
                margin: 0,
                lineHeight: 1.5,
              }}>
                {venueName}
              </p>
            )}
          </div>
        )}

        {showPlaceholders && !hasVenueInfo && (
          <div style={{ marginBottom: 'clamp(28px, 7cqi, 44px)' }}>
            <LineHint theme={t} style={{ color: INK_ON_CREAM_3, textAlign: 'center' }}>
              Date & venue — set in Dashboard → Settings
            </LineHint>
          </div>
        )}

        {usingDemo && (
          <LineHint theme={t} style={{ marginBottom: 16, color: INK_ON_CREAM_3, textAlign: 'center' }}>
            Sample times — add your real schedule in Dashboard → Itinerary
          </LineHint>
        )}

        {/* Timeline */}
        <div style={{ borderTop: `1px solid ${RULE_ON_CREAM}`, textAlign: 'left' }}>
          {rows.map((ev) => (
            <div key={ev.id} style={{
              borderBottom: `1px solid ${RULE_ON_CREAM}`,
              padding: 'clamp(16px, 4.5cqi, 22px) 0',
              display: 'flex',
              alignItems: 'baseline',
              gap: 'clamp(12px, 4cqi, 24px)',
            }}>
              <span style={{
                fontFamily: t.displayFont,
                fontSize: 'clamp(12px, 3.2cqi, 14px)',
                fontWeight: 400,
                color: INK_ON_CREAM_3,
                minWidth: 'clamp(76px, 24cqi, 100px)',
                letterSpacing: '0.04em',
              }}>
                {formatTime(ev.start_time)}
              </span>
              <span style={{
                flex: 1,
                fontFamily: t.displayFont,
                fontSize: 'clamp(13px, 3.5cqi, 15px)',
                fontWeight: 400,
                color: usingDemo ? INK_ON_CREAM_3 : INK_ON_CREAM,
                letterSpacing: '0.02em',
                lineHeight: 1.45,
              }}>
                {ev.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
