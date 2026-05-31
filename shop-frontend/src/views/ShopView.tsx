import type { CSSProperties } from 'react';
import type { RecommendationProduct, User } from '../services/api';
import type { View } from '../types/app';
import type { Product } from '../types/Product';
import { DEMO_CREDENTIALS } from '../data/storefront';
import { formatMoney } from '../utils/format';
import { ProductCard } from '../components/ProductCard';
import { ProductFigure } from '../components/ProductFigure';

export function ShopView({
  actionBusy,
  canShop,
  loading,
  products,
  allProducts,
  recommendations,
  category,
  categoryOptions,
  cartCount,
  sort,
  stats,
  user,
  onAdd,
  onBuy,
  onCategory,
  onInspect,
  onQuickLogin,
  onQuery,
  onSort,
  onView,
}: {
  actionBusy: string | null;
  canShop: boolean;
  loading: boolean;
  products: Product[];
  allProducts: Product[];
  recommendations: RecommendationProduct[];
  category: string;
  categoryOptions: string[];
  cartCount: number;
  sort: string;
  stats: { label: string; value: string }[];
  user: User | null;
  onAdd: (product: Product) => void;
  onBuy: (product: Product) => void;
  onCategory: (value: string) => void;
  onInspect: (product: Product) => void;
  onQuickLogin: (username: string, password: string) => void;
  onQuery: (value: string) => void;
  onSort: (value: string) => void;
  onView: (value: View) => void;
}) {
  const categoryNames = categoryOptions.filter((item) => item !== '全部');
  const leadProduct = products[0] ?? allProducts[0];
  const promoProducts = (products.length ? products : allProducts).slice(0, 3);
  const countByCategory = (name: string) => allProducts.filter((product) => product.category === name).length;
  const roleWorkspace = user?.role === 'SELLER' ? 'seller' : user?.role === 'ADMIN' ? 'admin' : null;

  return (
    <section className="market-home">
      <aside className="category-rail" aria-label="商品类目">
        <h3>主题市场</h3>
        <button className={category === '全部' ? 'active' : ''} type="button" onClick={() => onCategory('全部')}>
          全部商品
          <small>{allProducts.length} 件在售</small>
        </button>
        {categoryNames.map((item) => (
          <button className={category === item ? 'active' : ''} key={item} type="button" onClick={() => onCategory(item)}>
            {item}
            <small>{countByCategory(item)} 件 · 精选推荐</small>
          </button>
        ))}
        <div className="rail-footnote">
          <strong>课程功能</strong>
          <span>浏览日志、推荐系统、购物车、订单支付都在前台流程中触发。</span>
        </div>
      </aside>

      <div className="market-main">
        <div className="market-hero">
          <div className="market-hero-copy">
            <span className="category-pill">今日主会场</span>
            <h2>mercurial's shop</h2>
            <p>搜索、类目、推荐、低库存、热卖商品放在同一个商城动线里，后台再承接数据分析。</p>
            <div className="hero-actions">
              <button className="primary-button" type="button" onClick={() => leadProduct && onInspect(leadProduct)}>
                查看主推
              </button>
              <button className="secondary-button" type="button" onClick={() => onCategory('全部')}>
                逛全部
              </button>
            </div>
          </div>
          <div className="promo-stack">
            {promoProducts.map((product) => (
              <button key={product.id} type="button" onClick={() => onInspect(product)}>
                <ProductFigure product={product} />
                <span>
                  <strong>{product.name}</strong>
                  <small>{formatMoney(product.price)}</small>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="channel-row" aria-label="快捷频道">
          {[
            { label: '🔥 热门好物', sort: 'featured' },
            { label: '🆕 新品上架', sort: 'new' },
            { label: '⚡ 库存紧张', sort: 'stock' },
            { label: '💰 价格优先', sort: 'priceAsc' },
            { label: '💎 高端精选', sort: 'priceDesc' },
          ].map((channel) => (
            <button
              className={sort === channel.sort ? 'active' : ''}
              key={channel.label}
              type="button"
              onClick={() => {
                onQuery('');
                onCategory('全部');
                onSort(channel.sort);
              }}
            >
              {channel.label}
            </button>
          ))}
        </div>

        <div className="shop-toolbar market-filterbar">
          <select value={category} onChange={(event) => onCategory(event.target.value)}>
            {categoryOptions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select value={sort} onChange={(event) => onSort(event.target.value)}>
            <option value="featured">综合推荐</option>
            <option value="new">新品上架</option>
            <option value="priceAsc">价格从低到高</option>
            <option value="priceDesc">价格从高到低</option>
            <option value="stock">低库存优先</option>
          </select>
        </div>

        {recommendations.length > 0 && (
          <div className="recommend-band market-recommend">
            <div className="recommend-heading">
              <span>猜你喜欢</span>
              <small>基于浏览记录生成</small>
            </div>
            {recommendations.slice(0, 4).map((item) => (
              <button className="recommend-card" key={item.id} type="button" onClick={() => onInspect(item)}>
                <ProductFigure product={item} />
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.reason}</small>
                  <em>{formatMoney(item.price)}</em>
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="market-section-title">
          <h2>全部好物</h2>
          <span>{products.length} 个结果</span>
        </div>
        <div className="product-grid market-product-grid">
          {loading
            ? Array.from({ length: 10 }, (_, index) => <div className="product-skeleton" key={index} />)
            : products.map((product, index) => (
                <div className="product-card-enter" key={product.id} style={{ '--i': index } as CSSProperties}>
                  <ProductCard
                    actionBusy={actionBusy}
                    canShop={canShop}
                    product={product}
                    onAdd={onAdd}
                    onBuy={onBuy}
                    onInspect={onInspect}
                  />
                </div>
              ))}
        </div>
      </div>

      <aside className="market-side" aria-label="用户与交易">
        <section className="buyer-card">
          <span className="role-chip">{user ? user.role : '游客'}</span>
          <h3>{user ? user.username : '欢迎逛商城'}</h3>
          <p>
            {!user
              ? '用演示账号登录后，可以完整测试加购、下单、推荐和日志。'
              : roleWorkspace
                ? '当前账号为只读浏览，购物操作仅对顾客开放，可随时回到工作台。'
                : '继续浏览会记录画像并刷新推荐。'}
          </p>
          {!user ? (
            <>
              <button className="primary-button full" type="button" onClick={() => onView('login')}>
                打开登录界面
              </button>
              <div className="quick-login-grid">
                {DEMO_CREDENTIALS.map((item) => (
                  <button disabled={Boolean(actionBusy)} key={item.username} type="button" onClick={() => onQuickLogin(item.username, item.password)}>
                    {actionBusy === `quick-${item.username}` ? '进入中' : item.role}
                  </button>
                ))}
              </div>
            </>
          ) : roleWorkspace ? (
            <button className="primary-button full" type="button" onClick={() => onView(roleWorkspace)}>
              {roleWorkspace === 'seller' ? '返回销售台' : '返回管理台'}
            </button>
          ) : (
            <div className="buyer-actions">
              <button className="primary-button compact" type="button" onClick={() => onView('cart')}>
                购物车 {cartCount}
              </button>
              <button className="secondary-button compact" type="button" onClick={() => onView('orders')}>
                我的订单
              </button>
            </div>
          )}
        </section>
        <section className="market-metrics">
          {stats.map((stat) => (
            <span key={stat.label}>
              <strong>{stat.value}</strong>
              <small>{stat.label}</small>
            </span>
          ))}
        </section>
        <section className="market-news">
          <h3>商城公告</h3>
          <p>销售台可调价、改库存、管理类别；管理台可看画像、趋势、异常和排行榜。</p>
        </section>
      </aside>
    </section>
  );
}
