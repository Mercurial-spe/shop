import { DEMO_CREDENTIALS } from '../data/storefront';
import type { AuthForm, LoginMode } from '../types/app';

export function LoginView({
  actionBusy,
  authForm,
  loginMode,
  onAuth,
  onBack,
  onForm,
  onMode,
  onQuickLogin,
}: {
  actionBusy: string | null;
  authForm: AuthForm;
  loginMode: LoginMode;
  onAuth: () => void;
  onBack: () => void;
  onForm: (value: AuthForm) => void;
  onMode: (value: LoginMode) => void;
  onQuickLogin: (username: string, password: string) => void;
}) {
  const authBusy = actionBusy === 'auth';

  return (
    <section className="login-page">
      <div className="login-hero">
        <button className="ghost-button compact" type="button" onClick={onBack}>
          返回商城
        </button>
        <p className="eyebrow">Secure role entrance</p>
        <h1>选择身份，进入对应的商城工作流。</h1>
        <p>
          内置账号用于课程演示：顾客完成浏览与购买，销售管理商品，管理员查看数据分析。你也可以注册新的顾客或销售账号。
        </p>
        <div className="credential-ledger">
          {DEMO_CREDENTIALS.map((item) => {
            const busy = actionBusy === `quick-${item.username}`;
            return (
              <button className={`credential-card role-swatch-${item.userRole.toLowerCase()}`} disabled={Boolean(actionBusy)} key={item.username} type="button" onClick={() => onQuickLogin(item.username, item.password)}>
                <span>{item.role}</span>
                <strong>{item.username}</strong>
                <small>{item.password}</small>
                <em>{busy ? '正在进入...' : item.note}</em>
              </button>
            );
          })}
        </div>
      </div>

      <form
        className="login-panel"
        onSubmit={(event) => {
          event.preventDefault();
          onAuth();
        }}
      >
        <div className="segmented">
          <button className={loginMode === 'login' ? 'active' : ''} type="button" onClick={() => onMode('login')}>
            登录
          </button>
          <button className={loginMode === 'register' ? 'active' : ''} type="button" onClick={() => onMode('register')}>
            注册
          </button>
        </div>
        <label>
          用户名
          <input autoComplete="username" value={authForm.username} onChange={(event) => onForm({ ...authForm, username: event.target.value })} />
        </label>
        <label>
          密码
          <input autoComplete={loginMode === 'login' ? 'current-password' : 'new-password'} type="password" value={authForm.password} onChange={(event) => onForm({ ...authForm, password: event.target.value })} />
        </label>
        {loginMode === 'register' && (
          <>
            <label>
              邮箱
              <input autoComplete="email" value={authForm.email} onChange={(event) => onForm({ ...authForm, email: event.target.value })} />
            </label>
            <label>
              角色
              <select value={authForm.role} onChange={(event) => onForm({ ...authForm, role: event.target.value as AuthForm['role'] })}>
                <option value="CUSTOMER">顾客</option>
                <option value="SELLER">销售</option>
              </select>
            </label>
          </>
        )}
        <button className="primary-button full" disabled={Boolean(actionBusy)} type="submit">
          {authBusy ? '正在验证...' : loginMode === 'login' ? '进入系统' : '创建账号'}
        </button>
        <p className="login-hint">演示口令已经列在左侧；点击身份卡会自动填充并登录。</p>
      </form>
    </section>
  );
}
