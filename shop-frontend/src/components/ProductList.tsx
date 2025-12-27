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
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();

  const loadProducts = async () => {
    try {
      const data = await apiService.getProducts();
      setProducts(data);
    } catch (err) {
      setError('Unable to load products.');
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
      console.error('Failed to delete product', err);
      alert('Delete failed. Please try again.');
    }
  };

  const handleAddToCart = async (productId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await apiService.addToCart(user.id, productId, 1);
      alert('Added to cart.');
    } catch (err) {
      alert('Failed to add to cart.');
    }
  };

  const filters = [
    { id: 'all', label: 'All Picks', predicate: () => true },
    { id: 'budget', label: 'Budget', predicate: (product: Product) => product.price < 30 },
    { id: 'premium', label: 'Premium', predicate: (product: Product) => product.price >= 120 },
    {
      id: 'low-stock',
      label: 'Low Stock',
      predicate: (product: Product) => (product.stockQuantity ?? 0) > 0 && (product.stockQuantity ?? 0) <= 5
    }
  ];

  const activePredicate = filters.find((filter) => filter.id === activeFilter)?.predicate ?? filters[0].predicate;
  const visibleProducts = products.filter(activePredicate);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium">Curating the catalog...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100 max-w-2xl mx-auto px-4">
      <div className="text-6xl mb-4 text-red-500">!</div>
      <h3 className="text-3xl font-bold text-red-600 mb-2 tracking-widest">{error}</h3>
      <p className="text-red-600 mb-6 font-mono text-sm">Please check if backend service is running on port 8080</p>
      <button onClick={loadProducts} className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors">RETRY</button>
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="relative group">
            <h2 className="text-5xl md:text-6xl font-snow bg-gradient-to-r from-gray-900 via-primary-700 to-primary-500 bg-clip-text text-transparent py-2">
              Curated Picks
            </h2>
            <div className="absolute -bottom-1 left-0 w-1/3 h-1.5 bg-primary-500 rounded-full transform origin-left group-hover:w-full transition-all duration-500"></div>
            <p className="text-gray-400 mt-2 font-medium tracking-[0.35em] uppercase text-xs">Signals of quality</p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-md ${
              showAddForm
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-100'
            }`}
          >
            {showAddForm ? 'Close editor' : 'Add a product'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${
                activeFilter === filter.id
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-200 hover:text-primary-600'
              }`}
            >
              {filter.label}
            </button>
          ))}
          <span className="text-xs text-gray-400 uppercase tracking-[0.35em]">Filter the vibe</span>
        </div>
      </div>

      {showAddForm && (
        <div className="transition-all">
          <AddProductForm onCreated={handleCreated} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
        {visibleProducts.map((product) => (
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
          <div className="text-6xl mb-6">+</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-500">Create your first drop to get started.</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;
