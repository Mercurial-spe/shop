import type { Product } from '../types/Product';

const API_BASE_URL = '/api';

export interface User {
  id: number;
  username: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  email?: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

export interface SellerCreateRequest {
  username: string;
  email: string;
  password: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  createdById?: number;
  createdByUsername?: string;
  createdAt: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>('/products');
  }

  async getProduct(id: number): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  async createProduct(product: Omit<Product, 'id'> & { sellerId: number }): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async getProductsBySeller(sellerId: number): Promise<Product[]> {
    return this.request<Product[]>(`/products/seller/${sellerId}`);
  }

  async deleteProduct(id: number, sellerId: number): Promise<void> {
    const url = `${API_BASE_URL}/products/${id}?sellerId=${sellerId}`;
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Delete failed');
    }
  }

  async updateProduct(id: number, sellerId: number, updates: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...updates, sellerId }),
    });
  }

  async purchaseProduct(productId: number, userId: number, quantity: number = 1): Promise<any> {
    return this.request<any>(`/products/${productId}/purchase`, {
      method: 'POST',
      body: JSON.stringify({ quantity, userId }),
    });
  }

  async recordBrowse(productId: number, userId: number | null, durationSeconds: number): Promise<void> {
    await this.request<any>('/logs/browse', {
      method: 'POST',
      body: JSON.stringify({
        productId,
        durationSeconds,
        ...(userId ? { userId } : {}),
      }),
    });
  }

  async getCategories(): Promise<ProductCategory[]> {
    return this.request<ProductCategory[]>('/categories');
  }

  async createCategory(sellerId: number, name: string): Promise<ProductCategory> {
    return this.request<ProductCategory>('/categories', {
      method: 'POST',
      body: JSON.stringify({ sellerId: String(sellerId), name }),
    });
  }

  async deleteCategory(sellerId: number, categoryId: number): Promise<void> {
    const url = `${API_BASE_URL}/categories/${categoryId}?sellerId=${sellerId}`;
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Delete category failed');
    }
  }

  // --- Auth ---
  async login(username: string, password: string): Promise<User> {
    return this.request<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async register(username: string, password: string, role: 'CUSTOMER' | 'SELLER', email: string): Promise<User> {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, role, email }),
    });
  }

  // --- Cart ---
  async getCart(userId: number): Promise<CartItem[]> {
    return this.request<CartItem[]>(`/cart/${userId}`);
  }

  async addToCart(userId: number, productId: number, quantity: number = 1): Promise<CartItem> {
    return this.request<CartItem>('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ userId, productId, quantity }),
    });
  }

  async removeFromCart(userId: number, cartItemId: number): Promise<void> {
    const url = `${API_BASE_URL}/cart/${userId}/item/${cartItemId}`;
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) throw new Error('Remove from cart failed');
  }

  async clearCart(userId: number): Promise<void> {
    const url = `${API_BASE_URL}/cart/${userId}/clear`;
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Clear cart failed');
    }
  }

  async checkoutCart(userId: number): Promise<void> {
    const url = `${API_BASE_URL}/cart/${userId}/checkout`;
    const response = await fetch(url, { method: 'POST' });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Checkout failed');
    }
  }

  async getOrdersByUser(userId: number): Promise<any[]> {
    return this.request<any[]>(`/orders/user/${userId}`);
  }

  async getOrderDetail(orderId: number, userId: number): Promise<any> {
    return this.request<any>(`/orders/${orderId}/user/${userId}`);
  }

  async getOrdersBySeller(sellerId: number): Promise<any[]> {
    return this.request<any[]>(`/orders/seller/${sellerId}`);
  }

  async getSellerStats(sellerId: number): Promise<any> {
    return this.request<any>(`/orders/seller/${sellerId}/stats`);
  }

  // --- Admin ---
  async getSellers(adminId: number): Promise<User[]> {
    return this.request<User[]>(`/admin/sellers?adminId=${adminId}`);
  }

  async createSeller(adminId: number, seller: SellerCreateRequest): Promise<User> {
    return this.request<User>('/admin/sellers', {
      method: 'POST',
      body: JSON.stringify({ adminId: String(adminId), ...seller }),
    });
  }

  async deleteSeller(adminId: number, sellerId: number): Promise<void> {
    const url = `${API_BASE_URL}/admin/sellers/${sellerId}?adminId=${adminId}`;
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Delete seller failed');
    }
  }

  async resetSellerPassword(adminId: number, sellerId: number, password: string): Promise<User> {
    return this.request<User>(`/admin/sellers/${sellerId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ adminId: String(adminId), password }),
    });
  }

  async getLoginLogs(adminId: number): Promise<any[]> {
    return this.request<any[]>(`/logs/login?adminId=${adminId}`);
  }

  async getBrowseLogs(adminId: number): Promise<any[]> {
    return this.request<any[]>(`/logs/browse?adminId=${adminId}`);
  }

  async getPurchaseLogs(adminId: number): Promise<any[]> {
    return this.request<any[]>(`/logs/purchase?adminId=${adminId}`);
  }

  async getOperationLogs(adminId: number): Promise<any[]> {
    return this.request<any[]>(`/logs/operation?adminId=${adminId}`);
  }
}

export const apiService = new ApiService();
