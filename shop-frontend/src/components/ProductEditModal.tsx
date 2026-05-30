import { useState } from 'react';
import type { Product } from '../types/Product';

/**
 * 站内商品编辑弹窗：销售人员修改商品名称、类别、价格、库存、描述和图片链接。
 * 替换原来逐字段的 window.prompt 交互，便于课程截图。
 */
export function ProductEditModal({
  product,
  categories,
  busy,
  onClose,
  onSave,
}: {
  product: Product;
  categories: string[];
  busy: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Product>) => void;
}) {
  const [name, setName] = useState(product.name);
  const [category, setCategory] = useState(product.category ?? '');
  const [price, setPrice] = useState(String(product.price ?? ''));
  const [stockQuantity, setStockQuantity] = useState(String(product.stockQuantity ?? ''));
  const [description, setDescription] = useState(product.description ?? '');
  const [imageUrl, setImageUrl] = useState(product.imageUrl ?? '');

  const submit = () => {
    onSave({
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      stockQuantity: Number(stockQuantity),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
    });
  };

  return (
    <aside className="modal-overlay" aria-label="编辑商品">
      <button className="modal-backdrop" type="button" onClick={onClose} aria-label="关闭" />
      <section className="modal-panel edit-modal">
        <button className="close-button" type="button" onClick={onClose}>×</button>
        <p className="eyebrow">Edit product</p>
        <h2>编辑商品</h2>
        <label>名称<input value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label>
          类别
          <input value={category} onChange={(event) => setCategory(event.target.value)} list="edit-category-options" />
          <datalist id="edit-category-options">
            {categories.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </label>
        <div className="form-row">
          <label>价格<input value={price} onChange={(event) => setPrice(event.target.value)} inputMode="decimal" /></label>
          <label>库存<input value={stockQuantity} onChange={(event) => setStockQuantity(event.target.value)} inputMode="numeric" /></label>
        </div>
        <label>描述<textarea value={description} onChange={(event) => setDescription(event.target.value)} /></label>
        <label>图片链接<input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} /></label>
        <div className="button-pair">
          <button className="ghost-button" type="button" onClick={onClose} disabled={busy}>取消</button>
          <button className="primary-button" type="button" onClick={submit} disabled={busy}>
            {busy ? '保存中...' : '保存修改'}
          </button>
        </div>
      </section>
    </aside>
  );
}
