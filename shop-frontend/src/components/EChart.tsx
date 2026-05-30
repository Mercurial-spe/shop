import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

/**
 * 轻量 ECharts 封装：传入 option 即渲染，容器尺寸变化时自动 resize。
 * 用 echarts 核心库直接挂载，避免与 React 19 的 peer 依赖冲突。
 */
export function EChart({
  option,
  height = 280,
  className,
}: {
  option: echarts.EChartsCoreOption;
  height?: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const chart = echarts.init(containerRef.current, undefined, { renderer: 'canvas' });
    chartRef.current = chart;
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(option, true);
  }, [option]);

  return <div ref={containerRef} className={className} style={{ width: '100%', height }} />;
}
