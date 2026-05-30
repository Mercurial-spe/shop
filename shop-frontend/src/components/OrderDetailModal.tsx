import type { Order } from '../types/app';
import { formatDate, formatMoney, isPendingPayment, orderStatusLabel, orderTotal } from '../utils/format';

/**
 * 订单详情弹窗：展示订单商品明细、状态、支付方式、支付流水号和支付时间。
 * 待支付订单可直接打开模拟支付。
 */
export function OrderDetailModal({
  order,
  busy,
  onClose,
  onPay,
}: {
  order: Order;
  busy: boolean;
  onClose: () => void;
  onPay: (order: Order) => void;
}) {
  const total = orderTotal(order);
  const pending = isPendingPayment(order.status);

  return (
    <aside className="modal-overlay" aria-label="订单详情">
      <button className="modal-backdrop" type="button" onClick={onClose} aria-label="关闭" />
      <section className="modal-panel order-detail-modal">
        <button className="close-button" type="button" onClick={onClose}>×</button>
        <p className="eyebrow">Order detail</p>
        <h2>订单 #{order.id}</h2>
        <span className={`status-pill status-${(order.status ?? '').toLowerCase()}`}>{orderStatusLabel(order.status)}</span>

        <div className="order-detail-items">
          {(order.items ?? []).map((item, index) => (
            <article key={item.id ?? `${order.id}-${index}`}>
              <span>{item.product?.name ?? item.productName ?? '商品'}</span>
              <small>{formatMoney(item.price)} × {item.quantity}</small>
            </article>
          ))}
        </div>

        <dl className="order-detail-meta">
          <div><dt>下单时间</dt><dd>{formatDate(order.createdAt)}</dd></div>
          <div><dt>应付金额</dt><dd>{formatMoney(total)}</dd></div>
          <div><dt>支付方式</dt><dd>{order.paymentMethod ?? '未支付'}</dd></div>
          <div><dt>支付流水号</dt><dd>{order.paymentNo ?? '—'}</dd></div>
          <div><dt>支付时间</dt><dd>{order.paidAt ? formatDate(order.paidAt) : '—'}</dd></div>
        </dl>

        <div className="button-pair">
          <button className="ghost-button" type="button" onClick={onClose}>关闭</button>
          {pending && (
            <button className="primary-button" type="button" onClick={() => onPay(order)} disabled={busy}>
              {busy ? '处理中...' : '去支付'}
            </button>
          )}
        </div>
      </section>
    </aside>
  );
}
