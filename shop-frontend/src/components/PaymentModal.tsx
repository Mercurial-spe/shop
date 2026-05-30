import { useState } from 'react';
import type { Order } from '../types/app';
import { formatMoney, orderTotal } from '../utils/format';

const PAYMENT_METHODS = [
  { key: '支付宝', label: '支付宝', hint: '扫码支付 · 即时到账', accent: 'alipay' },
  { key: '微信支付', label: '微信支付', hint: '微信扫码 · 即时到账', accent: 'wechat' },
  { key: '银行卡', label: '银行卡', hint: '储蓄卡 / 信用卡快捷支付', accent: 'bank' },
] as const;

/**
 * 站内模拟支付弹窗：顾客下单后选择支付方式并确认，
 * 确认后调用后端 /orders/{id}/pay，将订单从「待支付」推进到「已支付」。
 */
export function PaymentModal({
  order,
  busy,
  onClose,
  onConfirm,
}: {
  order: Order;
  busy: boolean;
  onClose: () => void;
  onConfirm: (method: string) => void;
}) {
  const [method, setMethod] = useState<string>(PAYMENT_METHODS[0].key);
  const total = orderTotal(order);

  return (
    <aside className="modal-overlay" aria-label="模拟支付">
      <button className="modal-backdrop" type="button" onClick={onClose} aria-label="关闭" />
      <section className="modal-panel payment-modal">
        <button className="close-button" type="button" onClick={onClose}>×</button>
        <p className="eyebrow">Mock payment</p>
        <h2>模拟支付</h2>
        <div className="payment-amount">
          <small>订单 #{order.id} 应付金额</small>
          <strong>{formatMoney(total)}</strong>
        </div>
        <div className="payment-methods">
          {PAYMENT_METHODS.map((item) => (
            <button
              className={`payment-method ${item.accent} ${method === item.key ? 'active' : ''}`}
              key={item.key}
              type="button"
              onClick={() => setMethod(item.key)}
            >
              <span className="payment-method-name">{item.label}</span>
              <small>{item.hint}</small>
              <i className="payment-radio" aria-hidden="true" />
            </button>
          ))}
        </div>
        <p className="payment-note">课程演示用模拟支付，确认后不会发生真实扣款。</p>
        <div className="button-pair">
          <button className="ghost-button" type="button" onClick={onClose} disabled={busy}>
            稍后支付
          </button>
          <button className="primary-button" type="button" onClick={() => onConfirm(method)} disabled={busy}>
            {busy ? '支付中...' : `确认支付 ${formatMoney(total)}`}
          </button>
        </div>
      </section>
    </aside>
  );
}
