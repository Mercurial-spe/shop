import type { ProductCategory } from '../services/api';
import type { Product } from '../types/Product';
import type { ProductForm, SellerBrowseLog, SellerOrderItem, SellerPurchaseLog, SellerStats } from '../types/app';
import { MetricCard } from '../components/AnalyticsWidgets';
import { ProductFigure } from '../components/ProductFigure';
import { formatDate, formatMoney, orderStatusLabel } from '../utils/format';

export function SellerView({
  categories,
  categoryName,
  form,
  orders,
  products,
  stats,
  browseLogs,
  purchaseLogs,
  importing,
  onCategoryName,
  onCreateCategory,
  onCreateProduct,
  onDeleteCategory,
  onDeleteProduct,
  onDownloadOrders,
  onDownloadProducts,
  onImportProducts,
  onForm,
  onEditProduct,
}: {
  categories: ProductCategory[];
  categoryName: string;
  form: ProductForm;
  orders: SellerOrderItem[];
  products: Product[];
  stats: SellerStats | null;
  browseLogs: SellerBrowseLog[];
  purchaseLogs: SellerPurchaseLog[];
  importing: boolean;
  onCategoryName: (value: string) => void;
  onCreateCategory: () => void;
  onCreateProduct: () => void;
  onDeleteCategory: (id: number) => void;
  onDeleteProduct: (product: Product) => void;
  onDownloadOrders: () => void;
  onDownloadProducts: () => void;
  onImportProducts: (file: File) => void;
  onForm: (value: ProductForm) => void;
  onEditProduct: (product: Product) => void;
}) {
  const lowStockCount = Number(stats?.lowStockCount ?? products.filter((item) => Number(item.stockQuantity ?? 0) <= 5).length);
  const canPublish = form.name.trim() !== '' && form.price.trim() !== '' && form.stockQuantity.trim() !== '';

  return (
    <section className="content-block seller-console">
      <div className="section-heading">
        <p className="eyebrow">Sales console</p>
        <h2>销售工作台</h2>
        <span className="heading-sub">发布与管理商品、维护类别、跟踪订单与用户行为，支持 CSV 批量导入导出。</span>
      </div>

      <div className="metric-grid">
        <MetricCard label="销售额" value={formatMoney(Number(stats?.totalRevenue ?? 0))} />
        <MetricCard label="订单数" value={String(stats?.totalOrders ?? orders.length)} />
        <MetricCard label="售出件数" value={String(stats?.totalUnits ?? 0)} />
        <MetricCard label="低库存预警" value={String(lowStockCount)} />
      </div>

      <div className="seller-grid">
        <div className="control-panel seller-card">
          <div className="card-head">
            <span className="card-icon">＋</span>
            <div>
              <h3>发布新商品</h3>
              <small>填写信息后点击发布，商品立即上架到商城。</small>
            </div>
          </div>
          <label>商品名称<input placeholder="例如：Aurora 旗舰手机 Pro" value={form.name} onChange={(event) => onForm({ ...form, name: event.target.value })} /></label>
          <label>商品描述<textarea placeholder="一句话卖点，留空则用商品名" value={form.description} onChange={(event) => onForm({ ...form, description: event.target.value })} /></label>
          <div className="form-row">
            <label>价格 (¥)<input placeholder="0.00" value={form.price} onChange={(event) => onForm({ ...form, price: event.target.value })} /></label>
            <label>库存<input placeholder="0" value={form.stockQuantity} onChange={(event) => onForm({ ...form, stockQuantity: event.target.value })} /></label>
          </div>
          <label>
            类别
            <input list="seller-category-options" placeholder="选择或输入类别" value={form.category} onChange={(event) => onForm({ ...form, category: event.target.value })} />
            <datalist id="seller-category-options">
              {categories.map((item) => (
                <option key={item.id} value={item.name} />
              ))}
            </datalist>
          </label>
          <label>图片链接<input placeholder="https://images.unsplash.com/..." value={form.imageUrl} onChange={(event) => onForm({ ...form, imageUrl: event.target.value })} /></label>
          <button className="primary-button full" type="button" disabled={!canPublish} onClick={onCreateProduct}>发布商品</button>
        </div>

        <div className="seller-side-col">
          <div className="control-panel seller-card">
            <div className="card-head">
              <span className="card-icon">🏷</span>
              <div>
                <h3>类别管理</h3>
                <small>点击类别标签可删除（仍被商品使用的类别会被保护）。</small>
              </div>
            </div>
            <div className="inline-form">
              <input placeholder="新类别名称" value={categoryName} onChange={(event) => onCategoryName(event.target.value)} />
              <button className="primary-button" type="button" onClick={onCreateCategory}>添加</button>
            </div>
            <div className="chip-list light">
              {categories.length === 0 ? (
                <span className="chip-empty">暂无类别，先添加一个吧。</span>
              ) : (
                categories.map((item) => (
                  <button className="chip-deletable" key={item.id} type="button" title="点击删除该类别" onClick={() => onDeleteCategory(item.id)}>
                    {item.name}<i aria-hidden="true">×</i>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="control-panel seller-card">
            <div className="card-head">
              <span className="card-icon">⇅</span>
              <div>
                <h3>数据导入导出</h3>
                <small>批量管理商品数据，CSV 表头：商品名称,类别,价格,库存,描述,图片链接。</small>
              </div>
            </div>
            <div className="tool-buttons">
              <label className={`tool-button import ${importing ? 'busy' : ''}`}>
                <span className="tool-button-title">{importing ? '导入中…' : '导入商品 CSV'}</span>
                <span className="tool-button-sub">从文件批量新建商品</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  disabled={importing}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      onImportProducts(file);
                    }
                    event.target.value = '';
                  }}
                />
              </label>
              <button className="tool-button" type="button" onClick={onDownloadProducts}>
                <span className="tool-button-title">导出商品 CSV</span>
                <span className="tool-button-sub">商品 / 类别 / 价格 / 库存</span>
              </button>
              <button className="tool-button" type="button" onClick={onDownloadOrders}>
                <span className="tool-button-title">导出订单 CSV</span>
                <span className="tool-button-sub">订单 / 买家 / 状态 / 金额</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="panel-surface">
        <div className="panel-surface-head">
          <h3>商品目录</h3>
          <span>{products.length} 件在售 · 库存 ≤ 5 标红预警</span>
        </div>
        <div className="table-surface flush">
          <table>
            <thead>
              <tr>
                <th>商品</th>
                <th>类别</th>
                <th>价格</th>
                <th>库存</th>
                <th className="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={5} className="table-empty">还没有商品，用左侧「发布新商品」或「导入商品 CSV」开始。</td></tr>
              ) : (
                products.map((product) => {
                  const stock = Number(product.stockQuantity ?? 0);
                  const low = stock <= 5;
                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="cell-product">
                          <ProductFigure product={product} compact />
                          <span>{product.name}</span>
                        </div>
                      </td>
                      <td><span className="cell-tag">{product.category ?? '未分类'}</span></td>
                      <td>{formatMoney(product.price)}</td>
                      <td>
                        <span className={low ? 'stock-badge low' : 'stock-badge'}>{stock}{low ? ' 紧张' : ''}</span>
                      </td>
                      <td className="col-actions">
                        <div className="table-actions">
                          <button className="ghost-button" type="button" onClick={() => onEditProduct(product)}>编辑</button>
                          <button className="danger-button" type="button" onClick={() => onDeleteProduct(product)}>下架</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel-surface">
        <div className="panel-surface-head">
          <h3>近期订单</h3>
          <span>与我的商品相关的最新订单</span>
        </div>
        <div className="table-surface flush">
          <table>
            <thead>
              <tr>
                <th>订单</th>
                <th>买家</th>
                <th>商品</th>
                <th>数量</th>
                <th>金额</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={6} className="table-empty">暂无订单。</td></tr>
              ) : (
                orders.slice(0, 10).map((item) => (
                  <tr key={`${item.orderId}-${item.productId}`}>
                    <td>#{item.orderId}</td>
                    <td>{item.buyerName}</td>
                    <td>{item.productName}</td>
                    <td>{item.quantity}</td>
                    <td>{formatMoney(item.price * item.quantity)}</td>
                    <td><span className={`status-pill status-${(item.orderStatus ?? '').toLowerCase()}`}>{orderStatusLabel(item.orderStatus)}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="seller-grid logs">
        <div className="panel-surface">
          <div className="panel-surface-head">
            <h3>商品浏览日志</h3>
            <span>谁看了我的商品 · 停留时长</span>
          </div>
          <div className="table-surface flush">
            <table>
              <thead>
                <tr>
                  <th>用户</th>
                  <th>商品</th>
                  <th>停留(秒)</th>
                  <th>IP</th>
                  <th>时间</th>
                </tr>
              </thead>
              <tbody>
                {browseLogs.length === 0 ? (
                  <tr><td colSpan={5} className="table-empty">暂无浏览记录</td></tr>
                ) : (
                  browseLogs.slice(0, 10).map((log, index) => (
                    <tr key={log.id ?? index}>
                      <td>{log.username ?? '游客'}</td>
                      <td>{log.productName}</td>
                      <td>{log.durationSeconds ?? 0}</td>
                      <td>{log.ipAddress ?? '-'}</td>
                      <td>{formatDate(log.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel-surface">
          <div className="panel-surface-head">
            <h3>商品购买日志</h3>
            <span>谁买了我的商品 · 单价数量</span>
          </div>
          <div className="table-surface flush">
            <table>
              <thead>
                <tr>
                  <th>用户</th>
                  <th>商品</th>
                  <th>单价</th>
                  <th>数量</th>
                  <th>时间</th>
                </tr>
              </thead>
              <tbody>
                {purchaseLogs.length === 0 ? (
                  <tr><td colSpan={5} className="table-empty">暂无购买记录</td></tr>
                ) : (
                  purchaseLogs.slice(0, 10).map((log, index) => (
                    <tr key={log.id ?? index}>
                      <td>{log.username ?? '-'}</td>
                      <td>{log.productName}</td>
                      <td>{formatMoney(log.unitPrice)}</td>
                      <td>{log.quantity ?? 0}</td>
                      <td>{formatDate(log.purchasedAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
