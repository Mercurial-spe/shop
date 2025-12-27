import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import type { User } from '../services/api';

interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  status: 'SHIPPED' | 'RECEIVED';
  createdAt: string;
  shippedAt?: string;
  receivedAt?: string;
  items: OrderItem[];
}

const statusMap: Record<Order['status'], string> = {
  SHIPPED: '已发货',
  RECEIVED: '已签收',
};

interface OrdersProps {
  user: User;
}

const Orders: React.FC<OrdersProps> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await apiService.getOrdersByUser(user.id);
        setOrders(data);
      } catch (err: any) {
        setError(err.message || '加载订单失败。');
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [user.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-slate-300">
        <div className="w-12 h-12 border-4 border-white/20 border-t-cyan-300 rounded-full animate-spin"></div>
        <p className="font-medium">正在加载订单...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-white/10 rounded-2xl border border-white/20 max-w-2xl mx-auto px-4 text-slate-200 backdrop-blur">
        <div className="text-6xl mb-4 text-cyan-200">!</div>
        <h3 className="text-2xl font-bold text-cyan-100 mb-2 tracking-widest">加载失败</h3>
        <p className="text-slate-300 mb-6 font-mono text-sm">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-32 bg-white/10 rounded-3xl border border-white/20">
        <div className="text-6xl mb-6 text-cyan-200">+</div>
        <h3 className="text-xl font-bold text-white mb-2">暂无订单</h3>
        <p className="text-slate-300">下单后可在这里查看状态。</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white">我的订单</h2>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white/10 border border-white/20 rounded-3xl p-6 backdrop-blur">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div className="text-slate-300">
                <div className="text-sm">订单号: <span className="text-white font-semibold">{order.id}</span></div>
                <div className="text-sm">下单时间: {new Date(order.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-4 py-2 rounded-full bg-cyan-500/80 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                  {statusMap[order.status]}
                </span>
                <Link
                  to={`/orders/${order.id}`}
                  className="px-4 py-2 rounded-full border border-white/20 text-slate-200 hover:text-white hover:border-cyan-200 transition-all"
                >
                  查看详情
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="text-white font-semibold">{item.product?.name || '商品'}</div>
                  <div className="text-slate-300">数量: {item.quantity}</div>
                  <div className="text-cyan-200 font-mono font-bold">¥{(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
