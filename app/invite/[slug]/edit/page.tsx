import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { createPublicClient } from '@/lib/supabase/public';
import { createAdminClient } from '@/lib/supabase/admin';
import { loadInvitePageData } from '@/lib/invite-page';
import { readRsvpSession } from '@/lib/session';
import { RsvpForm } from '@/components/invite/RsvpForm';
import type { TemplateTheme } from '@/lib/template-theme';
import { theme as monochromeTheme } from '@/components/invite/templates/monochrome/shared';
import { theme as sageTheme } from '@/components/invite/templates/sage/shared';

const TEMPLATE_THEME_MAP: Record<string, TemplateTheme> = {
  monochrome: monochromeTheme,
  'civil-classic': monochromeTheme,
  sage: sageTheme,
};

const EDIT_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Montserrat:wght@300;400;500;600&display=swap';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function InviteEditPage({ params }: Props) {
  const { slug } = await params;
  const returnPath = `/invite/${encodeURIComponent(slug)}`;

  const cookieStore = await cookies();
  const session = await readRsvpSession(cookieStore);
  if (!session) {
    redirect(returnPath);
  }

  const data = await loadInvitePageData(
    createPublicClient(),
    slug,
    session.inviteId,
    createAdminClient()
  );
  if (!data) {
    notFound();
  }

  const { wedding, invite, rsvps } = data;
  if (!invite) {
    redirect(returnPath);
  }

  const editTheme = TEMPLATE_THEME_MAP[wedding.template_id] ?? monochromeTheme;

  return (
    <>
      <link rel="stylesheet" href={editTheme.fontsUrl ?? EDIT_FONTS_URL} />
      {editTheme.fontFaceCSS && <style dangerouslySetInnerHTML={{ __html: editTheme.fontFaceCSS }} />}
      <div style={{ minHeight: '100svh', width: '100%', background: editTheme.pageBg ?? '#FFFFFF' }}>
        <main
          style={{
            maxWidth: 520,
            margin: '0 auto',
            padding: '100px 28px 140px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <RsvpForm
            invite={invite}
            existingRsvps={rsvps}
            slug={slug}
            mealOptions={(wedding.settings as Record<string, unknown>)?.meal_selection_enabled === false ? [] : wedding.meal_options}
            theme={editTheme}
          />
        </main>
      </div>
    </>
  );
}
