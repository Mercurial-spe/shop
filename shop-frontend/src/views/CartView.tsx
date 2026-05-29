import type { CartItem } from '../services/api';
import { EmptyState } from '../components/EmptyState';
import { ProductFigure } from '../components/ProductFigure';
import { formatMoney } from '../utils/format';

export function CartView({ actionBusy, cart, onCheckout, onRemove }: { actionBusy: string | null; cart: CartItem[]; onCheckout: () => void; onRemove: (id: number) => void }) {
  const total = cart.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const checkingOut = actionBusy === 'checkout';
  return (
    <section className="content-block split-layout">
      <div>
        <div className="section-heading">
          <p className="eyebrow">Cart checkout</p>
          <h2>购物车结算</h2>
        </div>
        <div className="list-stack">
          {cart.length === 0 && <EmptyState title="购物车还是空的" text="登录顾客账号后，把商品加入购物车即可在这里结算。" />}
          {cart.map((item) => (
            <article className="line-item" key={item.id}>
              <ProductFigure product={item.product} />
              <div>
                <strong>{item.product.name}</strong>
                <small>{formatMoney(item.product.price)} x {item.quantity}</small>
              </div>
              <button className="ghost-button" type="button" onClick={() => onRemove(item.id)}>
                移除
              </button>
            </article>
          ))}
        </div>
      </div>
      <aside className="checkout-panel">
        <span className="category-pill">模拟支付</span>
        <h3>{formatMoney(total)}</h3>
        <p>结算会创建订单并扣减库存，支付后后端执行邮件确认逻辑。</p>
        <button className="primary-button full" disabled={cart.length === 0 || Boolean(actionBusy)} type="button" onClick={onCheckout}>
          {checkingOut ? '结算中...' : '提交订单'}
        </button>
      </aside>
    </section>
  );
}
