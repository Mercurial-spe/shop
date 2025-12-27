import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProductList from './components/ProductList';
import Login from './components/Login';
import Register from './components/Register';
import Cart from './components/Cart';
import ProductDetail from './components/ProductDetail';
import Navbar from './components/Navbar';
import InteractiveBackground from './components/InteractiveBackground';
import type { User } from './services/api';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
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
    <Router>
      <div className="min-h-screen flex flex-col relative">
        <InteractiveBackground />
        <Navbar user={user} onLogout={handleLogout} />

        <main className="flex-grow flex flex-col relative z-10">
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
                <div className="container mx-auto px-4 py-8">
                  <ProductList user={user} />
                </div>
              }
            />

            <Route
              path="/product/:id"
              element={
                <div className="container mx-auto px-4 py-8">
                  <ProductDetail user={user} />
                </div>
              }
            />

            <Route
              path="/cart"
              element={
                <div className="container mx-auto px-4 py-8">
                  {user ? <Cart user={user} /> : <Navigate to="/login" />}
                </div>
              }
            />

            <Route path="/" element={<Navigate to={user ? '/products' : '/login'} />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
          <div className="container mx-auto px-4 text-center text-gray-500">
            <p>&copy; 2024 ProShop Demo. Built with Spring Boot + React + Tailwind CSS.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
