import React from 'react';
import type { Product } from '../types/Product';

interface ProductCardProps {
  product: Product;
  onDelete?: (id: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete }) => {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      margin: '8px',
      width: '300px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {product.imageUrl && (
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{
            width: '100%',
            height: '200px',
            objectFit: 'cover',
            borderRadius: '4px',
            marginBottom: '12px'
          }}
        />
      )}
      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{product.name}</h3>
      <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px' }}>
        {product.description}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#e74c3c' }}>
          ¥{product.price.toFixed(2)}
        </span>
        {product.stockQuantity && (
          <span style={{ fontSize: '12px', color: '#666' }}>
            库存: {product.stockQuantity}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
          onClick={() => alert(`购买 ${product.name}`)}
        >
          加入购物车
        </button>
        {onDelete && (
          <button
            style={{
              padding: '10px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              whiteSpace: 'nowrap',
            }}
            onClick={() => {
              if (window.confirm(`确定要删除「${product.name}」吗？`)) {
                onDelete(product.id);
              }
            }}
          >
            删除
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
