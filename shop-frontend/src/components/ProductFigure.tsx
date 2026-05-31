import { useState } from 'react';
import { productImageSrc } from '../utils/format';
import type { Product } from '../types/Product';

export function ProductFigure({ product, compact = false }: { product: Product; compact?: boolean }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = productImageSrc(product.imageUrl);
  const showImage = Boolean(imageUrl) && !imageFailed;
  const showFallback = !compact || !showImage;

  return (
    <div className={`product-figure ${compact ? 'compact' : ''}`}>
      {showImage && (
        <img
          alt={product.name}
          src={imageUrl}
          onError={() => setImageFailed(true)}
        />
      )}
      {showFallback && <span>{product.category?.slice(0, 2) ?? '数码'}</span>}
    </div>
  );
}
