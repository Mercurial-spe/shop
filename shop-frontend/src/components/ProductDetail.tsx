import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import type { User } from '../services/api';
import type { Product } from '../types/Product';

interface ProductDetailProps {
  user: User | null;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
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

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please sign in first.');
      navigate('/login');
      return;
    }
    if (product) {
      try {
        await apiService.addToCart(user.id, product.id, quantity);
        alert('Added to cart.');
      } catch (err) {
        alert('Failed to add to cart.');
      }
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      alert('Please sign in first.');
      navigate('/login');
      return;
    }
    if (product) {
      try {
        const updated = await apiService.purchaseProduct(product.id, quantity);
        setProduct(updated);
        alert('购买成功。');
      } catch (err) {
        alert('购买失败，请稍后再试。');
      }
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-300">Loading product...</div>;
  if (!product) return <div className="text-center py-20 text-slate-300">Product not found.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Link to="/products" className="text-cyan-200 hover:text-cyan-100 mb-8 inline-flex items-center gap-2 font-medium">
        <span className="text-lg">&larr;</span> Back to catalog
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
    </div>
  );
};

export default ProductDetail;
