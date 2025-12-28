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
      setError(err.message || '登录失败，请检查账号和密码。');
    } finally {
      setLoading(false);
    }
  };

  const fillTestAccount = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="w-full max-w-xl px-20 py-16 bg-white rounded-[3rem] shadow-2xl border border-gray-100 transition-all">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="w-24 h-24 bg-gradient-to-br from-primary-50 to-primary-100 rounded-3xl flex items-center justify-center mb-10 text-5xl shadow-inner shadow-white/50 ring-1 ring-primary-100 transform rotate-3">
          <span className="text-4xl">+</span>
        </div>
        <h2 className="text-7xl font-starborn mb-8 py-2 uppercase tracking-wide">
          <span className="bg-gradient-to-b from-primary-600 via-primary-500 to-indigo-700 bg-clip-text text-transparent filter drop-shadow-[2px_4px_0px_rgba(0,0,0,0.02)]">
            welcome back
          </span>
        </h2>
        <p className="text-gray-400 font-chandia text-xl tracking-wider capitalize bg-gray-50 px-6 py-2 rounded-full">
          登录后继续
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10 px-2">
        <div className="space-y-4 text-left">
          <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-xl font-chicken font-black tracking-widest text-lg">
            用户名
          </label>
          <div className="relative group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-4.5 bg-gray-50/50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-primary-100/50 focus:border-primary-500 outline-none transition-all text-gray-800 placeholder-gray-400 font-medium font-chicken text-lg tracking-wide"
              placeholder="请输入用户名"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-xl font-chicken font-black tracking-widest text-lg">
            密码
          </label>
          <div className="relative group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4.5 bg-gray-50/50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-primary-100/50 focus:border-primary-500 outline-none transition-all text-gray-800 placeholder-gray-400 font-medium font-chicken text-lg tracking-wide"
              placeholder="请输入密码"
              required
            />
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-bold border border-red-100">
            <span className="mr-2">!</span>{error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white font-chicken font-black text-xl rounded-2xl shadow-xl shadow-primary-200/50 hover:shadow-primary-300/50 transition-all transform active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              正在登录...
            </span>
          ) : '登录'}
        </button>
      </form>

      {/* Test Accounts Signboard */}
      <div className="mt-10 p-6 bg-gradient-to-br from-slate-50 to-primary-50/30 rounded-[2rem] border border-primary-100/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <svg viewBox="0 0 24 24" className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.011-.203 2.977m-2.777 2.818c-.51.391-1.054.724-1.627.996L10.75 20l1.25-1.25L13.25 20l.627-.996a13.911 13.911 0 004.599-9.251M12 5a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </div>
        
        <h4 className="text-sm font-bold font-starborn text-primary-700/70 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></span>
          测试账户告示牌
        </h4>
        
        <div className="grid grid-cols-2 gap-4 relative z-10">
          <button
            onClick={() => fillTestAccount('admin', '123456')}
            className="flex flex-col items-start p-4 bg-white hover:bg-primary-50 rounded-2xl border border-white hover:border-primary-200 shadow-sm hover:shadow-md transition-all group/btn text-left"
          >
            <span className="text-[10px] font-bold text-primary-400 uppercase tracking-tighter mb-1">卖家账户 (Seller)</span>
            <span className="text-lg font-bold font-starborn text-slate-700 group-hover/btn:text-primary-600">admin</span>
            <span className="text-xs font-mono text-slate-400 mt-1">密码: 123456</span>
          </button>

          <button
            onClick={() => fillTestAccount('buyer', '123456')}
            className="flex flex-col items-start p-4 bg-white hover:bg-primary-50 rounded-2xl border border-white hover:border-primary-200 shadow-sm hover:shadow-md transition-all group/btn text-left"
          >
            <span className="text-[10px] font-bold text-primary-400 uppercase tracking-tighter mb-1">买家账户 (Buyer)</span>
            <span className="text-lg font-bold font-starborn text-slate-700 group-hover/btn:text-primary-600">buyer</span>
            <span className="text-xs font-mono text-slate-400 mt-1">密码: 123456</span>
          </button>
        </div>
        
        <p className="mt-4 text-[10px] text-slate-400 text-center font-medium tracking-wide italic">
          * 点击上方卡片即可自动填写账户信息
        </p>
      </div>

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
