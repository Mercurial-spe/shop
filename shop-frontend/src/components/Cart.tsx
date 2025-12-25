import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import type { CartItem, User } from '../services/api';

interface CartProps {
  user: User;
}

const Cart: React.FC<CartProps> = ({ user }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const data = await apiService.getCart(user.id);
      setItems(data);
    } catch (err) {
      console.error('获取购物车失败', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (itemId: number) => {
    try {
      await apiService.removeFromCart(user.id, itemId);
      setItems(items.filter(item => item.id !== itemId));
    } catch (err) {
      alert('移除失败');
    }
  };

  const handleClear = async () => {
    if (window.confirm('确定要清空购物车吗？')) {
      try {
        await apiService.clearCart(user.id);
        setItems([]);
      } catch (err) {
        alert('清空失败');
      }
    }
  };

  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium">正在整理您的购物车...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-10">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 mb-10">
        <div>
          <Link to="/products" className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1 mb-2">
            <span>←</span> 继续购物
          </Link>
          <h2 className="text-3xl font-black text-gray-900">我的购物车</h2>
        </div>
        
        {items.length > 0 && (
          <button 
            onClick={handleClear}
            className="text-sm font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
          >
            清空购物车
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl p-20 text-center shadow-sm border border-gray-100">
          <div className="text-7xl mb-6">🛒</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">购物车还是空的</h3>
          <p className="text-gray-500 mb-8">去商品列表看看有没有心仪的宝贝吧</p>
          <Link 
            to="/products" 
            className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-100 transition-all inline-block"
          >
            去逛逛
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center gap-4 group transition-all hover:shadow-md">
                <img 
                  src={item.product.imageUrl || 'https://via.placeholder.com/100?text=No+Image'} 
                  className="w-24 h-24 object-cover rounded-xl"
                  alt=""
                />
                <div className="flex-grow">
                  <h4 className="font-bold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">
                    {item.product.name}
                  </h4>
                  <p className="text-sm text-gray-400 mb-2">单价: ¥{item.product.price.toFixed(2)}</p>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-md">数量: {item.quantity}</span>
                    <button 
                      onClick={() => handleRemove(item.id)}
                      className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors"
                    >
                      移除
                    </button>
                  </div>
                </div>
                <div className="text-right pr-4">
                  <p className="font-black text-gray-900 text-xl">¥{(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-50 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-bottom border-gray-100">订单概览</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-500">
                  <span>商品数量</span>
                  <span>{items.length} 件</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>运费</span>
                  <span className="text-green-500 font-bold">免运费</span>
                </div>
                <div className="h-px bg-gray-100 my-4"></div>
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-900 font-bold">总计金额</span>
                  <span className="text-3xl font-black text-red-600">¥{totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <button
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white text-lg font-bold rounded-2xl shadow-lg shadow-primary-100 transition-all transform active:scale-95"
                onClick={() => alert('订单已提交，支付功能正在赶来！')}
              >
                立即结算
              </button>
              <p className="text-center text-xs text-gray-400 mt-4">支付流程受加密保护，请放心购买</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
