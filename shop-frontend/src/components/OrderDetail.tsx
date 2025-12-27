import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import type { User } from '../services/api';

interface OrderItem {
  id: number;
  product: { id: number; name: string };
  quantity: number;
  price: number;
}

interface OrderDetailData {
  id: number;
  status: 'SHIPPED' | 'RECEIVED';
  createdAt: string;
  shippedAt?: string;
  receivedAt?: string;
  items: OrderItem[];
}

const statusMap: Record<OrderDetailData['status'], string> = {
  SHIPPED: '已发货',
  RECEIVED: '已签收',
};

interface OrderDetailProps {
  user: User;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDetail = async () => {
      if (!id) return;
      try {
        const data = await apiService.getOrderDetail(Number(id), user.id);
        setOrder(data);
      } catch (err: any) {
        setError(err.message || '加载订单失败。');
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [id, user.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-slate-300">
        <div className="w-12 h-12 border-4 border-white/20 border-t-cyan-300 rounded-full animate-spin"></div>
        <p className="font-medium">正在加载订单详情...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-20 bg-white/10 rounded-2xl border border-white/20 max-w-2xl mx-auto px-4 text-slate-200 backdrop-blur">
        <div className="text-6xl mb-4 text-cyan-200">!</div>
        <h3 className="text-2xl font-bold text-cyan-100 mb-2 tracking-widest">加载失败</h3>
        <p className="text-slate-300 mb-6 font-mono text-sm">{error || '订单不存在。'}</p>
        <Link to="/orders" className="text-cyan-200 hover:text-cyan-100">
          返回订单列表
        </Link>
      </div>
    );
  }

  const totalPrice = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">订单详情</h2>
          <p className="text-slate-300">订单号: {order.id}</p>
        </div>
        <span className="px-4 py-2 rounded-full bg-cyan-500/80 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.5)]">
          {statusMap[order.status]}
        </span>
      </div>

      <div className="bg-white/10 border border-white/20 rounded-3xl p-6 backdrop-blur space-y-2 text-slate-300">
        <div>下单时间: {new Date(order.createdAt).toLocaleString()}</div>
        {order.shippedAt && <div>发货时间: {new Date(order.shippedAt).toLocaleString()}</div>}
        {order.receivedAt && <div>签收时间: {new Date(order.receivedAt).toLocaleString()}</div>}
      </div>

      <div className="bg-white/10 border border-white/20 rounded-3xl p-6 backdrop-blur">
        <h3 className="text-xl font-bold text-white mb-4">商品清单</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="text-white font-semibold">{item.product?.name || '商品'}</div>
              <div className="text-slate-300">数量: {item.quantity}</div>
              <div className="text-cyan-200 font-mono font-bold">¥{(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4 text-cyan-200 font-mono font-bold">
          合计: ¥{totalPrice.toFixed(2)}
        </div>
      </div>

      <Link to="/orders" className="text-cyan-200 hover:text-cyan-100">
        返回订单列表
      </Link>
    </div>
  );
};

export default OrderDetail;
