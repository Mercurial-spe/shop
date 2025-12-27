import type { Product } from '../types/Product';

const API_BASE_URL = 'http://localhost:8080/api';

export interface User {
  id: number;
  username: string;
  role: 'CUSTOMER' | 'SELLER';
  email?: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
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

  async deleteProduct(id: number): Promise<void> {
    const url = `${API_BASE_URL}/products/${id}`;
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) throw new Error('Delete failed');
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async purchaseProduct(productId: number, userId: number, quantity: number = 1): Promise<any> {
    return this.request<any>(`/products/${productId}/purchase`, {
      method: 'POST',
      body: JSON.stringify({ quantity, userId }),
    });
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
    if (!response.ok) throw new Error('Clear cart failed');
  }

  async checkoutCart(userId: number): Promise<void> {
    const url = `${API_BASE_URL}/cart/${userId}/checkout`;
    const response = await fetch(url, { method: 'POST' });
    if (!response.ok) throw new Error('Checkout failed');
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
}

export const apiService = new ApiService();
