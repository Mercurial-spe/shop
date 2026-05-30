import type { Metric, StatusBreakdownItem } from '../types/app';
import { formatMoney } from '../utils/format';
import { EChart } from './EChart';

export function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

const getMetricValue = (item: Metric) => Number(item.revenue ?? item.quantity ?? item.units ?? 0);

const PALETTE = ['#ff7a59', '#ffb454', '#36c5b0', '#5a8dee', '#a66cff', '#ff6f91'];

/** 销售趋势：ECharts 面积折线图，带渐变填充。 */
export function TrendChart({ metrics }: { metrics: Metric[] }) {
  const points = metrics.slice(-12).map((item) => ({
    label: String(item.period ?? item.name ?? '-'),
    value: getMetricValue(item),
  }));

  if (!points.length) {
    return (
      <div className="trend-empty">
        <strong>暂无趋势数据</strong>
        <span>切换统计周期或等待订单产生后会显示销售走势。</span>
      </div>
    );
  }

  const option = {
    grid: { top: 24, right: 18, bottom: 28, left: 56 },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: number) => formatMoney(value),
    },
    xAxis: {
      type: 'category',
      data: points.map((item) => item.label),
      axisLine: { lineStyle: { color: 'rgba(120,120,140,0.4)' } },
      axisLabel: { color: '#8a8aa0', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#8a8aa0', fontSize: 11, formatter: (value: number) => (value >= 1000 ? `${value / 1000}k` : `${value}`) },
      splitLine: { lineStyle: { color: 'rgba(120,120,140,0.15)' } },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbolSize: 7,
        data: points.map((item) => item.value),
        lineStyle: { width: 3, color: '#ff7a59' },
        itemStyle: { color: '#ff7a59' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255,122,89,0.45)' },
              { offset: 1, color: 'rgba(255,122,89,0.02)' },
            ],
          },
        },
      },
    ],
  };

  return <EChart option={option} height={260} />;
}

/** 排行榜：ECharts 横向柱状图。 */
export function RankingChart({ title, metrics }: { title: string; metrics: Metric[] }) {
  const top = metrics.slice(0, 6).map((item) => ({
    name: item.name,
    value: getMetricValue(item),
  }));

  if (!top.length) {
    return (
      <div className="control-panel ranking-panel">
        <h3>{title}</h3>
        <div className="trend-empty">
          <strong>暂无数据</strong>
          <span>有销售记录后会生成排行。</span>
        </div>
      </div>
    );
  }

  // ECharts 横向柱状图从下往上画，反转保证第一名在顶部
  const ordered = [...top].reverse();
  const option = {
    grid: { top: 10, right: 20, bottom: 10, left: 10, containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (value: number) => formatMoney(value) },
    xAxis: { type: 'value', axisLabel: { show: false }, splitLine: { show: false } },
    yAxis: {
      type: 'category',
      data: ordered.map((item) => item.name),
      axisLabel: { color: '#54546a', fontSize: 12 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: ordered.map((item, index) => ({
          value: item.value,
          itemStyle: { color: PALETTE[(ordered.length - 1 - index) % PALETTE.length], borderRadius: [0, 6, 6, 0] },
        })),
        barWidth: 14,
        label: { show: true, position: 'right', formatter: (params: { value: number }) => formatMoney(params.value), color: '#54546a', fontSize: 11 },
      },
    ],
  };

  return (
    <div className="control-panel ranking-panel">
      <h3>{title}</h3>
      <EChart option={option} height={220} />
    </div>
  );
}

/** 订单状态分布：ECharts 环形图。 */
export function StatusDonut({ items }: { items: StatusBreakdownItem[] }) {
  const data = items.filter((item) => item.orderCount > 0).map((item, index) => ({
    name: item.label,
    value: item.orderCount,
    itemStyle: { color: PALETTE[index % PALETTE.length] },
  }));

  if (!data.length) {
    return (
      <div className="trend-empty">
        <strong>暂无订单</strong>
        <span>下单后会按状态统计分布。</span>
      </div>
    );
  }

  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} 单 ({d}%)' },
    legend: { bottom: 0, textStyle: { color: '#8a8aa0', fontSize: 11 } },
    series: [
      {
        type: 'pie',
        radius: ['46%', '70%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: 'rgba(0,0,0,0.25)', borderWidth: 2 },
        label: { show: true, formatter: '{b}\n{c}', color: '#c8c8d8', fontSize: 11 },
        data,
      },
    ],
  };

  return <EChart option={option} height={240} />;
}
