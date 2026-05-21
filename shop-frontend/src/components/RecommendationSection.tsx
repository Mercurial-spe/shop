import React from 'react';
import { Link } from 'react-router-dom';
import type { RecommendationProduct } from '../services/api';

interface RecommendationSectionProps {
  title: string;
  subtitle: string;
  products: RecommendationProduct[];
  loading?: boolean;
  error?: string | null;
  onAddToCart?: (id: number) => void;
  emptyText?: string;
}

const RecommendationSection: React.FC<RecommendationSectionProps> = ({
  title,
  subtitle,
  products,
  loading = false,
  error = null,
  onAddToCart,
  emptyText = '暂无推荐商品',
}) => {
  if (loading) {
    return (
      <section className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">{subtitle}</p>
            <h3 className="mt-2 text-2xl font-black text-white">{title}</h3>
          </div>
          <div className="h-8 w-8 rounded-full border-4 border-white/20 border-t-cyan-300 animate-spin"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-amber-300/25 bg-amber-400/10 p-5 text-amber-50 backdrop-blur">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-100">{subtitle}</p>
        <h3 className="mt-2 text-2xl font-black text-white">{title}</h3>
        <p className="mt-3 text-sm text-amber-100">{error}</p>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="rounded-2xl border border-white/15 bg-white/10 p-5 text-slate-200 backdrop-blur">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">{subtitle}</p>
        <h3 className="mt-2 text-2xl font-black text-white">{title}</h3>
        <p className="mt-3 text-sm text-slate-300">{emptyText}</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/15 bg-white/10 p-5 md:p-6 backdrop-blur shadow-[0_18px_60px_rgba(8,47,73,0.25)]">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">{subtitle}</p>
          <h3 className="mt-2 text-2xl md:text-3xl font-black text-white">{title}</h3>
        </div>
        <span className="text-sm text-slate-300">基于浏览、购买和相似用户行为</span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <article
            key={product.id}
            className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 rounded-xl border border-white/10 bg-slate-950/35 p-3 transition-all hover:border-cyan-200/50 hover:bg-slate-900/55"
          >
            <Link to={`/product/${product.id}`} className="block overflow-hidden rounded-lg" data-cursor="media">
              <img
                src={product.imageUrl || 'https://via.placeholder.com/200?text=No+Image'}
                alt={product.name}
                className="h-24 w-24 object-cover transition-transform duration-300 hover:scale-105"
              />
            </Link>

            <div className="min-w-0">
              <div className="flex items-start justify-between gap-3">
                <Link to={`/product/${product.id}`} className="min-w-0 hover:text-cyan-100">
                  <h4 className="line-clamp-2 text-sm font-bold leading-snug text-white">{product.name}</h4>
                </Link>
                <span className="shrink-0 font-mono text-base font-black text-cyan-200">¥{product.price.toFixed(2)}</span>
              </div>

              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-300">{product.reason}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {product.category && (
                  <span className="rounded-full border border-violet-300/25 bg-violet-400/15 px-2.5 py-1 text-[0.65rem] font-bold text-violet-100">
                    {product.category}
                  </span>
                )}
                {product.stockQuantity != null && (
                  <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[0.65rem] font-bold text-slate-200">
                    库存 {product.stockQuantity}
                  </span>
                )}
              </div>

              <div className="mt-3 flex gap-2">
                {onAddToCart && (
                  <button
                    type="button"
                    onClick={() => onAddToCart(product.id)}
                    className="rounded-lg bg-cyan-300 px-3 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-cyan-200"
                  >
                    加入购物车
                  </button>
                )}
                <Link
                  to={`/product/${product.id}`}
                  className="rounded-lg border border-white/20 px-3 py-2 text-xs font-bold text-slate-100 transition-colors hover:border-cyan-200 hover:text-cyan-100"
                >
                  查看
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default RecommendationSection;
