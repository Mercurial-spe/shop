import type { Product } from '../types/Product';
import { formatMoney } from '../utils/format';
import { ProductFigure } from './ProductFigure';

export function ProductCard({
  actionBusy,
  canShop = true,
  product,
  onAdd,
  onBuy,
  onInspect,
}: {
  actionBusy: string | null;
  canShop?: boolean;
  product: Product;
  onAdd: (product: Product) => void;
  onBuy: (product: Product) => void;
  onInspect: (product: Product) => void;
}) {
  const stock = Number(product.stockQuantity ?? 0);
  const lowStock = stock <= 5;
  const adding = actionBusy === `cart-${product.id}`;
  const buying = actionBusy === `buy-${product.id}`;
  return (
    <article className="product-card">
      <button className="image-button" type="button" onClick={() => onInspect(product)}>
        <ProductFigure product={product} />
        <span className="product-tag category">{product.category ?? '未分类'}</span>
        {lowStock && <span className="product-tag low-stock">库存紧张</span>}
      </button>
      <div className="product-compact">
        <h3>{product.name}</h3>
        <div className="product-price-row">
          <strong>{formatMoney(product.price)}</strong>
          <small className={lowStock ? 'danger-text' : ''}>库存 {stock}</small>
        </div>
      </div>
      <div className="product-reveal">
        <p>{product.description}</p>
        {canShop ? (
          <div className="button-pair">
            <button className="ghost-button compact" disabled={Boolean(actionBusy)} type="button" onClick={() => onAdd(product)}>
              {adding ? '加入中' : '加购'}
            </button>
            <button className="primary-button compact" disabled={Boolean(actionBusy)} type="button" onClick={() => onBuy(product)}>
              {buying ? '处理中' : '购买'}
            </button>
          </div>
        ) : (
          <button className="secondary-button compact full" type="button" onClick={() => onInspect(product)}>
            查看详情
          </button>
        )}
      </div>
    </article>
  );
}
