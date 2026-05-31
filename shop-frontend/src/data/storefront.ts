import type { Product } from '../types/Product';
import type { DemoCredential, ProductForm } from '../types/app';

export const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80';

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 1001,
    name: 'Aurora Phone Pro',
    description: '高性能影像旗舰手机，适合演示热销电子产品。',
    price: 6999,
    category: '手机数码',
    stockQuantity: 42,
    imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=900&q=80',
    seller: { id: 2, username: 'seller01' },
  },
  {
    id: 1002,
    name: 'Nebula Laptop Air',
    description: '轻薄办公笔记本，高客单价商品。',
    price: 8299,
    category: '电脑办公',
    stockQuantity: 28,
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80',
    seller: { id: 2, username: 'seller01' },
  },
  {
    id: 1003,
    name: 'Pulse Wireless Earbuds',
    description: '主动降噪无线耳机，适合推荐系统展示。',
    price: 1299,
    category: '智能配件',
    stockQuantity: 96,
    imageUrl: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80',
    seller: { id: 2, username: 'seller01' },
  },
  {
    id: 1004,
    name: 'Orbit Smart Watch',
    description: '健康监测智能手表，适合销量趋势展示。',
    price: 1899,
    category: '智能穿戴',
    stockQuantity: 35,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    seller: { id: 3, username: 'seller02' },
  },
];

export const DEMO_CREDENTIALS: DemoCredential[] = [
  { role: '管理者', userRole: 'ADMIN', username: 'admin', password: 'admin123', note: '查看画像、趋势、异常与报表' },
  { role: '销售', userRole: 'SELLER', username: 'seller01', password: 'seller123', note: '管理商品、类别、库存与订单' },
  { role: '顾客', userRole: 'CUSTOMER', username: 'customer01', password: 'customer123', note: '浏览、加购、下单与推荐' },
];

export const emptyProductForm: ProductForm = {
  name: '',
  description: '',
  price: '199',
  category: '智能配件',
  stockQuantity: '20',
  imageUrl: DEFAULT_PRODUCT_IMAGE,
};
