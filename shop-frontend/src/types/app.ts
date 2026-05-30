import type { User } from '../services/api';
import type { Product } from './Product';

export type View = 'shop' | 'login' | 'cart' | 'orders' | 'seller' | 'admin';
export type LoginMode = 'login' | 'register';
export type Period = 'day' | 'week' | 'month';

export type AuthForm = {
  username: string;
  password: string;
  email: string;
  role: 'CUSTOMER' | 'SELLER';
};

export type ProductForm = {
  name: string;
  description: string;
  price: string;
  category: string;
  stockQuantity: string;
  imageUrl: string;
};

export type DemoCredential = {
  role: string;
  userRole: User['role'];
  username: string;
  password: string;
  note: string;
};

export interface OrderItem {
  id?: number;
  product?: Product;
  productName?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  status: string;
  createdAt?: string;
  paymentMethod?: string;
  paymentNo?: string;
  paidAt?: string;
  shippedAt?: string;
  receivedAt?: string;
  items?: OrderItem[];
}

export interface SellerOrderItem {
  orderId: number;
  orderStatus: string;
  orderCreatedAt: string;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  buyerId: number;
  buyerName: string;
}

export interface SellerStats {
  totalRevenue?: number;
  totalOrders?: number;
  totalUnits?: number;
  lowStockCount?: number;
  [key: string]: unknown;
}

export interface Metric {
  id?: number;
  name: string;
  revenue?: number;
  quantity?: number;
  units?: number;
  count?: number;
  period?: string;
}

export interface Forecast {
  last7DaysRevenue?: number;
  previous7DaysRevenue?: number;
  growthRate?: number;
  dailySlope?: number;
  rSquared?: number;
  movingAverageNext7DaysRevenue?: number;
  predictedNext7DaysRevenue?: number;
  method?: string;
}

export interface LogSummary {
  loginCount?: number;
  browseCount?: number;
  purchaseCount?: number;
  operationCount?: number;
}

export interface SellerBrowseLog {
  id?: number;
  username?: string;
  productName?: string;
  productCategory?: string;
  durationSeconds?: number;
  ipAddress?: string;
  createdAt?: string;
}

export interface SellerPurchaseLog {
  id?: number;
  username?: string;
  productName?: string;
  productCategory?: string;
  unitPrice?: number;
  quantity?: number;
  purchasedAt?: string;
}

export interface StatusBreakdownItem {
  status: string;
  label: string;
  orderCount: number;
  revenue: number;
}

export interface AnalyticsOverview {
  totalRevenue?: number;
  totalOrders?: number;
  totalUnits?: number;
  totalProducts?: number;
  activeCustomers?: number;
  customerCount?: number;
  browseCount?: number;
  purchaseCount?: number;
  conversionRate?: number;
  averageOrderValue?: number;
  lowStockCount?: number;
  statusBreakdown?: StatusBreakdownItem[];
  forecast?: Forecast;
}

export interface AnalyticsRankings {
  products?: Metric[];
  categories?: Metric[];
  sellers?: Metric[];
}

export interface AnalyticsTrends {
  period?: Period;
  points?: Metric[];
  forecast?: Forecast;
}

export interface AlertItem {
  type?: string;
  title?: string;
  productId?: number;
  productName?: string;
  ipAddress?: string;
  browseCount?: number;
  message?: string;
}

export interface AnalyticsAnomalies {
  total?: number;
  all?: AlertItem[];
  lowStock?: AlertItem[];
  salesSpike?: AlertItem[];
  highBrowseLowPurchase?: AlertItem[];
  suspiciousBrowse?: AlertItem[];
}

export interface CustomerProfile {
  userId: number;
  username: string;
  region?: string;
  purchasePower?: string;
  favoriteCategory?: string;
  totalSpend?: number;
  orderCount?: number;
  browseCount?: number;
  averageStaySeconds?: number;
}

export interface LoginLog {
  id?: number;
  username?: string;
  role?: string;
  ipAddress?: string;
  createdAt?: string;
  action?: string;
  content?: string;
}
