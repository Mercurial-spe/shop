import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import ProductList from './components/ProductList';
import Login from './components/Login';
import Register from './components/Register';
import Cart from './components/Cart';
import ProductDetail from './components/ProductDetail';
import Orders from './components/Orders';
import OrderDetail from './components/OrderDetail';
import SellerDashboard from './components/SellerDashboard';
import Navbar from './components/Navbar';
import InteractiveBackground from './components/InteractiveBackground';
import CustomCursor from './components/CustomCursor';
import type { User } from './services/api';
import './App.css';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
}

function Layout({ user, onLogout }: LayoutProps) {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col relative">
      <InteractiveBackground />
      <CustomCursor />
      <Navbar user={user} onLogout={onLogout} />

      <main className={`main-content ${isAuthPage ? 'pt-32' : 'pt-8 pb-12'}`}>
        <div className={`main-content-wrapper ${isAuthPage ? 'auth-wrapper' : ''}`}>
          <Outlet />
        </div>
        <footer className="site-footer">
          <p className="icp-info">
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="icp-link"
            >
              黔ICP备2025060353号
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}

function AppContent() {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return null;
    const parsed = JSON.parse(savedUser);
    return { role: 'CUSTOMER', ...parsed } as User;
  });

  const handleLoginSuccess = (user: User) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <Routes>
      <Route element={<Layout user={user} onLogout={handleLogout} />}>
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
          path="/orders/:id"
          element={
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
              {user ? <OrderDetail user={user} /> : <Navigate to="/login" />}
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
      </Route>
    </Routes>
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
