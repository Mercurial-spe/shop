import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import type { User } from '../services/api';
import type { Product } from '../types/Product';
import AddProductForm from './AddProductForm';

interface SellerOrderItem {
  orderId: number;
  orderStatus: 'SHIPPED' | 'RECEIVED';
  orderCreatedAt: string;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  buyerId: number;
  buyerName: string;
}

interface SellerStats {
  totalRevenue: number;
  totalOrders: number;
  totalUnits: number;
  productSales: Record<string, number>;
}

const statusMap: Record<'SHIPPED' | 'RECEIVED', string> = {
  SHIPPED: '已发货',
  RECEIVED: '已签收',
};

interface SellerDashboardProps {
  user: User;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ user }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<SellerOrderItem[]>([]);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const loadAll = async () => {
    try {
      const [productData, orderData, statsData] = await Promise.all([
        apiService.getProductsBySeller(user.id),
        apiService.getOrdersBySeller(user.id),
        apiService.getSellerStats(user.id),
      ]);
      setProducts(productData);
      setOrders(orderData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || '加载数据失败。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [user.id]);

  const handleCreated = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
    setShowAddForm(false);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteProduct(id);
      setProducts((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert('删除失败，请稍后再试。');
    }
  };

  const handleEdit = async (product: Product) => {
    const priceInput = window.prompt('请输入新的价格（¥）', product.price.toString());
    if (priceInput == null) return;
    const stockInput = window.prompt('请输入新的库存数量', (product.stockQuantity ?? 0).toString());
    if (stockInput == null) return;

    const updatedPrice = Number(priceInput);
    const updatedStock = Number(stockInput);

    if (Number.isNaN(updatedPrice) || Number.isNaN(updatedStock)) {
      alert('请输入有效的数字。');
      return;
    }

    try {
      const updated = await apiService.updateProduct(product.id, {
        name: product.name,
        description: product.description,
        price: updatedPrice,
        imageUrl: product.imageUrl,
        stockQuantity: updatedStock,
      });
      setProducts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      alert('更新失败，请稍后再试。');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-slate-300">
        <div className="w-12 h-12 border-4 border-white/20 border-t-cyan-300 rounded-full animate-spin"></div>
        <p className="font-medium">正在加载管理面板...</p>
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

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-white">销售管理</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`px-6 py-3 rounded-2xl font-bold transition-all shadow-md border border-white/20 backdrop-blur ${
            showAddForm
              ? 'bg-white/20 text-white hover:bg-white/30'
              : 'bg-cyan-300 text-slate-900 hover:bg-cyan-200 shadow-cyan-200/30'
          }`}
        >
          {showAddForm ? '关闭发布' : '新增商品'}
        </button>
      </div>

      {showAddForm && (
        <AddProductForm onCreated={handleCreated} sellerId={user.id} />
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 border border-white/20 rounded-3xl p-6 backdrop-blur">
            <p className="text-sm text-slate-400">总销售额</p>
            <p className="text-3xl font-mono font-bold text-cyan-200">¥{stats.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-3xl p-6 backdrop-blur">
            <p className="text-sm text-slate-400">订单数量</p>
            <p className="text-3xl font-bold text-white">{stats.totalOrders}</p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-3xl p-6 backdrop-blur">
            <p className="text-sm text-slate-400">售出件数</p>
            <p className="text-3xl font-bold text-white">{stats.totalUnits}</p>
          </div>
        </div>
      )}

      <div className="bg-white/10 border border-white/20 rounded-3xl p-6 backdrop-blur">
        <h3 className="text-xl font-bold text-white mb-4">商品目录</h3>
        {products.length === 0 ? (
          <p className="text-slate-300">暂无商品。</p>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div key={product.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <p className="text-white font-semibold">{product.name}</p>
                  <p className="text-slate-400 text-sm">库存: {product.stockQuantity ?? 0}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-cyan-200 font-mono font-bold">¥{product.price.toFixed(2)}</span>
                  <button
                    onClick={() => handleEdit(product)}
                    className="px-4 py-2 rounded-xl bg-white/10 text-slate-200 hover:bg-white/20 transition-all"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-4 py-2 rounded-xl bg-white/10 text-red-200 hover:bg-white/20 transition-all"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white/10 border border-white/20 rounded-3xl p-6 backdrop-blur">
        <h3 className="text-xl font-bold text-white mb-4">订单列表</h3>
        {orders.length === 0 ? (
          <p className="text-slate-300">暂无订单。</p>
        ) : (
          <div className="space-y-3">
            {orders.map((item) => (
              <div key={`${item.orderId}-${item.productId}-${item.buyerId}`} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <p className="text-white font-semibold">{item.productName}</p>
                  <p className="text-slate-400 text-sm">订单号: {item.orderId} / 买家: {item.buyerName}</p>
                  <p className="text-slate-400 text-sm">下单时间: {new Date(item.orderCreatedAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-200">数量: {item.quantity}</span>
                  <span className="text-cyan-200 font-mono font-bold">¥{(item.price * item.quantity).toFixed(2)}</span>
                  <span className="px-3 py-1 rounded-full bg-cyan-500/80 text-white text-sm font-bold shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                    {statusMap[item.orderStatus]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
