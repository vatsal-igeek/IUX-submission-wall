import { useEffect, useRef } from 'react';

const useOutsideClick = (callback: () => void) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    const handleTouchClick = (event: TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleMouseClick);
    document.addEventListener('touchstart', handleTouchClick);

    return () => {
      document.removeEventListener('mousedown', handleMouseClick);
      document.removeEventListener('touchstart', handleTouchClick);
    };
  }, [callback]);

  return ref;
};

export default useOutsideClick; 