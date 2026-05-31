import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import { apiService, type CartItem, type ProductCategory, type RecommendationProduct, type User } from './services/api';
import type { Product } from './types/Product';
import { ProductDrawer } from './components/ProductDrawer';
import { PaymentModal } from './components/PaymentModal';
import { OrderDetailModal } from './components/OrderDetailModal';
import { ProductEditModal } from './components/ProductEditModal';
import { PasswordResetModal } from './components/PasswordResetModal';
import { DEMO_CREDENTIALS, FALLBACK_PRODUCTS, emptyProductForm } from './data/storefront';
import { PATH_VIEWS, VIEW_PATHS, viewForRole, viewFromPath } from './routes/views';
import type {
  AnalyticsAnomalies,
  AnalyticsOverview,
  AnalyticsRankings,
  AnalyticsTrends,
  AuthForm,
  CustomerProfile,
  LogSummary,
  LoginLog,
  LoginMode,
  Order,
  Period,
  SellerBrowseLog,
  SellerOrderItem,
  SellerPurchaseLog,
  SellerStats,
  View,
} from './types/app';
import { formatMoney } from './utils/format';
import { AdminView } from './views/AdminView';
import { CartView } from './views/CartView';
import { LoginView } from './views/LoginView';
import { OrdersView } from './views/OrdersView';
import { SellerView } from './views/SellerView';
import { ShopView } from './views/ShopView';

const timestamp = (value?: string) => {
  const parsed = Date.parse(value ?? '');
  return Number.isNaN(parsed) ? 0 : parsed;
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const view = viewFromPath(location.pathname);
  const [loginMode, setLoginMode] = useState<LoginMode>('login');
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('mercurial-shop-user');
    return raw ? (JSON.parse(raw) as User) : null;
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RecommendationProduct[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('全部');
  const [sort, setSort] = useState('featured');
  const [authForm, setAuthForm] = useState<AuthForm>({ username: 'customer01', password: 'customer123', email: 'customer@example.com', role: 'CUSTOMER' });
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [categoryName, setCategoryName] = useState('智能生活');
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [sellerOrders, setSellerOrders] = useState<SellerOrderItem[]>([]);
  const [sellerStats, setSellerStats] = useState<SellerStats | null>(null);
  const [sellerBrowseLogs, setSellerBrowseLogs] = useState<SellerBrowseLog[]>([]);
  const [sellerPurchaseLogs, setSellerPurchaseLogs] = useState<SellerPurchaseLog[]>([]);
  const [sellers, setSellers] = useState<User[]>([]);
  const [sellerForm, setSellerForm] = useState({ username: 'seller-new', email: 'seller-new@example.com', password: 'seller123' });
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [rankings, setRankings] = useState<AnalyticsRankings | null>(null);
  const [trends, setTrends] = useState<AnalyticsTrends | null>(null);
  const [anomalies, setAnomalies] = useState<AnalyticsAnomalies | null>(null);
  const [anomaliesUpdatedAt, setAnomaliesUpdatedAt] = useState('');
  const [profiles, setProfiles] = useState<CustomerProfile[]>([]);
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [logSummary, setLogSummary] = useState<LogSummary | null>(null);
  const [period, setPeriod] = useState<Period>('day');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [resettingSeller, setResettingSeller] = useState<User | null>(null);

  const roleClass = user ? `role-${user.role.toLowerCase()}` : 'role-guest';
  const canShop = !user || user.role === 'CUSTOMER';

  const roleBadge = (() => {
    if (!user) return '逛客模式';
    if (user.role === 'SELLER') return '销售工作台';
    if (user.role === 'ADMIN') return '管理控制台';
    return '顾客中心';
  })();

  const setView = (nextView: View, options?: { replace?: boolean }) => {
    navigate(VIEW_PATHS[nextView], options);
  };

  const runAction = async (key: string, task: () => Promise<void>) => {
    if (actionBusy) {
      return;
    }
    setActionBusy(key);
    try {
      await task();
    } finally {
      setActionBusy((current) => (current === key ? null : current));
    }
  };

  const openView = (nextView: View) => {
    if (!user && (nextView === 'cart' || nextView === 'orders')) {
      setLoginMode('login');
      setView('login');
      setNotice('请先登录顾客账号，再继续查看购物车或订单。');
      return;
    }
    setView(nextView);
  };

  const navItems = useMemo(() => {
    const role = user?.role;
    const items: { key: View; label: string }[] = [{ key: 'shop', label: '商店' }];
    if (!role || role === 'CUSTOMER') {
      items.push({ key: 'cart', label: `购物车 ${cart.length}` });
      items.push({ key: 'orders', label: '订单' });
    }
    if (role === 'SELLER') {
      items.push({ key: 'seller', label: '销售台' });
    }
    if (role === 'ADMIN') {
      items.push({ key: 'admin', label: '管理台' });
    }
    return items;
  }, [cart.length, user?.role]);

  const categoryOptions = useMemo(() => {
    const names = new Set(products.map((product) => product.category).filter(Boolean) as string[]);
    categories.forEach((item) => names.add(item.name));
    return ['全部', ...Array.from(names)];
  }, [categories, products]);

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery) ||
        (product.category ?? '').toLowerCase().includes(normalizedQuery);
      const matchesCategory = category === '全部' || product.category === category;
      return matchesQuery && matchesCategory;
    });

    return filtered.sort((a, b) => {
      if (sort === 'priceAsc') {
        return a.price - b.price;
      }
      if (sort === 'priceDesc') {
        return b.price - a.price;
      }
      if (sort === 'stock') {
        return Number(a.stockQuantity ?? 0) - Number(b.stockQuantity ?? 0);
      }
      if (sort === 'new') {
        return Number(b.id ?? 0) - Number(a.id ?? 0);
      }
      return Number(b.stockQuantity ?? 0) - Number(a.stockQuantity ?? 0);
    });
  }, [category, products, query, sort]);

  const heroStats = useMemo(() => {
    const totalStock = products.reduce((sum, product) => sum + Number(product.stockQuantity ?? 0), 0);
    const averagePrice = products.length ? products.reduce((sum, product) => sum + product.price, 0) / products.length : 0;
    return [
      { label: '在售商品', value: products.length.toString() },
      { label: '库存件数', value: totalStock.toString() },
      { label: '均价', value: formatMoney(averagePrice) },
    ];
  }, [products]);

  useEffect(() => {
    localStorage.setItem('mercurial-shop-user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    void loadStorefront();
    // The storefront bootstrap intentionally runs once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (location.pathname === '/') {
      setView('shop', { replace: true });
      return;
    }

    if (!PATH_VIEWS[location.pathname]) {
      setView('shop', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if ((view === 'cart' || view === 'orders') && !user) {
      setLoginMode('login');
      setNotice('请先登录顾客账号，再继续查看购物车或订单。');
      setView('login', { replace: true });
      return;
    }

    if (view === 'seller' && user?.role !== 'SELLER') {
      setLoginMode('login');
      setNotice(user ? '当前账号不是销售角色，已返回对应工作区。' : '请先登录销售账号。');
      setView(user ? viewForRole(user.role) : 'login', { replace: true });
      return;
    }

    if (view === 'admin' && user?.role !== 'ADMIN') {
      setLoginMode('login');
      setNotice(user ? '当前账号不是管理员角色，已返回对应工作区。' : '请先登录管理员账号。');
      setView(user ? viewForRole(user.role) : 'login', { replace: true });
    }
    // Route guards intentionally depend on the derived route and active role.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, view]);

  useEffect(() => {
    if (!user) {
      setCart([]);
      setOrders([]);
      setRecommendations([]);
      return;
    }

    if (user.role === 'CUSTOMER') {
      void Promise.all([loadCart(user.id), loadOrders(user.id), loadRecommendations(user.id)]);
    }

    if (user.role === 'SELLER') {
      setView('seller');
      void loadSellerWorkspace(user.id);
    }

    if (user.role === 'ADMIN') {
      setView('admin');
      void loadAdminWorkspace(user.id, period);
    }
    // Workspace loaders are event-style functions; rerun only when the active role or trend period changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, user]);

  useEffect(() => {
    if (view !== 'admin' || user?.role !== 'ADMIN') {
      return;
    }
    const adminId = user.id;
    let cancelled = false;
    const refreshAnomalies = async () => {
      try {
        const next = (await apiService.getAnalyticsAnomalies(adminId)) as AnalyticsAnomalies;
        if (!cancelled) {
          setAnomalies(next);
          setAnomaliesUpdatedAt(new Date().toLocaleTimeString('zh-CN', { hour12: false }));
        }
      } catch {
        // 轮询失败静默跳过，下个周期再试
      }
    };
    void refreshAnomalies();
    const timer = window.setInterval(() => void refreshAnomalies(), 15000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [view, user]);

  const reportError = (error: unknown, fallback: string) => {
    setNotice(error instanceof Error ? error.message : fallback);
  };

  const loadStorefront = async () => {
    setLoading(true);
    try {
      const [nextProducts, nextCategories] = await Promise.all([apiService.getProducts(), apiService.getCategories()]);
      setProducts(nextProducts.length ? nextProducts : FALLBACK_PRODUCTS);
      setCategories(nextCategories);
      setNotice('');
    } catch (error) {
      setProducts(FALLBACK_PRODUCTS);
      setCategories([]);
      reportError(error, '后端暂不可用，已展示本地演示商品。');
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async (userId: number) => {
    try {
      setCart(await apiService.getCart(userId));
    } catch (error) {
      reportError(error, '购物车加载失败。');
    }
  };

  const loadOrders = async (userId: number) => {
    try {
      const nextOrders = (await apiService.getOrdersByUser(userId)) as Order[];
      setOrders([...nextOrders].sort((a, b) => timestamp(b.createdAt) - timestamp(a.createdAt)));
    } catch (error) {
      reportError(error, '订单加载失败。');
    }
  };

  const loadRecommendations = async (userId: number) => {
    try {
      setRecommendations(await apiService.getUserRecommendations(userId, 6));
    } catch {
      setRecommendations([]);
    }
  };

  const loadRelated = async (product: Product) => {
    setSelectedProduct(product);
    try {
      await apiService.recordBrowse(product.id, user?.id ?? null, 24 + Math.floor(Math.random() * 90));
      setRelatedProducts(await apiService.getRelatedProducts(product.id, user?.id, 4));
    } catch {
      setRelatedProducts([]);
    }
  };

  const loadSellerWorkspace = async (sellerId: number) => {
    try {
      const [ownedProducts, orderItems, stats, nextCategories, browseLogs, purchaseLogs] = await Promise.all([
        apiService.getProductsBySeller(sellerId),
        apiService.getOrdersBySeller(sellerId),
        apiService.getSellerStats(sellerId),
        apiService.getCategories(),
        apiService.getSellerBrowseLogs(sellerId),
        apiService.getSellerPurchaseLogs(sellerId),
      ]);
      setSellerProducts(ownedProducts);
      setSellerOrders(
        [...(orderItems as SellerOrderItem[])].sort(
          (a, b) => timestamp(b.orderCreatedAt) - timestamp(a.orderCreatedAt),
        ),
      );
      setSellerStats(stats as SellerStats);
      setCategories(nextCategories);
      setSellerBrowseLogs(browseLogs as SellerBrowseLog[]);
      setSellerPurchaseLogs(purchaseLogs as SellerPurchaseLog[]);
    } catch (error) {
      reportError(error, '销售台加载失败。');
    }
  };

  const loadAdminWorkspace = async (adminId: number, nextPeriod: Period) => {
    try {
      const [sellerUsers, nextOverview, nextRankings, nextTrends, nextAnomalies, nextProfiles, loginLogs, operationLogs, summary] =
        await Promise.all([
          apiService.getSellers(adminId),
          apiService.getAnalyticsOverview(adminId),
          apiService.getAnalyticsRankings(adminId),
          apiService.getAnalyticsTrends(adminId, nextPeriod),
          apiService.getAnalyticsAnomalies(adminId),
          apiService.getCustomerProfiles(adminId),
          apiService.getLoginLogs(adminId),
          apiService.getOperationLogs(adminId),
          apiService.getLogSummary(adminId),
        ]);
      setSellers(sellerUsers);
      setOverview(nextOverview as AnalyticsOverview);
      setRankings(nextRankings as AnalyticsRankings);
      setTrends(nextTrends as AnalyticsTrends);
      setAnomalies(nextAnomalies as AnalyticsAnomalies);
      setAnomaliesUpdatedAt(new Date().toLocaleTimeString('zh-CN', { hour12: false }));
      setProfiles(nextProfiles as CustomerProfile[]);
      setLogs([...(loginLogs as LoginLog[]).slice(0, 5), ...(operationLogs as LoginLog[]).slice(0, 5)]);
      setLogSummary(summary as LogSummary);
    } catch (error) {
      reportError(error, '管理台加载失败，请确认当前账号是管理员。');
    }
  };

  const handleAuth = async () => {
    await runAction('auth', async () => {
      try {
        const nextUser =
          loginMode === 'login'
            ? await apiService.login(authForm.username, authForm.password)
            : await apiService.register(
                authForm.username,
                authForm.password,
                authForm.role as 'CUSTOMER' | 'SELLER',
                authForm.email,
              );
        setUser(nextUser);
        setView(viewForRole(nextUser.role));
        setNotice(`已进入 ${nextUser.username} 的工作区`);
      } catch (error) {
        reportError(error, '认证失败。');
      }
    });
  };

  const quickLogin = async (username: string, password: string) => {
    await runAction(`quick-${username}`, async () => {
      try {
        const nextUser = await apiService.login(username, password);
        setAuthForm({ ...authForm, username, password });
        setUser(nextUser);
        setView(viewForRole(nextUser.role));
        setNotice(`已进入 ${nextUser.username} 的工作区`);
      } catch (error) {
        reportError(error, '快捷登录失败。');
      }
    });
  };

  const logout = () => {
    setUser(null);
    setView('shop');
    setNotice('已退出当前账号。');
  };

  const requireCustomer = () => {
    if (!user) {
      setLoginMode('login');
      setView('login');
      setNotice('请先登录顾客账号，再继续购物。');
      return false;
    }
    if (user.role !== 'CUSTOMER') {
      setNotice('购物车与下单流程仅对顾客账号开放。');
      return false;
    }
    return true;
  };

  const addToCart = async (product: Product) => {
    if (!requireCustomer() || !user) {
      return;
    }
    await runAction(`cart-${product.id}`, async () => {
      try {
        await apiService.addToCart(user.id, product.id, 1);
        await loadCart(user.id);
        setNotice(`${product.name} 已加入购物车。`);
      } catch (error) {
        reportError(error, '加入购物车失败。');
      }
    });
  };

  const buyNow = async (product: Product) => {
    if (!requireCustomer() || !user) {
      return;
    }
    await runAction(`buy-${product.id}`, async () => {
      try {
        const order = (await apiService.purchaseProduct(product.id, user.id, 1)) as Order;
        await loadOrders(user.id);
        setView('orders');
        setSelectedProduct(null);
        setPayingOrder(order);
        setNotice(`订单 #${order.id} 已创建，请完成模拟支付。`);
      } catch (error) {
        reportError(error, '立即购买失败。');
      }
    });
  };

  const removeCartItem = async (itemId: number) => {
    if (!user) {
      return;
    }
    try {
      await apiService.removeFromCart(user.id, itemId);
      await loadCart(user.id);
    } catch (error) {
      reportError(error, '移除商品失败。');
    }
  };

  const checkout = async () => {
    if (!requireCustomer() || !user) {
      return;
    }
    await runAction('checkout', async () => {
      try {
        const order = (await apiService.checkoutCart(user.id)) as Order;
        await Promise.all([loadCart(user.id), loadOrders(user.id)]);
        setView('orders');
        setPayingOrder(order);
        setNotice(`购物车已结算为订单 #${order.id}，请完成模拟支付。`);
      } catch (error) {
        reportError(error, '结算失败。');
      }
    });
  };

  // 顾客点击「去支付」：打开模拟支付弹窗选择支付方式
  const openPayment = (order: Order) => {
    setDetailOrder(null);
    setPayingOrder(order);
  };

  const confirmPayment = async (method: string) => {
    if (!user || !payingOrder) {
      return;
    }
    const orderId = payingOrder.id;
    await runAction(`pay-${orderId}`, async () => {
      try {
        await apiService.payOrder(orderId, user.id, method);
        await Promise.all([loadOrders(user.id), loadStorefront()]);
        setPayingOrder(null);
        setNotice(`订单 #${orderId} 已通过${method}支付，后端会发送邮件确认。`);
      } catch (error) {
        reportError(error, '支付失败。');
      }
    });
  };

  const createProduct = async () => {
    if (!user || user.role !== 'SELLER') {
      return;
    }
    try {
      await apiService.createProduct({
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        category: productForm.category,
        stockQuantity: Number(productForm.stockQuantity),
        imageUrl: productForm.imageUrl,
        sellerId: user.id,
      });
      setProductForm(emptyProductForm);
      await Promise.all([loadSellerWorkspace(user.id), loadStorefront()]);
      setNotice('商品已发布。');
    } catch (error) {
      reportError(error, '商品发布失败。');
    }
  };

  const saveProductEdit = async (updates: Partial<Product>) => {
    if (!user || user.role !== 'SELLER' || !editingProduct) {
      return;
    }
    const target = editingProduct;
    await runAction(`edit-${target.id}`, async () => {
      try {
        await apiService.updateProduct(target.id, user.id, { ...target, ...updates });
        await Promise.all([loadSellerWorkspace(user.id), loadStorefront()]);
        setEditingProduct(null);
        setNotice(`${updates.name ?? target.name} 已更新。`);
      } catch (error) {
        reportError(error, '商品更新失败。');
      }
    });
  };

  const deleteSellerProduct = async (product: Product) => {
    if (!user || user.role !== 'SELLER') {
      return;
    }
    try {
      await apiService.deleteProduct(product.id, user.id);
      await Promise.all([loadSellerWorkspace(user.id), loadStorefront()]);
      setNotice(`${product.name} 已下架。`);
    } catch (error) {
      reportError(error, '商品下架失败。');
    }
  };

  const createCategory = async () => {
    if (!user || user.role !== 'SELLER') {
      return;
    }
    try {
      await apiService.createCategory(user.id, categoryName);
      await loadSellerWorkspace(user.id);
      setNotice('商品类别已添加。');
    } catch (error) {
      reportError(error, '类别添加失败。');
    }
  };

  const deleteCategory = async (categoryId: number) => {
    if (!user || user.role !== 'SELLER') {
      return;
    }
    try {
      await apiService.deleteCategory(user.id, categoryId);
      await loadSellerWorkspace(user.id);
    } catch (error) {
      reportError(error, '类别删除失败。');
    }
  };

  const importSellerProducts = async (file: File) => {
    if (!user || user.role !== 'SELLER') {
      return;
    }
    await runAction('import-products', async () => {
      try {
        const text = await file.text();
        const result = await apiService.importSellerProducts(user.id, text);
        await Promise.all([loadSellerWorkspace(user.id), loadStorefront()]);
        const failHint = result.failed > 0 ? `，失败 ${result.failed} 行（第 ${result.failures.map((f) => f.row).join('、')} 行）` : '';
        setNotice(`商品导入完成：成功 ${result.imported} 行${failHint}。`);
      } catch (error) {
        reportError(error, '商品导入失败。');
      }
    });
  };

  const createSeller = async () => {
    if (!user || user.role !== 'ADMIN') {
      return;
    }
    try {
      await apiService.createSeller(user.id, sellerForm);
      await loadAdminWorkspace(user.id, period);
      setNotice('销售人员已添加。');
    } catch (error) {
      reportError(error, '销售人员添加失败。');
    }
  };

  const confirmResetPassword = async (password: string) => {
    if (!user || user.role !== 'ADMIN' || !resettingSeller) {
      return;
    }
    const sellerId = resettingSeller.id;
    await runAction(`reset-${sellerId}`, async () => {
      try {
        await apiService.resetSellerPassword(user.id, sellerId, password);
        setResettingSeller(null);
        setNotice(`${resettingSeller.username} 的密码已重置。`);
      } catch (error) {
        reportError(error, '密码重置失败。');
      }
    });
  };

  const deleteSeller = async (sellerId: number) => {
    if (!user || user.role !== 'ADMIN') {
      return;
    }
    try {
      await apiService.deleteSeller(user.id, sellerId);
      await loadAdminWorkspace(user.id, period);
      setNotice('销售人员已删除。');
    } catch (error) {
      reportError(error, '删除销售人员失败。');
    }
  };

  const resetDemoData = async () => {
    if (!user || user.role !== 'ADMIN') {
      return;
    }
    try {
      const result = await apiService.resetDemoData(user.id);
      await Promise.all([loadStorefront(), loadAdminWorkspace(user.id, period)]);
      setNotice(`演示数据已重置：商品 ${result.products ?? 0}，订单 ${result.orders ?? 0}。`);
    } catch (error) {
      reportError(error, '演示数据重置失败。');
    }
  };

  return (
    <main className={`app-shell ${roleClass}`}>
      <div className="paper-grain" />
      <header className="topbar">
        <button className="brand-mark" type="button" onClick={() => setView('shop')}>
          <span className="brand-sun">M</span>
          <span>
            <strong className="brand-title" aria-label="Mercurial Shop">
              {'Mercurial Shop'.split('').map((char, index) => (
                <span
                  aria-hidden="true"
                  className="brand-letter"
                  key={`${char}-${index}`}
                  style={{ '--i': index } as CSSProperties}
                >
                  {char === ' ' ? ' ' : char}
                </span>
              ))}
            </strong>
            <small>course commerce lab</small>
          </span>
        </button>

        <nav className="main-nav" aria-label="主导航">
          {navItems.map((item) => (
            <button className={view === item.key ? 'active' : ''} key={item.key} type="button" onClick={() => openView(item.key)}>
              {item.label}
            </button>
          ))}
        </nav>

        <section className="account-panel">
          <span className="role-badge">{roleBadge}</span>
          {user ? (
            <>
              <span>{user.username}</span>
              <small>{user.role}</small>
              <button className="ghost-button" type="button" onClick={logout}>
                退出
              </button>
            </>
          ) : (
            <button className="primary-button compact" type="button" onClick={() => setView('login')}>
              登录
            </button>
          )}
        </section>
      </header>

      {notice && (
        <aside className="notice" role="status" aria-live="polite">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} aria-label="关闭通知">
            ×
          </button>
        </aside>
      )}

      {view === 'shop' && (
        <section className="market-masthead">
          <div className="market-search-panel">
            <p className="eyebrow">Mercurial market</p>
            <div className="market-search-box">
              <span>全站搜索</span>
              <input placeholder="试试 Aurora、电脑办公、智能配件" value={query} onChange={(event) => setQuery(event.target.value)} />
              <button className="primary-button" type="button">搜索</button>
            </div>
            <div className="hot-links" aria-label="热门类目">
              {categoryOptions.filter((item) => item !== '全部').slice(0, 6).map((item) => (
                <button className={category === item ? 'active' : ''} key={item} type="button" onClick={() => { setCategory(item); setQuery(''); }}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="market-promise">
            {heroStats.map((stat) => (
              <span key={stat.label}>
                <strong>{stat.value}</strong>
                <small>{stat.label}</small>
              </span>
            ))}
          </div>
        </section>
      )}

      <section className={`workspace ${view === 'shop' ? 'market-workspace' : ''} ${view === 'login' ? 'login-workspace' : ''}`}>
        {view !== 'shop' && view !== 'login' && (
          <aside className="auth-dock">
          <div className="section-heading compact-heading">
            <p className="eyebrow">Role entrance</p>
            <h2>{user ? '当前会话' : '登录 / 注册'}</h2>
          </div>
          {!user ? (
            <div className="auth-card">
              <div className="segmented">
                <button className={loginMode === 'login' ? 'active' : ''} type="button" onClick={() => setLoginMode('login')}>
                  登录
                </button>
                <button className={loginMode === 'register' ? 'active' : ''} type="button" onClick={() => setLoginMode('register')}>
                  注册
                </button>
              </div>
              <label>
                用户名
                <input value={authForm.username} onChange={(event) => setAuthForm({ ...authForm, username: event.target.value })} />
              </label>
              <label>
                密码
                <input type="password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} />
              </label>
              {loginMode === 'register' && (
                <>
                  <label>
                    邮箱
                    <input value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} />
                  </label>
                  <label>
                    角色
                    <select value={authForm.role} onChange={(event) => setAuthForm({ ...authForm, role: event.target.value as AuthForm['role'] })}>
                      <option value="CUSTOMER">顾客</option>
                      <option value="SELLER">销售</option>
                    </select>
                  </label>
                </>
              )}
              <button className="primary-button full" type="button" onClick={() => void handleAuth()}>
                {loginMode === 'login' ? '进入商城' : '创建账号'}
              </button>
              <div className="demo-logins">
                {DEMO_CREDENTIALS.map((item) => (
                  <button
                    key={item.username}
                    type="button"
                    onClick={() => {
                      setLoginMode('login');
                      setAuthForm({ ...authForm, username: item.username, password: item.password });
                    }}
                  >
                    <span>{item.role}</span>
                    <strong>{item.username}</strong>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="session-card">
              <span className="role-chip">{user.role}</span>
              <h3>{user.username}</h3>
              <p>已连接到后端角色权限，页面入口会按 Customer / Seller / Admin 自动展开。</p>
            </div>
          )}
          </aside>
        )}

        <div className="view-stage">
          {view === 'login' && (
            <LoginView
              actionBusy={actionBusy}
              authForm={authForm}
              loginMode={loginMode}
              onAuth={() => void handleAuth()}
              onBack={() => setView('shop')}
              onForm={setAuthForm}
              onMode={setLoginMode}
              onQuickLogin={(username, password) => void quickLogin(username, password)}
            />
          )}

          {view === 'shop' && (
            <ShopView
              actionBusy={actionBusy}
              canShop={canShop}
              loading={loading}
              products={visibleProducts}
              allProducts={products}
              recommendations={recommendations}
              category={category}
              categoryOptions={categoryOptions}
              cartCount={cart.length}
              sort={sort}
              stats={heroStats}
              user={user}
              onAdd={addToCart}
              onBuy={buyNow}
              onCategory={setCategory}
              onInspect={(product) => void loadRelated(product)}
              onQuickLogin={(username, password) => void quickLogin(username, password)}
              onQuery={setQuery}
              onSort={setSort}
              onView={setView}
            />
          )}

          {view === 'cart' && <CartView actionBusy={actionBusy} cart={cart} onCheckout={() => void checkout()} onRemove={(id) => void removeCartItem(id)} />}

          {view === 'orders' && (
            <OrdersView
              actionBusy={actionBusy}
              orders={orders}
              onPay={(order) => openPayment(order)}
              onDetail={(order) => setDetailOrder(order)}
            />
          )}

          {view === 'seller' && (
            <SellerView
              categories={categories}
              categoryName={categoryName}
              form={productForm}
              orders={sellerOrders}
              products={sellerProducts}
              stats={sellerStats}
              browseLogs={sellerBrowseLogs}
              purchaseLogs={sellerPurchaseLogs}
              importing={actionBusy === 'import-products'}
              onCategoryName={setCategoryName}
              onCreateCategory={() => void createCategory()}
              onCreateProduct={() => void createProduct()}
              onDeleteCategory={(id) => void deleteCategory(id)}
              onDeleteProduct={(product) => void deleteSellerProduct(product)}
              onDownloadOrders={() => user && void apiService.downloadSellerOrdersReport(user.id)}
              onDownloadProducts={() => user && void apiService.downloadSellerProductsReport(user.id)}
              onImportProducts={(file) => void importSellerProducts(file)}
              onForm={setProductForm}
              onEditProduct={(product) => setEditingProduct(product)}
            />
          )}

          {view === 'admin' && (
            <AdminView
              anomalies={anomalies}
              anomaliesUpdatedAt={anomaliesUpdatedAt}
              form={sellerForm}
              logs={logs}
              logSummary={logSummary}
              overview={overview}
              period={period}
              profiles={profiles}
              rankings={rankings}
              sellers={sellers}
              trends={trends}
              onCreateSeller={() => void createSeller()}
              onDeleteSeller={(id) => void deleteSeller(id)}
              onDownload={() => user && void apiService.downloadAdminSalesReport(user.id)}
              onForm={setSellerForm}
              onPeriod={setPeriod}
              onResetDemo={() => void resetDemoData()}
              onResetPassword={(id) => {
                const target = sellers.find((seller) => seller.id === id);
                if (target) {
                  setResettingSeller(target);
                }
              }}
            />
          )}
        </div>
      </section>

      {selectedProduct && (
        <ProductDrawer
          canShop={canShop}
          product={selectedProduct}
          related={relatedProducts}
          onAdd={addToCart}
          onBuy={buyNow}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {payingOrder && (
        <PaymentModal
          order={payingOrder}
          busy={actionBusy === `pay-${payingOrder.id}`}
          onClose={() => setPayingOrder(null)}
          onConfirm={(method) => void confirmPayment(method)}
        />
      )}

      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          busy={actionBusy === `pay-${detailOrder.id}`}
          onClose={() => setDetailOrder(null)}
          onPay={(order) => openPayment(order)}
        />
      )}

      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          categories={categoryOptions.filter((item) => item !== '全部')}
          busy={actionBusy === `edit-${editingProduct.id}`}
          onClose={() => setEditingProduct(null)}
          onSave={(updates) => void saveProductEdit(updates)}
        />
      )}

      {resettingSeller && (
        <PasswordResetModal
          seller={resettingSeller}
          busy={actionBusy === `reset-${resettingSeller.id}`}
          onClose={() => setResettingSeller(null)}
          onConfirm={(password) => void confirmResetPassword(password)}
        />
      )}
    </main>
  );
}

export default App;
