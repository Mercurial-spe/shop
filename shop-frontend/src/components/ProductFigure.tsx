import { productImageSrc } from '../utils/format';
import type { Product } from '../types/Product';

export function ProductFigure({ product }: { product: Product }) {
  return (
    <div className="product-figure">
      {product.imageUrl && (
        <img
          alt={product.name}
          src={productImageSrc(product.imageUrl)}
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      )}
      <span>{product.category?.slice(0, 2) ?? '数码'}</span>
    </div>
  );
}
