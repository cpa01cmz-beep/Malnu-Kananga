import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Section from '../Section';

describe('Section', () => {
  it('renders with required props', () => {
    render(
      <Section id="test-section" title="Test Title">
        <p>Test content</p>
      </Section>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders with subtitle', () => {
    render(
      <Section
        id="test-section"
        title="Test Title"
        subtitle="Test subtitle"
      >
        <p>Test content</p>
      </Section>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test subtitle')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <Section
        id="test-section"
        title="Test Title"
        className="bg-gradient-to-b from-red-500 to-blue-500"
      >
        <p>Test content</p>
      </Section>
    );

    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-gradient-to-b', 'from-red-500', 'to-blue-500');
  });

  it('renders with badge', () => {
    const badge = <span className="px-4 py-2 rounded-full bg-primary-100">Badge</span>;
    render(
      <Section id="test-section" title="Test Title" badge={badge}>
        <p>Test content</p>
      </Section>
    );

    expect(screen.getByText('Badge')).toBeInTheDocument();
  });

  it('has correct ID attribute', () => {
    const { container } = render(
      <Section id="test-section" title="Test Title">
        <p>Test content</p>
      </Section>
    );

    const section = container.querySelector('section');
    expect(section).toHaveAttribute('id', 'test-section');
  });

  it('has correct section element', () => {
    const { container } = render(
      <Section id="test-section" title="Test Title">
        <p>Test content</p>
      </Section>
    );

    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  it('renders title with correct styling classes', () => {
    render(
      <Section id="test-section" title="Test Title">
        <p>Test content</p>
      </Section>
    );

    const title = screen.getByText('Test Title');
    expect(title).toHaveClass(
      'text-4xl',
      'sm:text-5xl',
      'md:text-6xl',
      'font-bold',
      'text-neutral-900',
      'dark:text-white',
      'tracking-tight',
      'mb-4'
    );
  });

  it('renders subtitle with correct styling classes', () => {
    render(
      <Section
        id="test-section"
        title="Test Title"
        subtitle="Test subtitle"
      >
        <p>Test content</p>
      </Section>
    );

    const subtitle = screen.getByText('Test subtitle');
    expect(subtitle).toHaveClass(
      'text-base',
      'sm:text-lg',
      'text-neutral-600',
      'dark:text-neutral-300',
      'max-w-2xl',
      'mx-auto',
      'leading-relaxed'
    );
  });

  it('has correct section padding classes', () => {
    const { container } = render(
      <Section id="test-section" title="Test Title">
        <p>Test content</p>
      </Section>
    );

    const section = container.querySelector('section');
    expect(section).toHaveClass('py-20', 'sm:py-24');
  });

  it('has correct container classes', () => {
    const { container } = render(
      <Section id="test-section" title="Test Title">
        <p>Test content</p>
      </Section>
    );

    const div = container.querySelector('.max-w-7xl');
    expect(div).toBeInTheDocument();
    expect(div).toHaveClass('mx-auto', 'px-4', 'sm:px-6', 'lg:px-8');
  });

  it('has animate-fade-in class on header', () => {
    const { container } = render(
      <Section id="test-section" title="Test Title">
        <p>Test content</p>
      </Section>
    );

    const header = container.querySelector('.text-center.mb-12.sm\\:mb-16');
    expect(header).toHaveClass('animate-fade-in');
  });

  it('has aria-labelledby attribute linking to heading', () => {
    const { container } = render(
      <Section id="test-section" title="Test Title">
        <p>Test content</p>
      </Section>
    );

    const section = container.querySelector('section');
    expect(section).toHaveAttribute('aria-labelledby', 'test-section-heading');
  });

  it('has correct heading ID attribute', () => {
    const { container } = render(
      <Section id="test-section" title="Test Title">
        <p>Test content</p>
      </Section>
    );

    const heading = container.querySelector('h2');
    expect(heading).toHaveAttribute('id', 'test-section-heading');
  });
});
