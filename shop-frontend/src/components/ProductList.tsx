import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Product } from '../types/Product';
import { apiService } from '../services/api';
import type { User } from '../services/api';
import ProductCard from './ProductCard';
import AddProductForm from './AddProductForm';
import FilterSidebar from './FilterSidebar';

interface ProductListProps {
  user: User | null;
}

const ProductList: React.FC<ProductListProps> = ({ user }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [hasInteracted, setHasInteracted] = useState(false);
  const navigate = useNavigate();

  const loadProducts = async () => {
    try {
      const data = await apiService.getProducts();
      setProducts(data);
    } catch (err) {
      setError('商品加载失败。');
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
      alert('删除失败，请稍后再试。');
    }
  };

  const handleAddToCart = async (productId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await apiService.addToCart(user.id, productId, 1);
      alert('已加入购物车。');
    } catch (err) {
      alert('加入购物车失败。');
    }
  };

  const filters = [
    { id: 'all', label: '精选', predicate: () => true },
    { id: 'budget', label: '平价', predicate: (product: Product) => product.price < 30 },
    { id: 'premium', label: '高端', predicate: (product: Product) => product.price >= 120 },
    {
      id: 'low-stock',
      label: '库存紧张',
      predicate: (product: Product) => (product.stockQuantity ?? 0) > 0 && (product.stockQuantity ?? 0) <= 5
    }
  ];

  const activePredicate = filters.find((filter) => filter.id === activeFilter)?.predicate ?? filters[0].predicate;
  const visibleProducts = products.filter(activePredicate);

  const containerVariants = hasInteracted
    ? { hidden: {}, show: {} }
    : { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };

  const cardVariants = hasInteracted
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.12 } } }
    : { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4 text-slate-300">
      <div className="w-12 h-12 border-4 border-white/20 border-t-cyan-300 rounded-full animate-spin"></div>
      <p className="font-medium">正在加载商品...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-20 bg-white/10 rounded-2xl border border-white/20 max-w-2xl mx-auto px-4 text-slate-200 backdrop-blur">
      <div className="text-6xl mb-4 text-cyan-200">!</div>
      <h3 className="text-3xl font-bold text-cyan-100 mb-2 tracking-widest">{error}</h3>
      <p className="text-slate-300 mb-6 font-mono text-sm">请检查后端服务是否在 8080 端口运行</p>
      <button onClick={loadProducts} className="px-6 py-2 bg-cyan-300 text-slate-900 rounded-lg font-bold hover:bg-cyan-200 transition-colors">重试</button>
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-2">
        <div className="relative group">
          <h2 className="text-5xl md:text-6xl font-snow bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent py-2">
            curated recommendations
          </h2>
          <div className="absolute -bottom-1 left-0 w-1/3 h-1.5 bg-cyan-300 rounded-full transform origin-left group-hover:w-full transition-all duration-500"></div>
          <p className="text-slate-400 mt-2 font-bold font-starborn tracking-[0.35em] uppercase text-xs">quality signals</p>
        </div>

        {user?.role === 'SELLER' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-md border border-white/20 backdrop-blur ${
              showAddForm
                ? 'bg-white/20 text-white hover:bg-white/30'
                : 'bg-cyan-300 text-slate-900 hover:bg-cyan-200 shadow-cyan-200/30'
            }`}
          >
              {showAddForm ? '关闭编辑' : '发布商品'}
          </button>
        )}
      </div>

      {showAddForm && user?.role === 'SELLER' && (
        <div className="transition-all">
          <AddProductForm onCreated={handleCreated} sellerId={user.id} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-8">
        <FilterSidebar
          filters={filters}
          activeFilter={activeFilter}
          onSelect={(id) => {
            setHasInteracted(true);
            setActiveFilter(id);
          }}
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {visibleProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={cardVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 240, damping: 20 }}
              className="w-full h-full"
            >
              <ProductCard
                product={product}
                onDelete={user?.role === 'SELLER' ? handleDelete : undefined}
                onAddToCart={handleAddToCart}
                className="w-full h-full"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {products.length === 0 && !showAddForm && (
        <div className="text-center py-32 bg-white/10 rounded-3xl border border-white/20">
          <div className="text-6xl mb-6 text-cyan-200">+</div>
          <h3 className="text-xl font-bold text-white mb-2">暂无商品</h3>
          <p className="text-slate-300">发布你的第一件商品吧。</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;
