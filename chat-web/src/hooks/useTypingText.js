import { useEffect, useState } from 'react';

export const useTypingText = (text, speed = 50, delay = 0) => {
  const [display, setDisplay] = useState('');
  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplay((prev) => prev + text[i]);
        i++;
        if (i === text.length) clearInterval(interval);
      }, speed);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);
  return display;
};
