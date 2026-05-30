import { useState } from 'react';
import type { User } from '../services/api';

/**
 * 站内重置销售人员密码弹窗，替换原来的 window.prompt。
 */
export function PasswordResetModal({
  seller,
  busy,
  onClose,
  onConfirm,
}: {
  seller: User;
  busy: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
}) {
  const [password, setPassword] = useState('seller123');
  const tooShort = password.trim().length < 6;

  return (
    <aside className="modal-overlay" aria-label="重置密码">
      <button className="modal-backdrop" type="button" onClick={onClose} aria-label="关闭" />
      <section className="modal-panel reset-modal">
        <button className="close-button" type="button" onClick={onClose}>×</button>
        <p className="eyebrow">Reset password</p>
        <h2>重置密码</h2>
        <p className="reset-target">为销售账号 <strong>{seller.username}</strong> 设置新密码</p>
        <label>
          新密码
          <input value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {tooShort && <small className="danger-text">密码至少 6 位。</small>}
        <div className="button-pair">
          <button className="ghost-button" type="button" onClick={onClose} disabled={busy}>取消</button>
          <button className="primary-button" type="button" onClick={() => onConfirm(password.trim())} disabled={busy || tooShort}>
            {busy ? '提交中...' : '确认重置'}
          </button>
        </div>
      </section>
    </aside>
  );
}
