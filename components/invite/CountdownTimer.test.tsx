import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CountdownTimer } from './CountdownTimer';

describe('<CountdownTimer />', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  function readCounter() {
    const labels = ['Days', 'Hours', 'Min', 'Sec'] as const;
    const out: Record<(typeof labels)[number], string> = { Days: '', Hours: '', Min: '', Sec: '' };
    for (const label of labels) {
      const node = screen.getByText(label).previousElementSibling;
      out[label] = (node?.textContent ?? '').trim();
    }
    return out;
  }

  it('renders the time remaining in the target timezone', () => {
    // Fix "now" to 2026-05-01T12:00:00Z. Target is 2026-05-01 14:00 BST
    // (Europe/London), which is 13:00Z — exactly 1 hour away.
    vi.setSystemTime(new Date('2026-05-01T12:00:00.000Z'));
    render(<CountdownTimer targetDate="2026-05-01" startTime="14:00" timezone="Europe/London" />);
    expect(readCounter()).toEqual({ Days: '00', Hours: '01', Min: '00', Sec: '00' });
  });

  it('counts the same UTC delta regardless of viewer timezone', () => {
    // Target: 2026-05-01 14:00 UTC. "Now" set so 10m remain.
    vi.setSystemTime(new Date('2026-05-01T13:50:00.000Z'));
    render(<CountdownTimer targetDate="2026-05-01" startTime="14:00" timezone="UTC" />);
    expect(readCounter()).toEqual({ Days: '00', Hours: '00', Min: '10', Sec: '00' });
  });

  it('shows the past-event copy when target has elapsed', () => {
    vi.setSystemTime(new Date('2099-01-01T00:00:00.000Z'));
    render(<CountdownTimer targetDate="2026-05-01" startTime="14:00" timezone="UTC" />);
    expect(screen.getByText(/celebration has begun/i)).toBeInTheDocument();
  });

  it('ticks every second', () => {
    vi.setSystemTime(new Date('2026-05-01T13:59:50.000Z'));
    render(<CountdownTimer targetDate="2026-05-01" startTime="14:00" timezone="UTC" />);
    expect(readCounter().Sec).toBe('10');

    act(() => { vi.advanceTimersByTime(3000); });
    expect(readCounter().Sec).toBe('07');
  });

  it('defaults to 14:00 when no startTime is given', () => {
    vi.setSystemTime(new Date('2026-05-01T13:00:00.000Z'));
    render(<CountdownTimer targetDate="2026-05-01" timezone="UTC" />);
    expect(readCounter()).toEqual({ Days: '00', Hours: '01', Min: '00', Sec: '00' });
  });
});
