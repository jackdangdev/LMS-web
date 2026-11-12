import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Avatar, Badge, Button, Field, ProgressBar, Spinner } from '../components/ui';

describe('<Button />', () => {
  it('renders its label and fires onClick once', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Enrol now</Button>);
    fireEvent.click(screen.getByRole('button', { name: /enrol now/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled and shows a spinner while loading', () => {
    render(<Button loading>Saving</Button>);
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('applies the danger variant classes', () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole('button', { name: /delete/i }).className).toContain('bg-rose-600');
  });
});

describe('<Avatar />', () => {
  it('falls back to initials when no image is supplied', () => {
    render(<Avatar name="Mia Chen" />);
    expect(screen.getByText('MC')).toBeInTheDocument();
  });

  it('uses the image and swaps to initials if it fails to load', () => {
    render(<Avatar name="Noah Patel" src="/static/avatars/noah.jpg" />);
    const img = screen.getByRole('img', { name: 'Noah Patel' });
    fireEvent.error(img);
    expect(screen.getByText('NP')).toBeInTheDocument();
  });
});

describe('<ProgressBar />', () => {
  it('clamps the fill width between 0 and 100 percent', () => {
    const { container, rerender } = render(<ProgressBar value={140} />);
    const fill = () => container.firstChild.firstChild;
    expect(fill().style.width).toBe('100%');

    rerender(<ProgressBar value={-20} />);
    expect(fill().style.width).toBe('0%');
  });
});

describe('<Field />', () => {
  it('shows the error instead of the hint when validation fails', () => {
    render(
      <Field label="Email" hint="We never share it" error="Email is required">
        <input aria-label="Email" />
      </Field>
    );
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.queryByText('We never share it')).toBeNull();
  });
});

describe('presentational atoms', () => {
  it('renders a badge label', () => {
    render(<Badge>Beginner</Badge>);
    expect(screen.getByText('Beginner')).toBeInTheDocument();
  });

  it('marks the spinner as decorative for screen readers', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });
});
