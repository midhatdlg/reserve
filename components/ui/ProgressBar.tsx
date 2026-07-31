const STEPS = ['Details', 'Launch'];

interface ProgressBarProps {
  currentStep: number; // 1-based
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0,
      padding: '16px 24px',
    }}>
      {STEPS.map((label, i) => {
        const step = i + 1;
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;

        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Connector line before dot (skip first) */}
            {i > 0 && (
              <div style={{
                width: 40,
                height: 2,
                background: isCompleted || isActive ? 'var(--sage)' : 'var(--border)',
                transition: 'background 0.2s',
              }} />
            )}

            {/* Step dot + label */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: `2px solid ${isCompleted || isActive ? 'var(--sage)' : 'var(--border)'}`,
                background: isCompleted ? 'var(--sage)' : isActive ? 'var(--sage-dim)' : 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
                {isCompleted ? (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span style={{
                    fontFamily: 'var(--font-montserrat)',
                    fontSize: 9,
                    fontWeight: 600,
                    color: isActive ? 'var(--sage)' : 'var(--text-tertiary)',
                  }}>
                    {step}
                  </span>
                )}
              </div>
              <span style={{
                fontFamily: 'var(--font-montserrat)',
                fontSize: 10,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--sage)' : isCompleted ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                letterSpacing: '0.3px',
                whiteSpace: 'nowrap',
              }}>
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
