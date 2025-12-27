export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  stockQuantity?: number;
  seller?: {
    id: number;
    username: string;
  };
}
