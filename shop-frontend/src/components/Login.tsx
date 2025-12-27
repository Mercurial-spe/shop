import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import type { User } from '../services/api';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await apiService.login(username, password);
      onLoginSuccess(user);
      navigate('/products');
    } catch (err: any) {
      setError(err.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl px-20 py-16 bg-white rounded-[3rem] shadow-2xl border border-gray-100 transition-all">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="w-24 h-24 bg-gradient-to-br from-primary-50 to-primary-100 rounded-3xl flex items-center justify-center mb-10 text-5xl shadow-inner shadow-white/50 ring-1 ring-primary-100 transform rotate-3">
          👋
        </div>
        <h2 className="text-7xl font-starborn mb-8 py-2 uppercase tracking-wide">
          <span className="bg-gradient-to-b from-primary-600 via-primary-500 to-indigo-700 bg-clip-text text-transparent filter drop-shadow-[2px_4px_0px_rgba(0,0,0,0.02)]">
            WELCOME BACK
          </span>
        </h2>
        <p className="text-gray-400 font-chandia text-xl tracking-wider capitalize bg-gray-50 px-6 py-2 rounded-full">
          Login to your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10 px-2">
        <div className="space-y-4 text-left">
          <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-xl font-chicken font-black tracking-widest text-lg">
            <span className="text-xl">👤</span>
            用户名
          </label>
          <div className="relative group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-4.5 bg-gray-50/50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-primary-100/50 focus:border-primary-500 outline-none transition-all text-gray-800 placeholder-gray-400 font-medium font-chicken text-lg tracking-wide"
              placeholder="输入您的账号"
              required
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-xl font-chicken font-black tracking-widest text-lg">
            <span className="text-xl">🔒</span>
            密码
          </label>
          <div className="relative group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4.5 bg-gray-50/50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-primary-100/50 focus:border-primary-500 outline-none transition-all text-gray-800 placeholder-gray-400 font-medium font-chicken text-lg tracking-wide"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-bold border border-red-100 animate-shake">
            <span className="mr-2">⚠️</span>{error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white font-chicken font-black text-xl rounded-2xl shadow-xl shadow-primary-200/50 hover:shadow-primary-300/50 transition-all transform active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
              正在登录...
            </span>
          ) : '立即登录'}
        </button>
      </form>

      <div className="mt-12 pt-8 border-t border-gray-50 text-center">
        <p className="text-gray-500 font-medium">
          还没有账号？{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-black hover:underline underline-offset-4 transition-all">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
