import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { User } from '../services/api';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const menuItems = [
    {
      label: '商品',
      path: '/products',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7h18"></path>
                <path d="M6 7l1 12h10l1-12"></path>
                <path d="M9 7V5a3 3 0 0 1 6 0v2"></path>
              </svg>
      )
    },
    ...(user ? [
      ...(user.role === 'CUSTOMER' ? [{
        label: '订单',
        path: '/orders',
        icon: (
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 3h6l1 2h5v16H3V5h5l1-2z"></path>
            <path d="M9 12h6"></path>
            <path d="M9 16h6"></path>
          </svg>
        )
      }] : []),
      ...(user.role === 'SELLER' ? [{
        label: '销售管理',
        path: '/seller',
        icon: (
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h18"></path>
            <path d="M3 6h18"></path>
            <path d="M3 18h18"></path>
          </svg>
        )
      }] : []),
      {
        label: '购物车',
        path: '/cart',
        icon: (
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 6h15l-1.5 9h-12z"></path>
                    <circle cx="9" cy="20" r="1"></circle>
                    <circle cx="18" cy="20" r="1"></circle>
                  </svg>
        )
      },
      {
        label: '退出',
        action: handleLogout,
        icon: (
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <path d="M16 17l5-5-5-5"></path>
            <path d="M21 12H9"></path>
          </svg>
        )
      }
    ] : [
      {
        label: '登录',
        path: '/login',
        icon: (
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <path d="M10 17l5-5-5-5"></path>
                    <path d="M15 12H3"></path>
                  </svg>
        )
      }
    ])
  ];

  if (isAuthPage) {
    return (
      <nav className="fixed top-4 left-0 right-0 z-50 px-4">
        <div className="mx-auto max-w-7xl rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-lg py-3 px-6 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-6 9 6"></path>
                <path d="M9 22V12h6v10"></path>
              </svg>
            </span>
            <span className="font-bold font-starborn text-white tracking-wide text-xl">Mercurial's Shop</span>
                </Link>
          <Link to="/products" className="text-sm font-bold font-starborn text-slate-300 hover:text-white transition-colors">
            返回商城
                </Link>
              </div>
      </nav>
    );
  }

  return (
    <div className="fixed bottom-10 left-10 z-50 flex items-end">
      {/* Radial Menu Items */}
      <AnimatePresence>
        {isOpen && (
          <>
            {menuItems.map((item, index) => {
              const angle = -90 + (index * (90 / (menuItems.length - 1 || 1))); // Distribute from -90 (top) to 0 (right)
              const radius = 130; // Distance from center
              const x = Math.cos((angle * Math.PI) / 180) * radius;
              const y = Math.sin((angle * Math.PI) / 180) * radius;

              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                  animate={{ opacity: 1, x, y, scale: 1 }}
                  exit={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: index * 0.05 }}
                  className="absolute bottom-0 left-0"
                  style={{ transformOrigin: 'bottom left' }}
                >
                  <div className="relative group">
                    {item.path ? (
                      <Link
                        to={item.path}
                        className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 shadow-lg shadow-cyan-500/20 hover:bg-cyan-500 hover:text-white hover:scale-110 transition-all duration-300"
                        onClick={() => setIsOpen(false)}
                      >
                        {React.cloneElement(item.icon as React.ReactElement, { className: 'w-8 h-8' })}
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          item.action?.();
                          setIsOpen(false);
                        }}
                        className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-900/90 border border-red-500/30 text-red-300 shadow-lg shadow-red-500/20 hover:bg-red-500 hover:text-white hover:scale-110 transition-all duration-300"
                      >
                        {React.cloneElement(item.icon as React.ReactElement, { className: 'w-8 h-8' })}
                      </button>
                    )}
                    
                    {/* Tooltip */}
                    <div className="absolute left-1/2 -translate-x-1/2 -top-10 px-4 py-2 bg-black/80 text-white text-sm font-bold font-starborn rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none backdrop-blur-sm border border-white/10">
                      {item.label}
                    </div>
          </div>
                </motion.div>
              );
            })}
          </>
        )}
      </AnimatePresence>

      {/* Main Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative z-50 flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-[0_0_30px_rgba(34,211,238,0.4)] ring-2 ring-white/20 hover:shadow-[0_0_50px_rgba(34,211,238,0.6)] transition-all duration-300 group"
      >
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
          {isOpen ? (
            <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          ) : (
             <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
               <path d="M3 9l9-6 9 6"></path>
               <path d="M9 22V12h6v10"></path>
             </svg>
          )}
        </div>
        {/* Pulse Effect */}
        <span className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-20"></span>
      </motion.button>
      
      {/* Label when closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -10, transition: { duration: 0.2 } }}
             className="absolute left-28 bottom-0 h-20 flex flex-col justify-center pointer-events-none whitespace-nowrap"
          >
             {user ? (
               <div className="flex flex-col">
                  <span className="text-sm font-bold font-starborn text-cyan-300 uppercase tracking-widest mb-1">
                    欢迎回来
                  </span>
                  <span className="text-3xl font-bold font-starborn text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    {user.username}
                  </span>
               </div>
             ) : (
               <div className="flex flex-col">
                 <span className="text-3xl font-bold font-starborn tracking-wide bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent drop-shadow-md">
                   Mercurial's Shop
                 </span>
               </div>
             )}
             <div className="flex items-center mt-2">
               <motion.div
                 animate={{ x: [0, -12, 0] }}
                 transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                 className="flex items-center gap-3"
               >
                 <svg viewBox="0 0 24 24" className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M19 12H5"></path>
                   <path d="M12 19l-7-7 7-7"></path>
                 </svg>
                 <span className="text-sm font-bold font-starborn uppercase tracking-widest text-cyan-200 drop-shadow-md">
                   点击切换 购物车 / 订单 / 管理
                 </span>
               </motion.div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
  );
};

export default Navbar;
