import { useState, useEffect, useRef } from 'react';
import { getTimeUntil } from '../utils/date';

export function useCountdown(targetDate) {
  const [time, setTime] = useState(() => getTimeUntil(targetDate));
  const targetDateRef = useRef(targetDate);

  useEffect(() => {
    targetDateRef.current = targetDate;
  }, [targetDate]);

  useEffect(() => {
    const initialTime = getTimeUntil(targetDateRef.current);

    if (initialTime.expired) return;

    const timer = setInterval(() => {
      const newTime = getTimeUntil(targetDateRef.current);
      setTime(newTime);
      if (newTime.expired) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return time;
}