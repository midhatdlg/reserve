'use client';

export function BlobBackground() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* Blob 1 — top left */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '55vw',
        height: '55vw',
        borderRadius: '50%',
        background: 'var(--blob1)',
        filter: 'blur(60px)',
        transform: 'translate(-20%, -20%)',
      }} />
      {/* Blob 2 — bottom right */}
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '50vw',
        height: '50vw',
        borderRadius: '50%',
        background: 'var(--blob2)',
        filter: 'blur(55px)',
        transform: 'translate(20%, 20%)',
      }} />
      {/* Blob 3 — center */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '40%',
        width: '40vw',
        height: '40vw',
        borderRadius: '50%',
        background: 'var(--blob3)',
        filter: 'blur(65px)',
        transform: 'translate(-50%, -50%)',
      }} />
    </div>
  );
}
