import type { RecommendationProduct } from '../services/api';
import type { Product } from '../types/Product';
import { formatMoney } from '../utils/format';
import { ProductFigure } from './ProductFigure';

export function ProductDrawer({
  canShop = true,
  product,
  related,
  onAdd,
  onBuy,
  onClose,
}: {
  canShop?: boolean;
  product: Product;
  related: RecommendationProduct[];
  onAdd: (product: Product) => void;
  onBuy: (product: Product) => void;
  onClose: () => void;
}) {
  return (
    <aside className="drawer" aria-label="商品详情">
      <button className="drawer-backdrop" type="button" onClick={onClose} />
      <section className="drawer-panel">
        <button className="close-button" type="button" onClick={onClose}>×</button>
        <ProductFigure product={product} />
        <span className="category-pill">{product.category ?? '未分类'}</span>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <div className="drawer-price">
          <strong>{formatMoney(product.price)}</strong>
          <small>库存 {product.stockQuantity ?? 0} / 销售 {product.seller?.username ?? '平台'}</small>
        </div>
        {canShop ? (
          <div className="button-pair">
            <button className="ghost-button" type="button" onClick={() => onAdd(product)}>加入购物车</button>
            <button className="primary-button" type="button" onClick={() => onBuy(product)}>立即购买</button>
          </div>
        ) : (
          <p className="drawer-readonly">当前为销售 / 管理账号的只读预览，购物操作仅对顾客开放。</p>
        )}
        {related.length > 0 && (
          <div className="related-list">
            <h3>浏览过此商品的人也买了</h3>
            {related.map((item) => (
              <article key={item.id}>
                <span>{item.name}</span>
                <small>{item.reason}</small>
              </article>
            ))}
          </div>
        )}
      </section>
    </aside>
  );
}
