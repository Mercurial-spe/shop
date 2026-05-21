import React, { useEffect, useState } from 'react';
import type { Product } from '../types/Product';
import type { ProductCategory } from '../services/api';

interface ProductEditDialogProps {
  product: Product;
  categories: ProductCategory[];
  open: boolean;
  loading?: boolean;
  onCancel: () => void;
  onSave: (updates: Partial<Product>) => Promise<void> | void;
}

const ProductEditDialog: React.FC<ProductEditDialogProps> = ({
  product,
  categories,
  open,
  loading = false,
  onCancel,
  onSave,
}) => {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [category, setCategory] = useState(product.category || categories[0]?.name || '未分类');
  const [price, setPrice] = useState(product.price.toString());
  const [stockQuantity, setStockQuantity] = useState((product.stockQuantity ?? 0).toString());
  const [imageUrl, setImageUrl] = useState(product.imageUrl || '');

  useEffect(() => {
    setName(product.name);
    setDescription(product.description);
    setCategory(product.category || categories[0]?.name || '未分类');
    setPrice(product.price.toString());
    setStockQuantity((product.stockQuantity ?? 0).toString());
    setImageUrl(product.imageUrl || '');
  }, [categories, product]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsedPrice = Number(price);
    const parsedStock = Number(stockQuantity);

    if (!name.trim()) {
      alert('请输入商品名称。');
      return;
    }
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      alert('请输入有效价格。');
      return;
    }
    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      alert('请输入有效库存。');
      return;
    }

    await onSave({
      name: name.trim(),
      description: description.trim(),
      category,
      price: parsedPrice,
      stockQuantity: parsedStock,
      imageUrl: imageUrl.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-8 backdrop-blur-md">
      <form
        onSubmit={handleSubmit}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/15 bg-slate-950/95 p-6 text-slate-100 shadow-[0_30px_90px_rgba(8,47,73,0.45)]"
      >
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-200">product editor</p>
            <h3 className="mt-2 text-2xl font-black text-white">编辑商品</h3>
            <p className="mt-2 text-sm text-slate-400">修改后会立即更新销售端商品目录。</p>
          </div>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-slate-200">
            ID {product.id}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-200">商品名称</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-200"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-200">商品类别</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-200"
            >
              {categories.length === 0 ? (
                <option className="bg-slate-900" value="未分类">未分类</option>
              ) : (
                categories.map((item) => (
                  <option key={item.id} className="bg-slate-900" value={item.name}>
                    {item.name}
                  </option>
                ))
              )}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-200">价格 (¥)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-200"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-200">库存</span>
            <input
              type="number"
              min="0"
              value={stockQuantity}
              onChange={(event) => setStockQuantity(event.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-200"
              required
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-bold text-slate-200">图片链接</span>
            <input
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-200"
              placeholder="https://..."
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-bold text-slate-200">商品描述</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-200"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-slate-100 transition hover:border-cyan-200 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-cyan-300 px-6 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-200/25 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? '保存中...' : '保存修改'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductEditDialog;
