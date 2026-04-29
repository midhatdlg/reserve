import { Resend } from 'resend';

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error('RESEND_API_KEY is not set');
    _resend = new Resend(key);
  }
  return _resend;
}

export const FROM_ADDRESS = process.env.RESEND_FROM ?? 'Reserve <invites@thelovelist.app>';

interface ReminderInput {
  to: string;
  guestName: string;
  weddingTitle: string;
  weddingDate: string;        // formatted date string
  daysAway: number;
  inviteUrl: string;
}

export async function sendRsvpReminder(input: ReminderInput) {
  const { to, guestName, weddingTitle, weddingDate, daysAway, inviteUrl } = input;
  const subject = `${weddingTitle} — RSVP reminder (${daysAway} days)`;
  const html = `
<!doctype html><html><body style="font-family:Georgia,serif;background:#FAFAFA;padding:32px;">
  <div style="max-width:480px;margin:0 auto;background:#FFFFFF;border:1px solid #E0E0E0;border-radius:14px;padding:32px;">
    <p style="font-size:11px;letter-spacing:3px;color:#9E9E9E;text-transform:uppercase;margin:0 0 16px;">Friendly Reminder</p>
    <h1 style="font-size:22px;color:#1A1A1A;margin:0 0 12px;">Hi ${guestName},</h1>
    <p style="font-size:15px;color:#5C5C5C;line-height:1.6;margin:0 0 12px;">
      We're so excited about <strong>${weddingTitle}</strong> on ${weddingDate} — just <strong>${daysAway} days</strong> away!
    </p>
    <p style="font-size:15px;color:#5C5C5C;line-height:1.6;margin:0 0 24px;">
      We haven't received your RSVP yet. Could you take a moment to let us know if you can join us?
    </p>
    <a href="${inviteUrl}" style="display:inline-block;background:#1A1A1A;color:#FFFFFF;padding:14px 28px;text-decoration:none;border-radius:8px;font-size:13px;letter-spacing:2px;text-transform:uppercase;">RSVP Now</a>
    <p style="font-size:12px;color:#9E9E9E;margin:24px 0 0;">With love ❤️</p>
  </div>
</body></html>`;

  return getResend().emails.send({ from: FROM_ADDRESS, to, subject, html });
}

interface MessageCoupleInput {
  to: string;            // the couple's email (usually couples.email)
  weddingTitle: string;
  guestName: string;
  guestEmail: string | null;
  message: string;
  dashboardUrl: string;
}

export async function sendMessageCouple(input: MessageCoupleInput) {
  const { to, weddingTitle, guestName, guestEmail, message, dashboardUrl } = input;
  const subject = `New invite request for ${weddingTitle}`;
  const safeMessage = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');
  const replyTo = guestEmail ?? undefined;
  const html = `
<!doctype html><html><body style="font-family:Georgia,serif;background:#FAFAFA;padding:32px;">
  <div style="max-width:520px;margin:0 auto;background:#FFFFFF;border:1px solid #E0E0E0;border-radius:14px;padding:32px;">
    <p style="font-size:11px;letter-spacing:3px;color:#9E9E9E;text-transform:uppercase;margin:0 0 16px;">New Message</p>
    <h1 style="font-size:20px;color:#1A1A1A;margin:0 0 12px;">Someone has asked to join ${weddingTitle}</h1>
    <p style="font-size:14px;color:#5C5C5C;margin:0 0 6px;"><strong>From:</strong> ${guestName}${guestEmail ? ` &lt;${guestEmail}&gt;` : ''}</p>
    <blockquote style="margin:16px 0;padding:12px 16px;border-left:3px solid #DADADA;color:#3A3A3A;font-size:15px;line-height:1.5;">
      ${safeMessage}
    </blockquote>
    <a href="${dashboardUrl}" style="display:inline-block;background:#1A1A1A;color:#FFFFFF;padding:12px 24px;text-decoration:none;border-radius:8px;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Open dashboard</a>
  </div>
</body></html>`;

  return getResend().emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    html,
    ...(replyTo ? { reply_to: replyTo } : {}),
  });
}
