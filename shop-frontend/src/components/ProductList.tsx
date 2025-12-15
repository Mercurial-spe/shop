import React, { useEffect, useState } from 'react';
import type { Product } from '../types/Product';
import { apiService } from '../services/api';
import ProductCard from './ProductCard';
import AddProductForm from './AddProductForm';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      const data = await apiService.getProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreated = (product: Product) => {
    // 直接把新创建的产品插入到列表顶端
    setProducts((prev) => [product, ...prev]);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('删除商品失败', err);
      alert('删除商品失败，请检查后台日志');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading products...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        {error}
        <br />
        <small>Make sure the backend is running on http://localhost:8080</small>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>商品列表</h2>
      <AddProductForm onCreated={handleCreated} />
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '16px',
          padding: '20px',
        }}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onDelete={handleDelete} />
        ))}
      </div>
      {products.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
          暂无商品数据
        </div>
      )}
    </div>
  );
};

export default ProductList;
