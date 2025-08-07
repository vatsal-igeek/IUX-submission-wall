import { useEffect } from 'react';

function useOutsideClick<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T | null>,
  callback: () => void
) {
  useEffect(() => {
    const handleClick = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [ref, callback]);
}

export default useOutsideClick;
