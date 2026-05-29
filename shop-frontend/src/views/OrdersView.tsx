import type { Order } from '../types/app';
import { EmptyState } from '../components/EmptyState';
import { formatDate, formatMoney, orderTotal } from '../utils/format';

export function OrdersView({ actionBusy, orders, onPay }: { actionBusy: string | null; orders: Order[]; onPay: (id: number) => void }) {
  return (
    <section className="content-block">
      <div className="section-heading">
        <p className="eyebrow">Order history</p>
        <h2>订单状态与付款</h2>
      </div>
      <div className="table-surface">
        {orders.length === 0 ? (
          <EmptyState title="暂无订单" text="顾客下单后，订单明细和支付状态会出现在这里。" />
        ) : (
          <table>
            <thead>
              <tr>
                <th>订单</th>
                <th>时间</th>
                <th>商品</th>
                <th>金额</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>{(order.items ?? []).map((item) => item.product?.name ?? item.productName ?? '商品').join(' / ')}</td>
                  <td>{formatMoney(orderTotal(order))}</td>
                  <td><span className="status-pill">{order.status}</span></td>
                  <td>
                    <button className="ghost-button" type="button" disabled={order.status !== 'PENDING' || Boolean(actionBusy)} onClick={() => onPay(order.id)}>
                      {actionBusy === `pay-${order.id}` ? '支付中' : '支付'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
