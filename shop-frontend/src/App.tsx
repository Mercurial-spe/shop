import React from 'react';
import ProductList from './components/ProductList';
import './App.css';

function App() {
  return (
    <div className="App">
      <header style={{
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '20px',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{ margin: '0', fontSize: '2.5em' }}>🛍️ 购物网站</h1>
        <p style={{ margin: '10px 0 0 0', opacity: '0.8' }}>
          发现优质商品，开启美好购物之旅
        </p>
      </header>

      <main>
        <ProductList />
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        color: '#666',
        marginTop: '50px'
      }}>
        <p>&copy; 2024 购物网站 Demo. 由 Spring Boot + React 构建</p>
      </footer>
    </div>
  );
}

export default App;
