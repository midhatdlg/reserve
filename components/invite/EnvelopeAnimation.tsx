'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  children: React.ReactNode;
  bgColor?: string;
  initials?: string;
  storageKey: string;
  coupleName?: string;
}

type Stage = 'closed' | 'revealing' | 'done';

export function EnvelopeAnimation({ children, initials = '♥', storageKey, coupleName, bgColor = '#F5F0E8' }: Props) {
  const [stage, setStage] = useState<Stage>('closed');
  const [showSkip, setShowSkip] = useState(false);
  const [mounted, setMounted] = useState(false);
  const skipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem(`tll-envelope-${storageKey}`) === 'seen') {
      setStage('done');
    } else {
      skipTimer.current = setTimeout(() => setShowSkip(true), 500);
      // Auto-start the typographic reveal after a brief pause
      setTimeout(() => {
        setStage('revealing');
        setTimeout(() => {
          setStage('done');
          localStorage.setItem(`tll-envelope-${storageKey}`, 'seen');
        }, 2800);
      }, 800);
    }
    return () => {
      if (skipTimer.current) clearTimeout(skipTimer.current);
    };
  }, [storageKey]);

  function skip() {
    setStage('done');
    localStorage.setItem(`tll-envelope-${storageKey}`, 'seen');
  }

  if (!mounted) return null;

  // Format initials: "O & R" from "Olivia & Rafael" or use provided
  const displayInitials = initials === '♥' && coupleName
    ? coupleName.split(' & ').map((n) => n.trim().charAt(0).toUpperCase()).join(' & ')
    : initials;

  return (
    <>
      {/* Invite content */}
      <div style={{ opacity: stage === 'done' ? 1 : 0, transition: 'opacity 0.6s ease' }}>
        {children}
      </div>

      {/* Typographic reveal overlay */}
      <AnimatePresence>
        {stage !== 'done' && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              inset: 0,
              background: bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              zIndex: 50,
              userSelect: 'none',
            }}
          >
            {/* Initials */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 16,
                letterSpacing: '4px',
                color: '#8B7355',
                margin: '0 0 20px',
              }}
            >
              {displayInitials}
            </motion.p>

            {/* Hairline */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
              style={{
                width: 48,
                height: 1,
                background: '#8B7355',
                marginBottom: 28,
                opacity: 0.5,
              }}
            />

            {/* Couple name */}
            {coupleName && (
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9, ease: 'easeOut' }}
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: 36,
                  fontWeight: 400,
                  color: '#2C2C2C',
                  margin: '0 0 4px',
                  textAlign: 'center',
                  lineHeight: 1.3,
                }}
              >
                {coupleName.split(' & ').map((name, i, arr) => (
                  <span key={i}>
                    {name.trim()}
                    {i < arr.length - 1 && (
                      <>
                        <br />
                        <span style={{
                          fontFamily: 'var(--font-cormorant)',
                          fontSize: 18,
                          fontStyle: 'italic',
                          color: '#8B7355',
                        }}>
                          &amp;
                        </span>
                        <br />
                      </>
                    )}
                  </span>
                ))}
              </motion.h1>
            )}

            {/* Skip button */}
            <AnimatePresence>
              {showSkip && stage === 'closed' && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={(e) => { e.stopPropagation(); skip(); }}
                  style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    background: 'none',
                    border: 'none',
                    color: '#9E9890',
                    fontFamily: 'var(--font-montserrat)',
                    fontSize: 11,
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    padding: '8px 12px',
                  }}
                >
                  SKIP
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
