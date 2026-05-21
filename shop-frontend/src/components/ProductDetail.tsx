import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import type { RecommendationProduct, User } from '../services/api';
import type { Product } from '../types/Product';
import RecommendationSection from './RecommendationSection';
import PaymentDialog from './PaymentDialog';

interface ProductDetailProps {
  user: User | null;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<RecommendationProduct[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedError, setRelatedError] = useState<string | null>(null);
  const [pendingPayment, setPendingPayment] = useState<{ orderId: number; amount: number } | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (id) {
          const data = await apiService.getProduct(parseInt(id));
          setProduct(data);
        }
      } catch (err) {
        console.error('Failed to fetch product detail', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!product) return;
    const startedAt = Date.now();
    return () => {
      const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      apiService.recordBrowse(product.id, user?.id ?? null, durationSeconds).catch(() => {
        // 浏览日志是课程数据采集，不应影响用户浏览。
      });
    };
  }, [product?.id, user?.id]);

  useEffect(() => {
    let active = true;
    if (!product?.id) {
      setRelatedProducts([]);
      return;
    }

    setRelatedLoading(true);
    setRelatedError(null);
    apiService.getRelatedProducts(product.id, user?.role === 'CUSTOMER' ? user.id : undefined, 6)
      .then((data) => {
        if (active) setRelatedProducts(data);
      })
      .catch((err) => {
        console.error('加载相关商品失败', err);
        if (active) {
          setRelatedProducts([]);
          setRelatedError('相关商品暂时不可用，请稍后再试。');
        }
      })
      .finally(() => {
        if (active) setRelatedLoading(false);
      });

    return () => {
      active = false;
    };
  }, [product?.id, user?.id, user?.role]);

  const handleAddToCart = async () => {
    if (!user) {
      alert('请先登录。');
      navigate('/login');
      return;
    }
    if (user.role !== 'CUSTOMER') {
      alert('只有顾客账号可以加入购物车。');
      return;
    }
    if (product) {
      try {
        await apiService.addToCart(user.id, product.id, quantity);
        alert('已加入购物车。');
      } catch (err) {
        alert('加入购物车失败。');
      }
    }
  };

  const handleAddRecommendedToCart = async (productId: number) => {
    if (!user) {
      alert('请先登录。');
      navigate('/login');
      return;
    }
    if (user.role !== 'CUSTOMER') {
      alert('只有顾客账号可以加入购物车。');
      return;
    }
    try {
      await apiService.addToCart(user.id, productId, 1);
      alert('已加入购物车。');
    } catch (err) {
      alert('加入购物车失败。');
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      alert('请先登录。');
      navigate('/login');
      return;
    }
    if (user.role !== 'CUSTOMER') {
      alert('只有顾客账号可以购买商品。');
      return;
    }
    if (product) {
      try {
        const order = await apiService.purchaseProduct(product.id, user.id, quantity);
        setPendingPayment({ orderId: order.id, amount: product.price * quantity });
      } catch (err: any) {
        alert(err.message || '购买失败，请稍后再试。');
      }
    }
  };

  const handleConfirmPayment = async (paymentMethod: string) => {
    if (!user || !product || !pendingPayment) return;
    setPaymentLoading(true);
    try {
      const paidOrder = await apiService.payOrder(pendingPayment.orderId, user.id, paymentMethod);
      const refreshed = await apiService.getProduct(product.id);
      setProduct(refreshed);
      setPendingPayment(null);
      alert(`支付成功。订单 ${paidOrder.id} 已进入“已支付”状态。`);
    } catch (err: any) {
      alert(err.message || '支付失败，请稍后再试。');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-300">正在加载商品...</div>;
  if (!product) return <div className="text-center py-20 text-slate-300">未找到商品。</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      <Link to="/products" className="text-cyan-200 hover:text-cyan-100 mb-8 inline-flex items-center gap-2 font-medium">
        <span className="text-lg">&larr;</span> 返回商品列表
      </Link>

      <div className="grid md:grid-cols-2 gap-12 mt-6">
        <div className="bg-white/10 p-4 rounded-3xl border border-white/20 backdrop-blur" data-cursor="media">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/600x400?text=No+Image'}
            alt={product.name}
            className="w-full h-[400px] object-cover rounded-2xl"
          />
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-semibold font-sans text-white mb-4">{product.name}</h1>
          <p className="text-lg text-slate-300 mb-8 leading-relaxed">{product.description}</p>

          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-4xl font-mono font-bold text-cyan-200">¥{product.price.toFixed(2)}</span>
            {product.category && (
              <span className="text-sm text-violet-100 bg-violet-400/15 px-3 py-1 rounded-full border border-violet-300/30">
                {product.category}
              </span>
            )}
            {product.stockQuantity != null && (
              <span className="text-sm text-slate-200 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                库存: {product.stockQuantity}
              </span>
            )}
          </div>

          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center border border-white/20 rounded-xl overflow-hidden bg-white/5">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-white hover:bg-white/10 transition-colors text-xl font-bold"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-16 text-center bg-transparent border-x border-white/20 outline-none py-2 text-white"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 text-white hover:bg-white/10 transition-colors text-xl font-bold"
              >
                +
              </button>
            </div>
            <span className="text-slate-400">选择数量</span>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 py-4 bg-cyan-300 hover:bg-cyan-200 text-slate-900 text-lg font-bold rounded-2xl shadow-lg shadow-cyan-200/30 transition-all active:scale-95"
            >
              加入购物车
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 py-4 border-2 border-cyan-200 text-cyan-200 hover:bg-cyan-200/10 text-lg font-bold rounded-2xl transition-all"
            >
              立即购买
            </button>
          </div>
        </div>
      </div>

      <RecommendationSection
        title="相关商品"
        subtitle="people also bought"
        products={relatedProducts}
        loading={relatedLoading}
        error={relatedError}
        onAddToCart={user?.role === 'CUSTOMER' ? handleAddRecommendedToCart : undefined}
        emptyText="暂无可展示的相关商品。"
      />

      {pendingPayment && (
        <PaymentDialog
          open={Boolean(pendingPayment)}
          orderId={pendingPayment.orderId}
          amount={pendingPayment.amount}
          loading={paymentLoading}
          onCancel={() => {
            const orderId = pendingPayment.orderId;
            setPendingPayment(null);
            alert(`订单 ${orderId} 已创建，当前状态为待支付。可在订单页继续演示。`);
          }}
          onConfirm={handleConfirmPayment}
        />
      )}
    </div>
  );
};

export default ProductDetail;
