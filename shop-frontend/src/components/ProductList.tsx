import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../types/Product';
import { apiService } from '../services/api';
import type { User } from '../services/api';
import ProductCard from './ProductCard';
import AddProductForm from './AddProductForm';

interface ProductListProps {
  user: User | null;
}

const ProductList: React.FC<ProductListProps> = ({ user }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  const loadProducts = async () => {
    try {
      const data = await apiService.getProducts();
      setProducts(data);
    } catch (err) {
      setError('无法获取商品数据');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreated = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
    setShowAddForm(false);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('删除商品失败', err);
      alert('删除失败，请稍后重试');
    }
  };

  const handleAddToCart = async (productId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await apiService.addToCart(user.id, productId, 1);
      alert('成功加入购物车！');
    } catch (err) {
      alert('加入购物车失败');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium">正在探索优质商品...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100 max-w-2xl mx-auto px-4">
      <div className="text-4xl mb-4">⚠️</div>
      <h3 className="text-xl font-bold text-red-800 mb-2">{error}</h3>
      <p className="text-red-600 mb-6">请检查后端服务是否已在 8080 端口启动</p>
      <button onClick={loadProducts} className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold">重试</button>
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">热门商品</h2>
          <p className="text-gray-500 mt-1">为您精选的全球优质好物</p>
        </div>
        
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md ${
            showAddForm 
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
              : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-100'
          }`}
        >
          {showAddForm ? '取消添加' : '＋ 发布新商品'}
        </button>
      </div>

      {showAddForm && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <AddProductForm onCreated={handleCreated} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onDelete={handleDelete} 
            onAddToCart={handleAddToCart} 
          />
        ))}
      </div>

      {products.length === 0 && !showAddForm && (
        <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <div className="text-6xl mb-6">🏜️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">暂无商品</h3>
          <p className="text-gray-500">快来发布第一件商品吧！</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;
