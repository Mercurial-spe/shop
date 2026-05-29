import type { User } from '../services/api';
import type { View } from '../types/app';

export const VIEW_PATHS: Record<View, string> = {
  shop: '/products',
  login: '/login',
  cart: '/cart',
  orders: '/orders',
  seller: '/seller',
  admin: '/admin',
};

export const PATH_VIEWS: Record<string, View> = {
  '/': 'shop',
  '/products': 'shop',
  '/login': 'login',
  '/cart': 'cart',
  '/orders': 'orders',
  '/seller': 'seller',
  '/admin': 'admin',
};

export const viewFromPath = (pathname: string): View => PATH_VIEWS[pathname] ?? 'shop';

export const viewForRole = (role: User['role']): View => {
  if (role === 'ADMIN') {
    return 'admin';
  }
  if (role === 'SELLER') {
    return 'seller';
  }
  return 'shop';
};
