/**
 * SageInvite — sage template. All section components used here live under
 * `templates/sage/` (or `templates/sage/sections/`).
 */

import type { Wedding, Event, Invite, Rsvp, Photo, Question } from '@/types';
import { INVITE_ROOT_STYLE } from '@/lib/template-theme';
import { theme, FONTS_URL } from './shared';

import { SageHero } from './SageHero';
import { SageLoveStory } from './SageLoveStory';
import { SageFaq } from './SageFaq';
import { SageFooter } from './SageFooter';

import { FullBleedPhotoSection } from '../monochrome/sections/FullBleedPhotoSection';
import { ScheduleSection } from './sections/ScheduleSection';
import { RsvpSection } from './sections/RsvpSection';

interface Props {
  wedding: Wedding;
  events: Event[];
  invite: Invite | null;
  rsvps: Rsvp[];
  photos: Photo[];
  questions: Question[];
  slug: string;
  showPlaceholders?: boolean;
  previewHeroViewportFill?: boolean;
}

export function SageInvite(props: Props) {
  const {
    wedding,
    events,
    invite,
    rsvps,
    photos,
    questions,
    slug,
    showPlaceholders = false,
    previewHeroViewportFill = false,
  } = props;
  const blocks = wedding.selected_blocks ?? [];
  const tc = wedding.template_content ?? {};
  const heroLayout = wedding.template_overrides?.hero;
  const heroFontSize = wedding.template_overrides?.couple_names?.fontSize;

  const heroPhoto = photos.find((p) => p.role === 'hero');
  const storyPhoto = photos.find((p) => p.role === 'love_story');
  const storyCeremonyPhoto1 = photos.find((p) => p.role === 'story_ceremony_1');
  const storyCeremonyPhoto2 = photos.find((p) => p.role === 'story_ceremony_2');
  const schedulePhoto = photos.find((p) => p.role === 'schedule');
  const faqPhoto = photos.find((p) => p.role === 'faq');

  const [n1, n2] = (wedding.title ?? '').split(' & ');

  return (
    <>
      <link rel="stylesheet" href={FONTS_URL} />
      <div
        style={{
          ...INVITE_ROOT_STYLE,
          background: theme.pageBg,
          ...(previewHeroViewportFill ? { minHeight: 'auto' } : {}),
        }}
      >
        <SageHero
          theme={theme}
          title={wedding.title}
          heroTagline={tc.hero_tagline}
          heroPhoto={heroPhoto}
          textPosition={heroLayout?.textPosition}
          overlayOpacity={heroLayout?.overlayOpacity}
          fadeInText={heroLayout?.fadeInText}
          heroFontSize={heroFontSize}
          showPlaceholders={showPlaceholders}
          previewHeroViewportFill={previewHeroViewportFill}
          slug={slug}
        />

        {blocks.includes('story') && (
          <SageLoveStory
            theme={theme}
            heading={tc.love_story_heading}
            text={tc.love_story_text}
            storyPhoto={storyPhoto}
            bridgePhoto1={storyCeremonyPhoto1}
            bridgePhoto2={storyCeremonyPhoto2}
            showPlaceholders={showPlaceholders}
          />
        )}

        <FullBleedPhotoSection
          theme={theme}
          photo={schedulePhoto}
          showPlaceholders={showPlaceholders}
          placeholderLabel="Full-width couple photo — Design → Photos"
        />

        {blocks.includes('itinerary') && (
          <ScheduleSection
            theme={theme}
            events={events}
            weddingDate={wedding.wedding_date}
            venueName={wedding.venue_name}
            venueAddress={wedding.venue_address}
            showPlaceholders={showPlaceholders}
          />
        )}

        {blocks.includes('qna') && (
          <SageFaq
            theme={theme}
            questions={questions}
            photo={faqPhoto}
            showPlaceholders={showPlaceholders}
          />
        )}

        {showPlaceholders ? (
          <section
            id="rsvp"
            style={{
              background: theme.pageBg,
              padding: 'clamp(48px, 14cqi, 110px) clamp(16px, 5cqi, 40px)',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div style={{
              width: '100%',
              maxWidth: 440,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
            }}>
              <p style={{
                fontFamily: theme.bodyFont,
                fontSize: 10,
                letterSpacing: '0.36em',
                fontWeight: 500,
                textTransform: 'uppercase',
                color: theme.ink3,
                margin: 0,
              }}>
                RSVP
              </p>
              <h2 style={{
                fontFamily: theme.displayFont,
                fontWeight: 400,
                fontSize: 'clamp(26px, 5vw, 36px)',
                lineHeight: 1.2,
                color: theme.ink,
                margin: 0,
              }}>
                The favour of a reply
              </h2>
              <p style={{
                fontFamily: theme.displayFont,
                fontStyle: 'italic',
                fontSize: 15,
                color: theme.ink2,
                margin: 0,
              }}>
                is requested
              </p>
              <div style={{ width: 60, height: 1, background: theme.ink, opacity: 0.4, margin: '12px 0' }} />
              <div style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: 32,
                border: `1px solid ${theme.ruleSoft}`,
                background: 'transparent',
                fontFamily: theme.displayFont,
                fontSize: 14,
                fontStyle: 'italic',
                color: theme.ink3,
                textAlign: 'center',
              }}>
                Joyfully accepts
              </div>
              <div style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: 32,
                border: `1px solid ${theme.ruleSoft}`,
                background: 'transparent',
                fontFamily: theme.displayFont,
                fontSize: 14,
                fontStyle: 'italic',
                color: theme.ink3,
                textAlign: 'center',
              }}>
                Regretfully declines
              </div>
            </div>
          </section>
        ) : (
          <RsvpSection
            theme={theme}
            invite={invite}
            rsvps={rsvps}
            slug={slug}
            mealOptions={(wedding.settings as Record<string, unknown>)?.meal_selection_enabled === false ? [] : wedding.meal_options}
            showLookup={!invite && !wedding.save_the_date_mode}
          />
        )}

        <SageFooter
          theme={theme}
          weddingDate={wedding.wedding_date}
          contactEmail={tc.contact_email}
          contactPhone={tc.contact_phone}
          contactName1={n1?.trim()}
          contactName2={n2?.trim()}
          rsvpUrl={`/invite/${slug}`}
          showPlaceholders={showPlaceholders}
        />
      </div>
    </>
  );
}
