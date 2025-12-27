import React, { useEffect, useRef } from 'react';

const InteractiveBackground: React.FC = () => {
  const blobRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 }
  ]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      };
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;

    const animate = () => {
      blobRefs.current.forEach((blob, index) => {
        if (!blob) return;

        const rangeX = window.innerWidth * (0.2 + index * 0.1);
        const rangeY = window.innerHeight * (0.2 + index * 0.1);

        const targetX = mousePos.current.x * rangeX;
        const targetY = mousePos.current.y * rangeY;

        const current = currentPos.current[index];
        const ease = 0.05;

        current.x += (targetX - current.x) * ease;
        current.y += (targetY - current.y) * ease;

        blob.style.transform = `translate(${current.x}px, ${current.y}px)`;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0b1220] pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`
        }}
      ></div>

      <div
        ref={(el) => { blobRefs.current[0] = el; }}
        className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-400/20 rounded-full blur-[120px] mix-blend-screen"
      />

      <div
        ref={(el) => { blobRefs.current[1] = el; }}
        className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[110px] mix-blend-screen"
      />

      <div
        ref={(el) => { blobRefs.current[2] = el; }}
        className="absolute -bottom-32 left-1/3 w-[700px] h-[700px] bg-teal-300/20 rounded-full blur-[140px] mix-blend-screen"
      />
    </div>
  );
};

export default InteractiveBackground;
