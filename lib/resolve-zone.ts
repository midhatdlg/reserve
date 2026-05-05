/**
 * Resolve template variables in a design zone's content string.
 * Shared by InviteHero (rendering) and ZoneEditor (preview).
 */
export function resolveZoneContent(
  content: string,
  wedding: { title: string | null; wedding_date: string | null; venue_name: string | null },
  invite: { guest_name: string } | null
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
    .replace(/\{\{guest_name\}\}/g, invite?.guest_name || 'Guest');
}
