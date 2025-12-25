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
      alert('请输入商品名称和价格');
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
      setName('');
      setPrice('');
      setDescription('');
      setImageUrl('');
      setStockQuantity('');
    } catch (err) {
      console.error('创建商品失败', err);
      alert('发布失败，请检查填写内容');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-50 max-w-4xl mx-auto mb-10">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span className="text-2xl">📦</span> 发布新商品
      </h3>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">商品名称</label>
            <input
              placeholder="例如: iPhone 15 Pro"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">商品单价 (¥)</label>
            <input
              type="number"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">库存数量</label>
            <input
              type="number"
              placeholder="默认 0"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">商品描述</label>
            <textarea
              placeholder="请详细描述商品的特点和规格..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">图片链接 URL</label>
            <input
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div className="md:col-span-2 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-100 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {submitting ? '发布中...' : '确认发布商品'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm;
