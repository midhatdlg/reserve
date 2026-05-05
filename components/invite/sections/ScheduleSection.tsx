import type { Event, Photo } from '@/types';
import type { TemplateTheme } from '@/lib/template-theme';
import { FS_DISPLAY_LG } from '@/lib/template-theme';
import { LineHint, PhotoDropHint } from './Placeholders';

interface Props {
  theme: TemplateTheme;
  events: Event[];
  photo: Photo | undefined;
  showPlaceholders?: boolean;
}

function formatTime(timeStr: string | null): string {
  if (!timeStr) return '';
  const d = new Date(timeStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase();
}

const SCHEDULE_DEMO: Pick<Event, 'id' | 'name' | 'start_time'>[] = [
  { id: '__schedule_demo_1', start_time: '2026-06-01T14:00:00.000Z', name: 'Arrival & Welcome' },
  { id: '__schedule_demo_2', start_time: '2026-06-01T14:30:00.000Z', name: 'Ceremony' },
  { id: '__schedule_demo_3', start_time: '2026-06-01T15:30:00.000Z', name: 'Photo session' },
];

function buildScheduleCss(t: TemplateTheme): string {
  return `
.tl-schedule-root {
  background: ${t.sectionDarkBg};
  color: ${t.textOnDark};
  width: 100%;
  box-sizing: border-box;
}
.tl-schedule-inner {
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
.tl-schedule-text {
  padding: clamp(48px, 14cqi, 110px) clamp(16px, 5cqi, 40px);
  min-height: 88svh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.tl-schedule-photo-wrap {
  width: 100%;
  min-height: 82svh;
  position: relative;
  line-height: 0;
}
.tl-schedule-photo-wrap img {
  width: 100%;
  height: 100%;
  min-height: 82svh;
  object-fit: cover;
  display: block;
  filter: ${t.photoFilter};
}
@container (min-width: 720px) {
  .tl-schedule-inner {
    flex-direction: row;
    align-items: stretch;
    min-height: 88svh;
    gap: clamp(24px, 6cqi, 56px);
  }
  .tl-schedule-text {
    flex: 1 1 0;
    min-width: 0;
    min-height: 0;
    justify-content: center;
  }
  .tl-schedule-photo-wrap {
    flex: 1 1 0;
    min-width: 0;
    min-height: 0;
  }
  .tl-schedule-photo-wrap img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    min-height: 100%;
  }
}
`;
}

export function ScheduleSection({ theme: t, events, photo, showPlaceholders = false }: Props) {
  const usingDemo = events.length === 0 && showPlaceholders;
  const rows: Pick<Event, 'id' | 'name' | 'start_time'>[] = events.length > 0 ? events : usingDemo ? SCHEDULE_DEMO : [];

  if (rows.length === 0) return null;

  return (
    <section className="tl-schedule-root">
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: buildScheduleCss(t) }} />
      <div className="tl-schedule-inner">
        <div className="tl-schedule-text">
          <h2 style={{
            fontFamily: t.displayFont,
            fontSize: FS_DISPLAY_LG,
            fontWeight: 400,
            color: t.textOnDark,
            margin: '0 0 clamp(28px, 8cqi, 48px)',
            lineHeight: 1.05,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            SCHEDULE<br />OF EVENTS
          </h2>

          {usingDemo && (
            <LineHint theme={t} surface="dark" style={{ marginTop: -18, marginBottom: 20 }}>
              Sample times — add your real schedule in Dashboard → Itinerary
            </LineHint>
          )}

          <div style={{ borderTop: `1px solid ${t.ruleOnDark}` }}>
            {rows.map((ev) => (
              <div key={ev.id} style={{
                borderBottom: `1px solid ${t.ruleOnDark}`,
                padding: 'clamp(16px, 4.5cqi, 22px) 0',
                display: 'flex',
                alignItems: 'baseline',
                gap: 'clamp(12px, 4cqi, 24px)',
              }}>
                <span style={{
                  fontFamily: t.displayFont,
                  fontSize: 'clamp(12px, 3.2cqi, 14px)',
                  fontWeight: 400,
                  color: t.textOnDarkMuted,
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
                  color: usingDemo ? t.textOnDarkMuted : t.textOnDark,
                  letterSpacing: '0.02em',
                  lineHeight: 1.45,
                }}>
                  {ev.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {photo ? (
          <div className="tl-schedule-photo-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.image_url} alt="" />
          </div>
        ) : showPlaceholders ? (
          <div
            className="tl-schedule-photo-wrap"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'clamp(16px, 5cqi, 32px)',
              boxSizing: 'border-box',
            }}
          >
            <PhotoDropHint
              theme={t}
              surface="dark"
              label="Schedule photo — Design → Photos"
              style={{ width: '100%', maxWidth: 420, minHeight: 'min(60svh, 360px)' }}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
