import type { Wedding, Event, Invite, Rsvp, Photo, Question } from '@/types';
import { INVITE_ROOT_STYLE } from '@/lib/template-theme';
import { theme, FONTS_URL, DISPLAY_FONT_FACE } from '../monochrome/shared';
import { HeroSection } from '../../sections/HeroSection';
import { LoveStorySection } from '../../sections/LoveStorySection';
import { StoryCeremonyBridgeSection } from '../../sections/StoryCeremonyBridgeSection';
import { CeremonySection } from '../../sections/CeremonySection';
import { ScheduleSection } from '../../sections/ScheduleSection';
import { GiftSection } from '../../sections/GiftSection';
import { FaqSection } from '../../sections/FaqSection';
import { FooterSection } from '../../sections/FooterSection';
import { RsvpSection } from '../../sections/RsvpSection';

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

export function CivilClassicInvite(props: Props) {
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

  const showStoryBridge = blocks.includes('story_bridge');
  const bridgePlaceholders = showPlaceholders && showStoryBridge;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: DISPLAY_FONT_FACE }} />
      <link rel="stylesheet" href={FONTS_URL} />
      <div
        style={{
          ...INVITE_ROOT_STYLE,
          background: theme.pageBg,
          ...(previewHeroViewportFill ? { minHeight: 'auto' } : {}),
        }}
      >
        <HeroSection
          theme={theme}
          title={wedding.title}
          weddingDate={wedding.wedding_date}
          hashtag={tc.hashtag}
          heroPhoto={heroPhoto}
          textPosition={heroLayout?.textPosition}
          overlayOpacity={heroLayout?.overlayOpacity}
          fadeInText={heroLayout?.fadeInText}
          heroFontSize={heroFontSize}
          showPlaceholders={showPlaceholders}
          previewHeroViewportFill={previewHeroViewportFill}
        />

        {blocks.includes('story') && (
          <LoveStorySection
            theme={theme}
            heading={tc.love_story_heading}
            text={tc.love_story_text}
            photo={storyPhoto}
            showPlaceholders={showPlaceholders}
          />
        )}

        {showStoryBridge && (
          <StoryCeremonyBridgeSection
            theme={theme}
            photo1={storyCeremonyPhoto1}
            photo2={storyCeremonyPhoto2}
            showPlaceholders={bridgePlaceholders}
          />
        )}

        {blocks.includes('ceremony') && (
          <CeremonySection
            theme={theme}
            venueName={wedding.venue_name}
            venueAddress={wedding.venue_address}
            dressCode={tc.ceremony_dress_code}
            postCeremony={tc.ceremony_post_text}
            showPlaceholders={showPlaceholders}
          />
        )}

        {blocks.includes('itinerary') && (
          <ScheduleSection
            theme={theme}
            events={events}
            photo={schedulePhoto}
            showPlaceholders={showPlaceholders}
          />
        )}

        {blocks.includes('registry') && (
          <GiftSection
            theme={theme}
            giftText={tc.gift_text}
            giftQrUrl={tc.gift_qr_url}
            contactEmail={tc.contact_email}
            showPlaceholders={showPlaceholders}
          />
        )}

        {blocks.includes('qna') && (
          <FaqSection
            theme={theme}
            questions={questions}
            photo={faqPhoto}
            showPlaceholders={showPlaceholders}
          />
        )}

        {!showPlaceholders && (
          <RsvpSection
            theme={theme}
            invite={invite}
            rsvps={rsvps}
            slug={slug}
            mealOptions={(wedding.settings as Record<string, unknown>)?.meal_selection_enabled === false ? [] : wedding.meal_options}
            showLookup={!invite && !wedding.save_the_date_mode}
          />
        )}

        <FooterSection
          theme={theme}
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
