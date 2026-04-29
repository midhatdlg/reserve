'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LookupModal } from './LookupModal';
import { MessageCoupleModal } from './MessageCoupleModal';

interface Props {
  slug: string;
}

/**
 * Client-only shell that shows the name-match dialog to first-time visitors.
 * Rendered by the server page only when there is no valid RSVP session
 * cookie, so SSR output stays minimal and unauthenticated.
 */
export function LookupGate({ slug }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<'lookup' | 'message'>('lookup');
  const [prefillName, setPrefillName] = useState('');
  const [prefillEmail, setPrefillEmail] = useState('');

  if (mode === 'message') {
    return (
      <MessageCoupleModal
        slug={slug}
        initialName={prefillName}
        initialEmail={prefillEmail}
        onCancel={() => setMode('lookup')}
        onSent={() => setMode('lookup')}
      />
    );
  }

  return (
    <LookupModal
      slug={slug}
      onMatched={() => router.refresh()}
      onMessageCouple={(name, email) => {
        setPrefillName(name);
        setPrefillEmail(email);
        setMode('message');
      }}
    />
  );
}
