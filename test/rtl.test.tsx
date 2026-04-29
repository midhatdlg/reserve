import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

function Counter() {
  const [n, setN] = useState(0);
  return (
    <div>
      <p data-testid="count">{n}</p>
      <button onClick={() => setN((v) => v + 1)}>increment</button>
    </div>
  );
}

describe('React Testing Library + user-event', () => {
  it('renders and reacts to clicks', async () => {
    render(<Counter />);
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    await userEvent.click(screen.getByRole('button', { name: /increment/i }));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });
});
