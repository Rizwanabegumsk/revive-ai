import { useState, useEffect, useRef } from 'react';

interface CountUpOptions {
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  formatIndian?: boolean;
}

/**
 * Premium, performant count-up animation hook.
 * Uses smooth cubic-bezier ease-out curve (duration 1000–1200ms).
 * Animates ONLY when targetValue genuinely changes.
 * Respects prefers-reduced-motion.
 */
export function useCountUp(
  targetValue: number,
  options: CountUpOptions = {}
): string {
  const {
    duration = 1100,
    decimals = 0,
    prefix = '',
    suffix = '',
    formatIndian = false
  } = options;

  const [displayValue, setDisplayValue] = useState<number>(targetValue);
  const prevTargetRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef<number>(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(targetValue);
      prevTargetRef.current = targetValue;
      return;
    }

    // If initial mount or targetValue changed, animate
    if (prevTargetRef.current !== targetValue) {
      const initialStart = prevTargetRef.current === null ? 0 : displayValue;
      startValueRef.current = initialStart;
      prevTargetRef.current = targetValue;
      startTimeRef.current = null;

      const animate = (timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        // Smooth cubic-bezier(0.22, 1, 0.36, 1) approximation (quart/quint ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 4);
        const current = startValueRef.current + (targetValue - startValueRef.current) * easeOut;

        setDisplayValue(current);

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayValue(targetValue);
        }
      };

      frameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [targetValue, duration]);

  // Format display value
  const formattedNumber = decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toString();

  let formattedString = formattedNumber;
  if (formatIndian) {
    const num = decimals > 0 ? Number(displayValue.toFixed(decimals)) : Math.round(displayValue);
    formattedString = num.toLocaleString('en-IN');
  }

  return `${prefix}${formattedString}${suffix}`;
}
