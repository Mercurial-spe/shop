import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import type { User } from '../services/api';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const getLinkClass = (path: string) => {
    const baseClass = 'flex items-center gap-2 px-4 py-2 text-sm font-chicken font-bold rounded-xl transition-all group';
    const activeClass = 'text-primary-600 bg-primary-50 shadow-sm shadow-primary-100/50 ring-1 ring-primary-100';
    const inactiveClass = 'text-gray-600 hover:text-primary-600 hover:bg-primary-50';

    return `${baseClass} ${isActive(path) ? activeClass : inactiveClass}`;
  };

  return (
    <nav className="bg-white/90 backdrop-blur shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
              <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 shadow-sm shadow-primary-100/50">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-6 9 6"></path>
                  <path d="M9 22V12h6v10"></path>
                </svg>
              </span>
              <span className="text-2xl font-starborn text-primary-600 tracking-wider group-hover:text-primary-700 transition-colors">
                ProShop
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/products" className={getLinkClass('/products')}>
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7h18"></path>
                <path d="M6 7l1 12h10l1-12"></path>
                <path d="M9 7V5a3 3 0 0 1 6 0v2"></path>
              </svg>
              <span>Products</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/cart" className={getLinkClass('/cart')}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 6h15l-1.5 9h-12z"></path>
                    <circle cx="9" cy="20" r="1"></circle>
                    <circle cx="18" cy="20" r="1"></circle>
                  </svg>
                  <span className="hidden sm:inline">Cart</span>
                </Link>
                <div className="h-4 w-px bg-gray-200 mx-1"></div>
                <div className="flex items-center gap-3 pl-1">
                  <span className="text-sm text-gray-500">
                    Hello, <span className="font-bold text-gray-800">{user.username}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all active:scale-95"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className={getLinkClass('/login')}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <path d="M10 17l5-5-5-5"></path>
                    <path d="M15 12H3"></path>
                  </svg>
                  <span>Sign in</span>
                </Link>
                <Link to="/register" className={getLinkClass('/register')}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14"></path>
                    <path d="M5 12h14"></path>
                  </svg>
                  <span>Register</span>
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
