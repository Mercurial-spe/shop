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
        console.error('获取商品详情失败', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      alert('请先登录');
      navigate('/login');
      return;
    }
    if (product) {
      try {
        await apiService.addToCart(user.id, product.id, quantity);
        alert('已成功加入购物车');
      } catch (err) {
        alert('加入购物车失败');
      }
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">正在加载商品详情...</div>;
  if (!product) return <div className="text-center py-20 text-gray-500">商品不存在</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Link to="/products" className="text-primary-600 hover:text-primary-700 mb-8 inline-flex items-center gap-1 font-medium">
        <span>←</span> 返回列表
      </Link>
      
      <div className="grid md:grid-cols-2 gap-12 mt-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <img 
            src={product.imageUrl || 'https://via.placeholder.com/600x400?text=No+Image'} 
            alt={product.name}
            className="w-full h-[400px] object-cover rounded-xl"
          />
        </div>
        
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">{product.description}</p>
          
          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-4xl font-bold text-red-600">¥{product.price.toFixed(2)}</span>
            {product.stockQuantity && (
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                库存充足: {product.stockQuantity} 件
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-xl font-bold"
              >-</button>
              <input 
                type="number" 
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 text-center border-x border-gray-300 outline-none py-2"
              />
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-xl font-bold"
              >+</button>
            </div>
            <span className="text-gray-500">选择数量</span>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={handleAddToCart}
              className="flex-1 py-4 bg-primary-600 hover:bg-primary-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-primary-200 transition-all active:scale-95"
            >
              加入购物车
            </button>
            <button className="flex-1 py-4 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 text-lg font-bold rounded-xl transition-all">
              立即购买
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

