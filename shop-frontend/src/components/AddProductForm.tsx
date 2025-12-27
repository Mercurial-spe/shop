import React, { useState } from 'react';
import type { Product } from '../types/Product';
import { apiService } from '../services/api';

interface AddProductFormProps {
  onCreated: (product: Product) => void;
  sellerId: number;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onCreated, sellerId }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      alert('请输入商品名称和价格。');
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
        sellerId,
      });
      onCreated(newProduct);
      setName('');
      setPrice('');
      setDescription('');
      setImageUrl('');
      setStockQuantity('');
    } catch (err) {
      console.error('Failed to create product', err);
      alert('发布失败，请检查填写内容。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white/10 p-8 rounded-3xl border border-white/20 backdrop-blur max-w-4xl mx-auto mb-10">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-2xl text-cyan-200">+</span> 新商品
      </h3>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">商品名称</label>
            <input
              placeholder="例如：ProShop 外套"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:bg-white/10 focus:ring-2 focus:ring-cyan-200/60 focus:border-transparent outline-none transition-all text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">价格 (¥)</label>
            <input
              type="number"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:bg-white/10 focus:ring-2 focus:ring-cyan-200/60 focus:border-transparent outline-none transition-all text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">库存</label>
            <input
              type="number"
              placeholder="可选"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:bg-white/10 focus:ring-2 focus:ring-cyan-200/60 focus:border-transparent outline-none transition-all text-white"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">商品描述</label>
            <textarea
              placeholder="描述商品细节、材质与亮点。"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:bg-white/10 focus:ring-2 focus:ring-cyan-200/60 focus:border-transparent outline-none transition-all resize-none text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">图片链接</label>
            <input
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:bg-white/10 focus:ring-2 focus:ring-cyan-200/60 focus:border-transparent outline-none transition-all text-white"
            />
          </div>
        </div>

        <div className="md:col-span-2 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto px-10 py-4 bg-cyan-300 hover:bg-cyan-200 text-slate-900 font-bold rounded-2xl shadow-lg shadow-cyan-200/30 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {submitting ? '正在发布...' : '确认发布商品'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm;
