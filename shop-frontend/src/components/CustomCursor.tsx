import React, { useEffect, useRef } from 'react';

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const handleMove = (event: MouseEvent) => {
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
    };

    const handleOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const isMedia = target?.closest('[data-cursor="media"]');
      cursor.classList.toggle('cursor-active', Boolean(isMedia));
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseover', handleOver);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseover', handleOver);
    };
  }, []);

  return <div className="custom-cursor" ref={cursorRef} aria-hidden="true" />;
};

export default CustomCursor;
