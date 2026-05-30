import type { ProductCategory } from '../services/api';
import type { Product } from '../types/Product';
import type { ProductForm, SellerBrowseLog, SellerOrderItem, SellerPurchaseLog, SellerStats } from '../types/app';
import { MetricCard } from '../components/AnalyticsWidgets';
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
  return (
    <section className="content-block">
      <div className="section-heading">
        <p className="eyebrow">Sales console</p>
        <h2>商品目录、库存价格与销售状态</h2>
      </div>
      <div className="metric-grid">
        <MetricCard label="销售额" value={formatMoney(Number(stats?.totalRevenue ?? 0))} />
        <MetricCard label="订单数" value={String(stats?.totalOrders ?? orders.length)} />
        <MetricCard label="售出件数" value={String(stats?.totalUnits ?? 0)} />
        <MetricCard label="低库存" value={String(stats?.lowStockCount ?? products.filter((item) => Number(item.stockQuantity ?? 0) <= 5).length)} />
      </div>
      <div className="seller-grid">
        <div className="control-panel">
          <h3>发布商品</h3>
          <label>名称<input value={form.name} onChange={(event) => onForm({ ...form, name: event.target.value })} /></label>
          <label>描述<textarea value={form.description} onChange={(event) => onForm({ ...form, description: event.target.value })} /></label>
          <div className="form-row">
            <label>价格<input value={form.price} onChange={(event) => onForm({ ...form, price: event.target.value })} /></label>
            <label>库存<input value={form.stockQuantity} onChange={(event) => onForm({ ...form, stockQuantity: event.target.value })} /></label>
          </div>
          <label>类别<input value={form.category} onChange={(event) => onForm({ ...form, category: event.target.value })} /></label>
          <label>图片路径<input value={form.imageUrl} onChange={(event) => onForm({ ...form, imageUrl: event.target.value })} /></label>
          <button className="primary-button full" type="button" onClick={onCreateProduct}>发布</button>
        </div>
        <div className="control-panel dark-panel">
          <h3>类别管理</h3>
          <div className="inline-form">
            <input value={categoryName} onChange={(event) => onCategoryName(event.target.value)} />
            <button className="secondary-button" type="button" onClick={onCreateCategory}>添加</button>
          </div>
          <div className="chip-list">
            {categories.map((item) => (
              <button key={item.id} type="button" onClick={() => onDeleteCategory(item.id)}>
                {item.name}
              </button>
            ))}
          </div>
          <div className="download-row">
            <button className="secondary-button" type="button" onClick={onDownloadProducts}>导出商品</button>
            <button className="secondary-button" type="button" onClick={onDownloadOrders}>导出订单</button>
          </div>
          <label className="import-button">
            {importing ? '导入中...' : '导入商品 CSV'}
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
          <small className="import-hint">表头：商品名称,类别,价格,库存,描述,图片链接</small>
        </div>
      </div>
      <div className="table-surface">
        <table>
          <thead>
            <tr>
              <th>商品</th>
              <th>类别</th>
              <th>价格</th>
              <th>库存</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{formatMoney(product.price)}</td>
                <td>{product.stockQuantity}</td>
                <td>
                  <div className="table-actions">
                    <button className="ghost-button" type="button" onClick={() => onEditProduct(product)}>编辑</button>
                    <button className="danger-button" type="button" onClick={() => onDeleteProduct(product)}>下架</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-surface">
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
            {orders.slice(0, 10).map((item) => (
              <tr key={`${item.orderId}-${item.productId}`}>
                <td>#{item.orderId}</td>
                <td>{item.buyerName}</td>
                <td>{item.productName}</td>
                <td>{item.quantity}</td>
                <td>{formatMoney(item.price * item.quantity)}</td>
                <td><span className={`status-pill status-${(item.orderStatus ?? '').toLowerCase()}`}>{orderStatusLabel(item.orderStatus)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="seller-grid">
        <div className="table-surface">
          <div className="section-heading compact-heading">
            <p className="eyebrow">Browse logs</p>
            <h3>我的商品浏览日志</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>用户</th>
                <th>商品</th>
                <th>类别</th>
                <th>停留(秒)</th>
                <th>IP</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              {browseLogs.length === 0 ? (
                <tr><td colSpan={6} className="table-empty">暂无浏览记录</td></tr>
              ) : (
                browseLogs.slice(0, 10).map((log, index) => (
                  <tr key={log.id ?? index}>
                    <td>{log.username ?? '游客'}</td>
                    <td>{log.productName}</td>
                    <td>{log.productCategory}</td>
                    <td>{log.durationSeconds ?? 0}</td>
                    <td>{log.ipAddress ?? '-'}</td>
                    <td>{formatDate(log.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="table-surface">
          <div className="section-heading compact-heading">
            <p className="eyebrow">Purchase logs</p>
            <h3>我的商品购买日志</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>用户</th>
                <th>商品</th>
                <th>类别</th>
                <th>单价</th>
                <th>数量</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              {purchaseLogs.length === 0 ? (
                <tr><td colSpan={6} className="table-empty">暂无购买记录</td></tr>
              ) : (
                purchaseLogs.slice(0, 10).map((log, index) => (
                  <tr key={log.id ?? index}>
                    <td>{log.username ?? '-'}</td>
                    <td>{log.productName}</td>
                    <td>{log.productCategory}</td>
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
    </section>
  );
}
