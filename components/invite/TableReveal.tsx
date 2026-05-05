import type { Invite } from '@/types';

interface Props {
  invite: Invite;
}

export function TableReveal({ invite }: Props) {
  if (!invite.table_number) return null;

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: 13,
        letterSpacing: '3px',
        color: '#1A1A1A',
        textTransform: 'uppercase',
        margin: '0 0 16px',
      }}>
        Your Seat
      </p>

      <div style={{
        display: 'inline-block',
        background: 'rgba(26,26,26,0.04)',
        border: '1px solid rgba(26,26,26,0.15)',
        borderRadius: 16,
        padding: '24px 40px',
      }}>
        <p style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 13,
          letterSpacing: '2px',
          color: '#9E9E9E',
          textTransform: 'uppercase',
          margin: '0 0 8px',
        }}>
          Table
        </p>
        <p style={{
          fontFamily: 'NewYork, Georgia, serif',
          fontSize: 56,
          color: '#1A1A1A',
          margin: 0,
          lineHeight: 1,
        }}>
          {invite.table_number}
        </p>
        {invite.table_name && (
          <p style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 15,
            color: '#1A1A1A',
            margin: '10px 0 0',
            fontStyle: 'italic',
          }}>
            {invite.table_name}
          </p>
        )}
      </div>
    </div>
  );
}
