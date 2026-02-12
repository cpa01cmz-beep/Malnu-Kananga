import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface AnimatedCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  format?: (value: number) => string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  autoStart?: boolean;
  onComplete?: () => void;
  className?: string;
  as?: 'span' | 'div' | 'p' | 'strong';
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1500,
  delay = 0,
  format,
  prefix = '',
  suffix = '',
  decimals = 0,
  autoStart = true,
  onComplete,
  className = '',
  as: Component = 'span',
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const defaultFormat = (val: number): string => {
    if (decimals > 0) {
      return val.toFixed(decimals);
    }
    return Math.round(val).toLocaleString();
  };

  const formatValue = format || defaultFormat;

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(value);
      onComplete?.();
      return;
    }

    if (!autoStart) {
      setDisplayValue(value);
      return;
    }

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min((elapsed - delay) / duration, 1);

      if (elapsed < delay) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      if (!hasStarted) {
        setHasStarted(true);
      }

      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = easedProgress * value;

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
        onComplete?.();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, duration, delay, autoStart, onComplete, prefersReducedMotion, hasStarted]);

  useEffect(() => {
    if (!prefersReducedMotion && autoStart) {
      startTimeRef.current = null;
      setDisplayValue(0);
      setHasStarted(false);
    }
  }, [value, prefersReducedMotion, autoStart]);

  return (
    <Component className={className}>
      {prefix}
      {formatValue(displayValue)}
      {suffix}
    </Component>
  );
};

export default AnimatedCounter;
