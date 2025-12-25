import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProductList from './components/ProductList';
import Login from './components/Login';
import Register from './components/Register';
import Cart from './components/Cart';
import ProductDetail from './components/ProductDetail';
import Navbar from './components/Navbar';
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
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar user={user} onLogout={handleLogout} />

        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/login" 
              element={!user ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/products" />} 
            />
            
            <Route 
              path="/register" 
              element={!user ? <Register /> : <Navigate to="/products" />} 
            />

            <Route 
              path="/products" 
              element={<ProductList user={user} />} 
            />

            <Route 
              path="/product/:id" 
              element={<ProductDetail user={user} />} 
            />

            <Route 
              path="/cart" 
              element={user ? <Cart user={user} /> : <Navigate to="/login" />} 
            />

            <Route path="/" element={<Navigate to="/products" />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
          <div className="container mx-auto px-4 text-center text-gray-500">
            <p>&copy; 2024 ProShop Demo. 由 Spring Boot + React + Tailwind CSS 构建</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
