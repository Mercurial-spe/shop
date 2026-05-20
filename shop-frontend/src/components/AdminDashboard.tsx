import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import type { User } from '../services/api';
import type { Product } from '../types/Product';

interface AdminDashboardProps {
  user: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<User[]>([]);
  const [logSummary, setLogSummary] = useState({
    login: [] as any[],
    browse: [] as any[],
    purchase: [] as any[],
    operation: [] as any[],
  });
  const [sellerForm, setSellerForm] = useState({
    username: '',
    email: '',
    password: 'seller123',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sellerMessage, setSellerMessage] = useState('');
  const [demoResetMessage, setDemoResetMessage] = useState('');

  useEffect(() => {
    Promise.all([
      apiService.getProducts(),
      apiService.getSellers(user.id),
      apiService.getLoginLogs(user.id),
      apiService.getBrowseLogs(user.id),
      apiService.getPurchaseLogs(user.id),
      apiService.getOperationLogs(user.id),
    ])
      .then(([productData, sellerData, loginLogs, browseLogs, purchaseLogs, operationLogs]) => {
        setProducts(productData);
        setSellers(sellerData);
        setLogSummary({
          login: loginLogs,
          browse: browseLogs,
          purchase: purchaseLogs,
          operation: operationLogs,
        });
      })
      .catch((err: any) => setError(err.message || '加载管理数据失败。'))
      .finally(() => setLoading(false));
  }, [user.id]);

  const handleCreateSeller = async (event: React.FormEvent) => {
    event.preventDefault();
    setSellerMessage('');
    setError('');
    try {
      const created = await apiService.createSeller(user.id, sellerForm);
      setSellers((prev) => [...prev, created].sort((a, b) => a.username.localeCompare(b.username)));
      setSellerForm({ username: '', email: '', password: 'seller123' });
      setSellerMessage(`已添加销售人员 ${created.username}`);
    } catch (err: any) {
      setError(err.message || '添加销售人员失败。');
    }
  };

  const handleResetPassword = async (seller: User) => {
    const password = window.prompt(`请输入 ${seller.username} 的新密码`, 'seller123');
    if (!password) return;
    try {
      await apiService.resetSellerPassword(user.id, seller.id, password);
      setSellerMessage(`已重置 ${seller.username} 的密码`);
    } catch (err: any) {
      setError(err.message || '重置密码失败。');
    }
  };

  const handleDeleteSeller = async (seller: User) => {
    const confirmed = window.confirm(`确认删除销售人员 ${seller.username}？有关联商品的销售人员不能直接删除。`);
    if (!confirmed) return;
    try {
      await apiService.deleteSeller(user.id, seller.id);
      setSellers((prev) => prev.filter((item) => item.id !== seller.id));
      setSellerMessage(`已删除销售人员 ${seller.username}`);
    } catch (err: any) {
      setError(err.message || '删除销售人员失败。');
    }
  };

  const refreshDashboard = async () => {
    const [productData, sellerData, loginLogs, browseLogs, purchaseLogs, operationLogs] = await Promise.all([
      apiService.getProducts(),
      apiService.getSellers(user.id),
      apiService.getLoginLogs(user.id),
      apiService.getBrowseLogs(user.id),
      apiService.getPurchaseLogs(user.id),
      apiService.getOperationLogs(user.id),
    ]);
    setProducts(productData);
    setSellers(sellerData);
    setLogSummary({
      login: loginLogs,
      browse: browseLogs,
      purchase: purchaseLogs,
      operation: operationLogs,
    });
  };

  const handleResetDemoData = async () => {
    const confirmed = window.confirm('确认重置并生成演示数据？这会清空当前商品、订单、购物车和日志，但保留测试账号。');
    if (!confirmed) return;
    setDemoResetMessage('');
    setError('');
    try {
      const summary = await apiService.resetDemoData(user.id);
      await refreshDashboard();
      setDemoResetMessage(
        `已生成 ${summary.products} 个商品、${summary.orders} 个订单、${summary.browseLogs} 条浏览日志、${summary.purchaseLogs} 条购买日志。`
      );
    } catch (err: any) {
      setError(err.message || '重置演示数据失败。');
    }
  };

  const handleDownloadSalesReport = async () => {
    setError('');
    try {
      await apiService.downloadAdminSalesReport(user.id);
    } catch (err: any) {
      setError(err.message || '导出销售报表失败。');
    }
  };

  const lowStockProducts = products.filter((product) => (product.stockQuantity ?? 0) <= 5);
  const totalInventory = products.reduce((sum, product) => sum + (product.stockQuantity ?? 0), 0);
  const averagePrice = products.length
    ? products.reduce((sum, product) => sum + product.price, 0) / products.length
    : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-slate-300">
        <div className="w-12 h-12 border-4 border-white/20 border-t-violet-300 rounded-full animate-spin"></div>
        <p className="font-medium">正在加载管理控制台...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/15 bg-slate-950/70 p-8 text-white shadow-2xl shadow-slate-950/30 backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-violet-300">Admin Command Center</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight">管理者控制台</h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              当前账号 {user.username}，用于销售人员管理、全局销售监控、库存预警和演示数据维护。
            </p>
          </div>
          <div className="rounded-2xl border border-violet-300/30 bg-violet-400/10 px-5 py-3 text-sm font-bold text-violet-100">
            公开测试账号：admin / admin123
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-300/30 bg-red-500/10 p-4 font-semibold text-red-100">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-white/15 bg-white/10 p-6 text-white backdrop-blur">
          <p className="text-sm text-slate-300">销售人员</p>
          <p className="mt-2 text-4xl font-black">{sellers.length}</p>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/10 p-6 text-white backdrop-blur">
          <p className="text-sm text-slate-300">总库存</p>
          <p className="mt-2 text-4xl font-black">{totalInventory}</p>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/10 p-6 text-white backdrop-blur">
          <p className="text-sm text-slate-300">平均标价</p>
          <p className="mt-2 text-4xl font-black">¥{averagePrice.toFixed(0)}</p>
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-6 text-white backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black">系统维护 / 演示数据</h2>
            <p className="mt-2 text-sm text-emerald-50/80">
              一键生成 30 天订单、登录/浏览/购买/操作日志，以及低库存和销量突增样本。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDownloadSalesReport}
              className="rounded-xl border border-emerald-200/30 bg-white/10 px-5 py-3 text-sm font-black text-emerald-50 transition hover:bg-white/20"
            >
              导出销售 CSV
            </button>
            <button
              type="button"
              onClick={handleResetDemoData}
              className="rounded-xl bg-emerald-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-200"
            >
              重置演示数据
            </button>
          </div>
        </div>
        {demoResetMessage && (
          <div className="mt-4 rounded-2xl border border-emerald-200/20 bg-slate-950/40 p-3 text-sm font-semibold text-emerald-100">
            {demoResetMessage}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-white/15 bg-white/10 p-6 text-white backdrop-blur">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-black">数据采集日志</h2>
            <p className="mt-1 text-sm text-slate-300">覆盖登录、浏览、购买、管理操作四类课程要求数据。</p>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-200">Latest 100</span>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ['登录日志', logSummary.login.length],
            ['浏览日志', logSummary.browse.length],
            ['购买日志', logSummary.purchase.length],
            ['操作日志', logSummary.operation.length],
          ].map(([label, count]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-300">{label}</p>
              <p className="mt-2 text-3xl font-black">{count}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {logSummary.browse.slice(0, 3).map((log) => (
            <div key={`browse-${log.id}`} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm font-bold text-cyan-100">浏览：{log.productName}</p>
              <p className="mt-1 text-xs text-slate-300">
                {log.username || '游客'} / {log.productCategory || '未分类'} / 停留 {log.durationSeconds ?? 0}s / {log.ipAddress || 'unknown'}
              </p>
            </div>
          ))}
          {logSummary.operation.slice(0, 3).map((log) => (
            <div key={`operation-${log.id}`} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm font-bold text-violet-100">操作：{log.action}</p>
              <p className="mt-1 text-xs text-slate-300">
                {log.username} / {log.content} / {log.ipAddress || 'unknown'}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/15 bg-white/10 p-6 text-white backdrop-blur">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-black">销售人员管理</h2>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-200">Admin only</span>
          </div>

          <form onSubmit={handleCreateSeller} className="mb-5 grid gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 md:grid-cols-[1fr_1fr_1fr_auto]">
            <input
              value={sellerForm.username}
              onChange={(event) => setSellerForm((prev) => ({ ...prev, username: event.target.value }))}
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-violet-300"
              placeholder="销售账号"
              required
            />
            <input
              type="email"
              value={sellerForm.email}
              onChange={(event) => setSellerForm((prev) => ({ ...prev, email: event.target.value }))}
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-violet-300"
              placeholder="邮箱"
              required
            />
            <input
              value={sellerForm.password}
              onChange={(event) => setSellerForm((prev) => ({ ...prev, password: event.target.value }))}
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-violet-300"
              placeholder="初始密码"
              required
            />
            <button className="rounded-xl bg-violet-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-violet-200">
              添加
            </button>
          </form>

          {sellerMessage && (
            <div className="mb-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm font-semibold text-emerald-100">
              {sellerMessage}
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            {sellers.map((seller) => (
              <div key={seller.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className="text-lg font-black">{seller.username}</p>
                <p className="mt-1 text-sm font-semibold text-violet-200">{seller.email || '未设置邮箱'}</p>
                <p className="mt-2 text-sm text-slate-300">角色：销售人员 / 可管理自己的商品和订单。</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleResetPassword(seller)}
                    className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/20"
                  >
                    重置密码
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSeller(seller)}
                    className="rounded-xl bg-red-400/15 px-4 py-2 text-sm font-bold text-red-100 transition hover:bg-red-400/25"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-amber-300/20 bg-amber-400/10 p-6 text-white backdrop-blur">
          <h2 className="text-2xl font-black">异常预警</h2>
          <p className="mt-2 text-sm text-amber-100/80">当前先展示低库存预警，后续补销量突增、低迷和高频浏览。</p>
          <div className="mt-5 space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="rounded-2xl bg-white/10 p-4 text-sm text-slate-200">暂无低库存商品。</p>
            ) : (
              lowStockProducts.map((product) => (
                <div key={product.id} className="rounded-2xl border border-amber-200/20 bg-slate-950/40 p-4">
                  <p className="font-black">{product.name}</p>
                  <p className="mt-1 text-sm text-amber-100">库存剩余 {product.stockQuantity ?? 0}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
