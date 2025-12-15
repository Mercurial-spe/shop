import React, { useState } from 'react';
import type { Product } from '../types/Product';
import { apiService } from '../services/api';

interface AddProductFormProps {
  onCreated: (product: Product) => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onCreated }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      alert('名称和价格必填');
      return;
    }

    try {
      setSubmitting(true);
      const newProduct = await apiService.createProduct({
        name: name.trim(),
        price: Number(price),
        description: description.trim(),
        imageUrl: imageUrl.trim() || undefined,
        stockQuantity: stockQuantity ? Number(stockQuantity) : undefined,
      });
      onCreated(newProduct);
      // 清空表单
      setName('');
      setPrice('');
      setDescription('');
      setImageUrl('');
      setStockQuantity('');
    } catch (err) {
      console.error('创建商品失败', err);
      alert('创建商品失败，请检查后台日志');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 600,
        margin: '0 auto 30px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
      }}
    >
      <h3 style={{ marginBottom: '16px' }}>新增商品</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          placeholder="名称（必填）"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="number"
          placeholder="价格（必填）"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <textarea
          placeholder="描述"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
        />
        <input
          placeholder="图片 URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="number"
          placeholder="库存数量"
          value={stockQuantity}
          onChange={(e) => setStockQuantity(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        style={{
          marginTop: '14px',
          padding: '10px 16px',
          backgroundColor: '#27ae60',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '15px',
        }}
      >
        {submitting ? '提交中...' : '创建商品'}
      </button>
    </form>
  );
};

export default AddProductForm;


