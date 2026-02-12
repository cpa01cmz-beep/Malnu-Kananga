import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnimatedCounter from '../AnimatedCounter';

describe('AnimatedCounter Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<AnimatedCounter value={100} autoStart={false} />);
      const counter = screen.getByText('100');
      expect(counter).toBeInTheDocument();
    });

    it('renders with prefix', () => {
      render(<AnimatedCounter value={100} prefix="$" autoStart={false} />);
      const counter = screen.getByText('$100');
      expect(counter).toBeInTheDocument();
    });

    it('renders with suffix', () => {
      render(<AnimatedCounter value={100} suffix=" students" autoStart={false} />);
      const counter = screen.getByText('100 students');
      expect(counter).toBeInTheDocument();
    });

    it('renders with both prefix and suffix', () => {
      render(<AnimatedCounter value={50} prefix="+" suffix="%" autoStart={false} />);
      const counter = screen.getByText('+50%');
      expect(counter).toBeInTheDocument();
    });

    it('renders with decimals', () => {
      render(<AnimatedCounter value={98.5} decimals={1} autoStart={false} />);
      const counter = screen.getByText('98.5');
      expect(counter).toBeInTheDocument();
    });
  });

  describe('Element Types', () => {
    it('renders as span by default', () => {
      render(<AnimatedCounter value={100} autoStart={false} />);
      const counter = screen.getByText('100');
      expect(counter.tagName).toBe('SPAN');
    });

    it('renders as div when specified', () => {
      render(<AnimatedCounter value={100} as="div" autoStart={false} />);
      const counter = screen.getByText('100');
      expect(counter.tagName).toBe('DIV');
    });

    it('renders as p when specified', () => {
      render(<AnimatedCounter value={100} as="p" autoStart={false} />);
      const counter = screen.getByText('100');
      expect(counter.tagName).toBe('P');
    });

    it('renders as strong when specified', () => {
      render(<AnimatedCounter value={100} as="strong" autoStart={false} />);
      const counter = screen.getByText('100');
      expect(counter.tagName).toBe('STRONG');
    });
  });

  describe('Custom Format', () => {
    it('uses custom format function', () => {
      const format = (val: number) => `Formatted: ${val}`;
      render(<AnimatedCounter value={100} format={format} autoStart={false} />);
      const counter = screen.getByText('Formatted: 100');
      expect(counter).toBeInTheDocument();
    });
  });

  describe('Large Numbers', () => {
    it('formats large numbers with locale', () => {
      render(<AnimatedCounter value={1234567} autoStart={false} />);
      const counter = screen.getByText('1,234,567');
      expect(counter).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('starts at 0 when autoStart is true', () => {
      render(<AnimatedCounter value={100} autoStart={true} />);
      const counter = screen.getByText('0');
      expect(counter).toBeInTheDocument();
    });

    it('calls onComplete callback', async () => {
      const onComplete = vi.fn();
      render(
        <AnimatedCounter
          value={100}
          duration={100}
          onComplete={onComplete}
        />
      );

      await waitFor(() => expect(onComplete).toHaveBeenCalled(), { timeout: 2000 });
    });
  });
});
