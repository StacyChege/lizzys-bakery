import { useState, useEffect } from 'react';

/**
 * Custom hook that delays updating a value until a set amount of time
 * (delay) has passed without any new updates.
 */
export default function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update debouncedValue after 'delay' milliseconds
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // If the user types again BEFORE the timer finishes, clear the old timer and start a new one
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}