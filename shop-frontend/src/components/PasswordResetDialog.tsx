import React, { useState } from 'react';
import type { User } from '../services/api';

interface PasswordResetDialogProps {
  seller: User;
  open: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (password: string) => Promise<void> | void;
}

const PasswordResetDialog: React.FC<PasswordResetDialogProps> = ({
  seller,
  open,
  loading = false,
  onCancel,
  onConfirm,
}) => {
  const [password, setPassword] = useState('seller123');

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password.trim()) {
      alert('请输入新密码。');
      return;
    }
    await onConfirm(password.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-8 backdrop-blur-md">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-white/15 bg-slate-950/95 p-6 text-slate-100 shadow-[0_30px_90px_rgba(8,47,73,0.45)]"
      >
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-violet-200">seller account</p>
          <h3 className="mt-2 text-2xl font-black text-white">重置销售人员密码</h3>
          <p className="mt-2 text-sm text-slate-400">
            账号：<span className="font-bold text-violet-100">{seller.username}</span>
          </p>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-200">新密码</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-200"
            placeholder="例如：seller123"
            autoFocus
            required
          />
        </label>

        <div className="mt-4 rounded-xl border border-amber-300/20 bg-amber-400/10 p-3 text-sm text-amber-100">
          这是公开演示账号管理功能。真实部署时应使用更强密码，并避免在报告中公开真实密码。
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-slate-100 transition hover:border-violet-200 hover:text-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-violet-300 px-6 py-3 text-sm font-black text-slate-950 shadow-lg shadow-violet-200/20 transition hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? '重置中...' : '确认重置'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordResetDialog;
