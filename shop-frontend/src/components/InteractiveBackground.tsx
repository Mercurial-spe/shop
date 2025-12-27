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
      // 归一化鼠标位置 (-1 到 1)
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

        // 加大移动范围，确保肉眼可见 (0.2 - 0.3 的系数)
        const rangeX = window.innerWidth * (0.2 + index * 0.1);
        const rangeY = window.innerHeight * (0.2 + index * 0.1);

        const targetX = mousePos.current.x * rangeX;
        const targetY = mousePos.current.y * rangeY;

        // 使用线性插值 (Lerp) 实现平滑跟手效果
        const current = currentPos.current[index];
        const ease = 0.05; // 缓动系数，越小越慢

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
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gray-50 pointer-events-none">
      {/* 噪点纹理层，增加质感 */}
      <div className="absolute inset-0 opacity-[0.4]" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")` }}>
      </div>

      {/* 顶部主光斑 - 浅蓝色 */}
      <div 
        ref={(el) => { blobRefs.current[0] = el; }}
        className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-300/30 rounded-full blur-[120px] mix-blend-multiply filter"
      />

      {/* 右侧副光斑 - 浅紫色 */}
      <div 
        ref={(el) => { blobRefs.current[1] = el; }}
        className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-purple-300/30 rounded-full blur-[100px] mix-blend-multiply filter"
      />

      {/* 底部光斑 - 浅青色 */}
      <div 
        ref={(el) => { blobRefs.current[2] = el; }}
        className="absolute -bottom-32 left-1/3 w-[700px] h-[700px] bg-cyan-300/30 rounded-full blur-[140px] mix-blend-multiply filter"
      />
    </div>
  );
};

export default InteractiveBackground;

