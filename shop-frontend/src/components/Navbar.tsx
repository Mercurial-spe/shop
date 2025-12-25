import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { User } from '../services/api';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <span className="text-2xl">🛍️</span>
              <span className="text-xl font-bold text-gray-900 tracking-tight">ProShop</span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/products" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              全部商品
            </Link>
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
                  <span className="text-xl">🛒</span>
                  <span className="hidden sm:inline ml-1 font-medium">购物车</span>
                </Link>
                <div className="h-6 w-px bg-gray-200"></div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">你好, <span className="font-semibold text-gray-800">{user.username}</span></span>
                  <button 
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-md transition-all font-medium"
                  >
                    退出
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium">
                  登录
                </Link>
                <Link to="/register" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-all">
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

