import type { CSSProperties } from 'react';
import type { User } from '../services/api';
import type {
  AnalyticsAnomalies,
  AnalyticsOverview,
  AnalyticsRankings,
  AnalyticsTrends,
  CustomerProfile,
  LoginLog,
  Period,
} from '../types/app';
import { BarChart, MetricCard, RankingPanel } from '../components/AnalyticsWidgets';
import { formatDate, formatMoney } from '../utils/format';

type SellerForm = { username: string; email: string; password: string };

const formatCount = (value?: number) => String(value ?? 0);

function getProfileSegment(profile: CustomerProfile) {
  const totalSpend = Number(profile.totalSpend ?? 0);
  const orderCount = Number(profile.orderCount ?? 0);
  const browseCount = Number(profile.browseCount ?? 0);
  const stay = Number(profile.averageStaySeconds ?? 0);

  if (totalSpend >= 8000 || orderCount >= 12) return '高价值复购客';
  if (browseCount >= 30 && orderCount <= 2) return '研究型潜客';
  if (stay >= 240 || browseCount >= 18) return '深度浏览客';
  return '待激活用户';
}

function getProfileScore(profile: CustomerProfile) {
  const spendScore = Math.min(Number(profile.totalSpend ?? 0) / 120, 35);
  const orderScore = Math.min(Number(profile.orderCount ?? 0) * 4, 25);
  const browseScore = Math.min(Number(profile.browseCount ?? 0) * 1.2, 20);
  const stayScore = Math.min(Number(profile.averageStaySeconds ?? 0) / 12, 20);
  return Math.round(Math.min(100, spendScore + orderScore + browseScore + stayScore));
}

function getProfileSuggestion(profile: CustomerProfile) {
  const segment = getProfileSegment(profile);
  if (segment === '高价值复购客') return '优先推送会员专享、复购礼包和高毛利组合';
  if (segment === '研究型潜客') return '用限时优惠、收藏提醒和评价内容促进转化';
  if (segment === '深度浏览客') return '推荐相邻品类、套装和更高客单商品';
  return '发送首单激励、唤醒券或低门槛试购推荐';
}

function getProfileAccent(segment: string) {
  if (segment === '高价值复购客') return 'coral';
  if (segment === '研究型潜客') return 'amber';
  if (segment === '深度浏览客') return 'teal';
  return 'muted';
}

export function AdminView({
  anomalies,
  anomaliesUpdatedAt,
  form,
  logs,
  overview,
  period,
  profiles,
  rankings,
  sellers,
  trends,
  onCreateSeller,
  onDeleteSeller,
  onDownload,
  onForm,
  onPeriod,
  onResetDemo,
  onResetPassword,
}: {
  anomalies: AnalyticsAnomalies | null;
  anomaliesUpdatedAt: string;
  form: SellerForm;
  logs: LoginLog[];
  overview: AnalyticsOverview | null;
  period: Period;
  profiles: CustomerProfile[];
  rankings: AnalyticsRankings | null;
  sellers: User[];
  trends: AnalyticsTrends | null;
  onCreateSeller: () => void;
  onDeleteSeller: (id: number) => void;
  onDownload: () => void;
  onForm: (value: SellerForm) => void;
  onPeriod: (value: Period) => void;
  onResetDemo: () => void;
  onResetPassword: (id: number) => void;
}) {
  return (
    <section className="content-block admin-block">
      <div className="section-heading">
        <p className="eyebrow">Admin analytics</p>
        <h2>画像、预测、排行榜和异常监控</h2>
      </div>
      <div className="metric-grid">
        <MetricCard label="销售额" value={formatMoney(overview?.totalRevenue)} />
        <MetricCard label="订单数" value={String(overview?.totalOrders ?? 0)} />
        <MetricCard label="转化率" value={`${Math.round(Number(overview?.conversionRate ?? 0) * 100)}%`} />
        <MetricCard label="异常数" value={String(anomalies?.total ?? 0)} />
      </div>
      {overview?.statusBreakdown && overview.statusBreakdown.length > 0 && (
        <div className="status-board">
          <div className="status-board-head">
            <h3>订单状态分布</h3>
            <span>按状态统计订单数与金额</span>
          </div>
          <div className="status-grid">
            {overview.statusBreakdown.map((item) => (
              <article className={`status-tile status-${item.status.toLowerCase()}`} key={item.status}>
                <span className="status-name">{item.label}</span>
                <strong>{item.orderCount}</strong>
                <small>{formatMoney(item.revenue)}</small>
              </article>
            ))}
          </div>
        </div>
      )}
      <div className="analytics-grid">
        <div className="dark-panel chart-panel">
          <div className="panel-title">
            <div>
              <h3>销售趋势</h3>
              <p className="forecast-text">观察近 10 个周期的销售走势与预测区间。</p>
            </div>
            <div className="segmented small">
              {(['day', 'week', 'month'] as Period[]).map((item) => (
                <button className={period === item ? 'active' : ''} key={item} type="button" onClick={() => onPeriod(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <BarChart metrics={trends?.points ?? []} />
          <p className="forecast-text">
            下 7 天预测 {formatMoney(trends?.forecast?.predictedNext7DaysRevenue)} / {trends?.forecast?.method ?? '等待数据'}
          </p>
        </div>
        <div className="control-panel">
          <h3>销售人员 ID 管理</h3>
          <label>用户名<input value={form.username} onChange={(event) => onForm({ ...form, username: event.target.value })} /></label>
          <label>邮箱<input value={form.email} onChange={(event) => onForm({ ...form, email: event.target.value })} /></label>
          <label>初始密码<input value={form.password} onChange={(event) => onForm({ ...form, password: event.target.value })} /></label>
          <button className="primary-button full" type="button" onClick={onCreateSeller}>添加销售人员</button>
          <div className="seller-list">
            {sellers.map((seller) => (
              <article key={seller.id}>
                <span>{seller.username}</span>
                <div>
                  <button className="ghost-button" type="button" onClick={() => onResetPassword(seller.id)}>重置</button>
                  <button className="danger-button" type="button" onClick={() => onDeleteSeller(seller.id)}>删除</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
      <div className="analytics-grid three">
        <RankingPanel title="商品排行" metrics={rankings?.products ?? []} />
        <RankingPanel title="类别排行" metrics={rankings?.categories ?? []} />
        <RankingPanel title="销售排行" metrics={rankings?.sellers ?? []} />
      </div>
      <div className="analytics-grid">
        <div className="control-panel">
          <h3>顾客画像</h3>
          {profiles.length ? (
            <div className="profile-list">
              {profiles.map((profile) => {
                const segment = getProfileSegment(profile);
                const score = getProfileScore(profile);
                const accent = getProfileAccent(segment);
                const initials = profile.username.slice(0, 2).toUpperCase();
                return (
                  <article className={`profile-card accent-${accent}`} key={profile.userId}>
                    <div className="profile-card-header">
                      <div className="profile-avatar">{initials}</div>
                      <div>
                        <strong>{profile.username}</strong>
                        <span>{profile.region ?? '未知地区'} · {profile.favoriteCategory ?? '未标记品类'}</span>
                      </div>
                      <span className="profile-segment">{segment}</span>
                    </div>
                    <div className="profile-stats">
                      <span>
                        <small>消费力</small>
                        <strong>{profile.purchasePower ?? '未知'}</strong>
                      </span>
                      <span>
                        <small>累计消费</small>
                        <strong>{formatMoney(profile.totalSpend)}</strong>
                      </span>
                      <span>
                        <small>订单/浏览</small>
                        <strong>{formatCount(profile.orderCount)} / {formatCount(profile.browseCount)}</strong>
                      </span>
                      <span>
                        <small>停留时长</small>
                        <strong>{formatCount(profile.averageStaySeconds)}s</strong>
                      </span>
                    </div>
                    <div className="profile-score">
                      <div>
                        <span>价值指数</span>
                        <strong>{score}</strong>
                      </div>
                      <i style={{ '--score': `${score}%` } as CSSProperties} />
                    </div>
                    <p className="profile-suggestion">{getProfileSuggestion(profile)}</p>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state profile-empty">
              <strong>暂无顾客画像</strong>
              <p>当系统积累到足够的浏览和订单数据后，这里会自动生成用户分群与运营建议。</p>
            </div>
          )}
        </div>
        <div className="dark-panel">
          <div className="panel-title">
            <h3>实时异常</h3>
            <span className="live-indicator">
              <i className="live-dot" />
              实时{anomaliesUpdatedAt ? ` · ${anomaliesUpdatedAt}` : ''}
            </span>
          </div>
          <div className="alert-list">
            {(anomalies?.all ?? []).length === 0 ? (
              <article>
                <strong>暂无异常</strong>
                <small>系统每 15 秒自动巡检，发现异常会即时出现在这里。</small>
              </article>
            ) : (
              (anomalies?.all ?? []).slice(0, 8).map((item, index) => (
                <article key={`${item.type}-${item.productId ?? item.ipAddress ?? index}`}>
                  <strong>{item.title}</strong>
                  <span>{item.productName ?? item.ipAddress}</span>
                  <small>{item.message}</small>
                </article>
              ))
            )}
          </div>
          <div className="download-row">
            <button className="secondary-button" type="button" onClick={onResetDemo}>重置演示数据</button>
            <button className="secondary-button" type="button" onClick={onDownload}>导出报表</button>
          </div>
        </div>
      </div>
      <div className="table-surface">
        <table>
          <thead>
            <tr>
              <th>账号</th>
              <th>角色/动作</th>
              <th>IP</th>
              <th>内容</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((item, index) => (
              <tr key={`${item.username}-${item.createdAt}-${index}`}>
                <td>{item.username ?? '-'}</td>
                <td>{item.role ?? item.action ?? '-'}</td>
                <td>{item.ipAddress ?? '-'}</td>
                <td>{item.content ?? '登录系统'}</td>
                <td>{formatDate(item.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
