import type { Product } from '../types/Product';

const API_BASE_URL = 'http://localhost:8080/api';

export interface User {
  id: number;
  username: string;
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

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: number): Promise<void> {
    const url = `${API_BASE_URL}/products/${id}`;
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) throw new Error('Delete failed');
  }

  // --- Auth ---
  async login(username: string, password: string): Promise<User> {
    return this.request<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async register(username: string, password: string): Promise<User> {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
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
}

export const apiService = new ApiService();
