import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ProductList from './components/ProductList';
import Login from './components/Login';
import Register from './components/Register';
import Cart from './components/Cart';
import ProductDetail from './components/ProductDetail';
import Orders from './components/Orders';
import SellerDashboard from './components/SellerDashboard';
import Navbar from './components/Navbar';
import InteractiveBackground from './components/InteractiveBackground';
import CustomCursor from './components/CustomCursor';
import type { User } from './services/api';
import './App.css';

function AppContent() {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return null;
    const parsed = JSON.parse(savedUser);
    return { role: 'CUSTOMER', ...parsed } as User;
  });

  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  const handleLoginSuccess = (user: User) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <InteractiveBackground />
      <CustomCursor />
      <Navbar user={user} onLogout={handleLogout} />

      <main className={`flex-grow flex flex-col relative z-10 ${isAuthPage ? 'pt-32' : 'pt-8 pb-12'}`}>
        <Routes>
          <Route
            path="/login"
            element={
              <div className="flex-grow flex items-center justify-center p-4">
                {!user ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/products" />}
              </div>
            }
          />

          <Route
            path="/register"
            element={
              <div className="flex-grow flex items-center justify-center p-4">
                {!user ? <Register /> : <Navigate to="/products" />}
              </div>
            }
          />

          <Route
            path="/products"
            element={
              <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
                <ProductList user={user} />
              </div>
            }
          />

          <Route
            path="/product/:id"
            element={
              <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
                <ProductDetail user={user} />
              </div>
            }
          />

          <Route
            path="/cart"
            element={
              <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
                {user ? <Cart user={user} /> : <Navigate to="/login" />}
              </div>
            }
          />

          <Route
            path="/orders"
            element={
              <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
                {user ? <Orders user={user} /> : <Navigate to="/login" />}
              </div>
            }
          />

          <Route
            path="/seller"
            element={
              <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
                {user?.role === 'SELLER' ? <SellerDashboard user={user} /> : <Navigate to="/products" />}
              </div>
            }
          />

          <Route path="/" element={<Navigate to={user ? '/products' : '/login'} />} />
        </Routes>
      </main>

      <footer className="bg-white/5 border-t border-white/10 py-8 mt-auto backdrop-blur">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>&copy; 2024 ProShop Demo. 基于 Spring Boot + React + Tailwind CSS 构建。</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
