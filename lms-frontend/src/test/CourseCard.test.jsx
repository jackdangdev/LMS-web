import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { CourseCard } from '../components/CourseCard';

const course = {
  _id: '65f1c0ffee1234567890abcd',
  code: 'WEB-101',
  title: 'Modern Web Development with React',
  description: 'Build production interfaces with React 18, Vite and Tailwind CSS.',
  category: 'Web Development',
  level: 'beginner',
  price: 149,
  enrollmentCount: 128,
  lessons: [{ _id: 'l1' }, { _id: 'l2' }, { _id: 'l3' }],
  instructor: { name: 'Lena Osei' },
};

const renderCard = (overrides = {}) =>
  render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <CourseCard course={{ ...course, ...overrides }} />
    </MemoryRouter>
  );

describe('<CourseCard />', () => {
  it('shows the course title, code, category, level and lesson count', () => {
    renderCard();
    expect(screen.getByText('Modern Web Development with React')).toBeInTheDocument();
    expect(screen.getByText('WEB-101')).toBeInTheDocument();
    expect(screen.getByText('Web Development')).toBeInTheDocument();
    expect(screen.getByText('beginner')).toBeInTheDocument();
    expect(screen.getByText('3 lessons')).toBeInTheDocument();
  });

  it('links the title and cover to the course detail route', () => {
    renderCard();
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(2);
    links.forEach((link) =>
      expect(link).toHaveAttribute('href', `/courses/${course._id}`)
    );
  });

  it('formats a paid price and an enrolled badge', () => {
    renderCard({ enrolled: true });
    expect(screen.getByText('$149')).toBeInTheDocument();
    expect(screen.getByText('Enrolled')).toBeInTheDocument();
  });

  it('shows "Free" for a zero-priced course', () => {
    renderCard({ price: 0 });
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('falls back to the faculty label when no instructor is attached', () => {
    renderCard({ instructor: null });
    expect(screen.getByText('EduNova faculty')).toBeInTheDocument();
  });

  it('renders the cover image when the course provides one', () => {
    const { container } = renderCard({ coverImageUrl: '/static/images/courses/web-101.jpg' });
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      '/static/images/courses/web-101.jpg'
    );
  });
});
