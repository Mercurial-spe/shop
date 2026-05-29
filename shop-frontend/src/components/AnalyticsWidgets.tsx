import type { CSSProperties } from 'react';
import type { Metric } from '../types/app';
import { formatMoney } from '../utils/format';

export function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

const getMetricValue = (item: Metric) => Number(item.revenue ?? item.quantity ?? item.units ?? 0);

export function BarChart({ metrics }: { metrics: Metric[] }) {
  const points = metrics.slice(-10).map((item) => ({
    key: String(item.period ?? item.name),
    label: item.period ?? item.name,
    value: getMetricValue(item),
  }));
  const max = Math.max(...points.map((item) => item.value), 1);
  const total = points.reduce((sum, item) => sum + item.value, 0);
  const average = points.length ? total / points.length : 0;
  const peak = points.reduce((best, item) => (item.value > best.value ? item : best), points[0] ?? { key: '-', label: '-', value: 0 });
  const linePoints = points
    .map((item, index) => {
      const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
      const y = 92 - (item.value / max) * 72;
      return `${x},${y}`;
    })
    .join(' ');

  if (!points.length) {
    return (
      <div className="trend-empty">
        <strong>暂无趋势数据</strong>
        <span>切换统计周期或等待订单产生后会显示销售走势。</span>
      </div>
    );
  }

  return (
    <div className="trend-chart" aria-label="销售趋势图">
      <div className="trend-plot">
        <svg className="trend-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline points={linePoints} />
        </svg>
        {points.map((item) => {
          const percent = Math.max(10, (item.value / max) * 100);
          const isPeak = item.key === peak.key;
          return (
            <div className="trend-point" key={item.key} title={`${item.label}: ${formatMoney(item.value)}`}>
              <span className="trend-value">{formatMoney(item.value)}</span>
              <i
                className={isPeak ? 'peak' : ''}
                style={{ '--bar': `${percent}%` } as CSSProperties}
              />
              <small>{item.label}</small>
            </div>
          );
        })}
      </div>
      <div className="trend-summary">
        <span><small>总计</small><strong>{formatMoney(total)}</strong></span>
        <span><small>峰值</small><strong>{formatMoney(peak.value)}</strong></span>
        <span><small>均值</small><strong>{formatMoney(average)}</strong></span>
      </div>
    </div>
  );
}

export function RankingPanel({ title, metrics }: { title: string; metrics: Metric[] }) {
  const max = Math.max(...metrics.map((item) => Number(item.revenue ?? item.quantity ?? item.units ?? 0)), 1);
  return (
    <div className="control-panel ranking-panel">
      <h3>{title}</h3>
      {metrics.slice(0, 6).map((item) => {
        const value = Number(item.revenue ?? item.quantity ?? item.units ?? 0);
        return (
          <article key={`${title}-${item.id ?? item.name}`}>
            <div>
              <strong>{item.name}</strong>
              <small>{formatMoney(item.revenue)} / {item.quantity ?? item.units ?? item.count ?? 0} 件</small>
            </div>
            <span style={{ '--rank': `${Math.max(8, (value / max) * 100)}%` } as CSSProperties} />
          </article>
        );
      })}
    </div>
  );
}
