import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import type { CartItem, User } from '../services/api';

interface CartProps {
  user: User;
}

const Cart: React.FC<CartProps> = ({ user }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const data = await apiService.getCart(user.id);
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (itemId: number) => {
    try {
      await apiService.removeFromCart(user.id, itemId);
      setItems(items.filter(item => item.id !== itemId));
    } catch (err) {
      alert('Failed to remove item.');
    }
  };

  const handleClear = async () => {
    if (window.confirm('Clear all items from the cart?')) {
      try {
        await apiService.clearCart(user.id);
        setItems([]);
      } catch (err) {
        alert('Failed to clear cart.');
      }
    }
  };

  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4 text-slate-300">
      <div className="w-12 h-12 border-4 border-white/20 border-t-cyan-300 rounded-full animate-spin"></div>
      <p className="font-medium">Preparing your cart...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-10">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 mb-10">
        <div>
          <Link to="/products" className="text-cyan-200 hover:text-cyan-100 font-semibold flex items-center gap-2 mb-2">
            <span className="text-lg">&larr;</span> Continue shopping
          </Link>
          <h2 className="text-3xl font-black text-white">Your cart</h2>
        </div>

        {items.length > 0 && (
          <button
            onClick={handleClear}
            className="text-sm font-bold text-red-200 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
          >
            Clear cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white/10 rounded-3xl p-20 text-center border border-white/20 backdrop-blur">
          <div className="text-7xl mb-6 text-cyan-200">+</div>
          <h3 className="text-2xl font-bold text-white mb-4">Your cart is empty</h3>
          <p className="text-slate-300 mb-8">Explore the catalog and build your next drop.</p>
          <Link
            to="/products"
            className="px-8 py-3 bg-cyan-300 hover:bg-cyan-200 text-slate-900 font-bold rounded-xl shadow-lg shadow-cyan-200/30 transition-all inline-block"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white/10 rounded-2xl p-4 border border-white/20 flex items-center gap-4 group transition-all hover:shadow-[0_18px_40px_rgba(34,211,238,0.15)]">
                <img
                  src={item.product.imageUrl || 'https://via.placeholder.com/100?text=No+Image'}
                  className="w-24 h-24 object-cover rounded-xl"
                  alt={item.product.name}
                />
                <div className="flex-grow">
                  <h4 className="font-semibold text-white text-lg group-hover:text-cyan-200 transition-colors">
                    {item.product.name}
                  </h4>
                  <p className="text-sm text-slate-400 mb-2">Unit price: <span className="font-mono text-cyan-200">${item.product.price.toFixed(2)}</span></p>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-200 bg-white/10 px-3 py-1 rounded-md border border-white/10">Qty: {item.quantity}</span>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-sm font-bold text-slate-400 hover:text-red-200 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right pr-4">
                  <p className="font-mono font-bold text-cyan-200 text-xl">${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white/10 rounded-3xl p-8 border border-white/20 backdrop-blur sticky top-28">
              <h3 className="text-xl font-bold text-white mb-6 pb-4 border-b border-white/10">Order summary</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-300">
                  <span>Items</span>
                  <span>{items.length}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Shipping</span>
                  <span className="text-cyan-200 font-bold">Free</span>
                </div>
                <div className="h-px bg-white/10 my-4"></div>
                <div className="flex justify-between items-baseline">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-3xl font-mono font-bold text-cyan-200">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <button
                className="w-full py-4 bg-cyan-300 hover:bg-cyan-200 text-slate-900 text-lg font-bold rounded-2xl shadow-lg shadow-cyan-200/30 transition-all transform active:scale-95"
                onClick={() => alert('Order submitted. Payment flow coming soon.')}
              >
                Checkout
              </button>
              <p className="text-center text-xs text-slate-400 mt-4">Secure checkout powered by ProShop demo.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
