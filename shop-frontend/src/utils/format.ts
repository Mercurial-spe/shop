import type { Order } from '../types/app';

export const formatMoney = (value?: number) =>
  `¥${Number(value ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDate = (value?: string) => {
  if (!value) {
    return '刚刚';
  }
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

export const productImageSrc = (url?: string) => {
  if (!url) {
    return '';
  }
  if (url.startsWith('http')) {
    return url;
  }
  return url;
};

export const orderTotal = (order: Order) =>
  (order.items ?? []).reduce((sum, item) => sum + Number(item.price ?? 0) * Number(item.quantity ?? 0), 0);

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: '待支付',
  PAID: '已支付',
  SHIPPED: '已发货',
  RECEIVED: '已收货',
};

export const orderStatusLabel = (status?: string) => (status ? ORDER_STATUS_LABELS[status] ?? status : '-');

export const isPendingPayment = (status?: string) => status === 'PENDING_PAYMENT';
