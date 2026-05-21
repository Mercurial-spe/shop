import React, { useMemo, useState } from 'react';

interface PaymentDialogProps {
  orderId: number;
  amount?: number;
  open: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (paymentMethod: string) => Promise<void> | void;
}

const paymentMethods = [
  {
    name: '模拟支付宝',
    label: '支付宝',
    description: '适合移动端演示',
    className: 'border-sky-300/35 bg-sky-400/15 text-sky-50',
  },
  {
    name: '模拟微信',
    label: '微信',
    description: '常用快捷支付',
    className: 'border-emerald-300/35 bg-emerald-400/15 text-emerald-50',
  },
  {
    name: '模拟银行卡',
    label: '银行卡',
    description: '传统网银通道',
    className: 'border-violet-300/35 bg-violet-400/15 text-violet-50',
  },
];

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  orderId,
  amount,
  open,
  loading = false,
  onCancel,
  onConfirm,
}) => {
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0].name);
  const selected = useMemo(
    () => paymentMethods.find((method) => method.name === selectedMethod) ?? paymentMethods[0],
    [selectedMethod]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-8 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-slate-950/95 p-6 text-slate-100 shadow-[0_30px_90px_rgba(8,47,73,0.45)]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-200">simulated payment</p>
            <h3 className="mt-2 text-2xl font-black text-white">确认模拟支付</h3>
            <p className="mt-2 text-sm text-slate-400">订单 {orderId} 将使用演示支付通道完成。</p>
          </div>
          <span className="rounded-full border border-cyan-200/25 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">
            待支付
          </span>
        </div>

        <div className="mb-5 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">支付金额</span>
            <span className="font-mono text-3xl font-black text-cyan-200">
              {amount == null ? '以订单为准' : `¥${amount.toFixed(2)}`}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const active = method.name === selectedMethod;
            return (
              <button
                key={method.name}
                type="button"
                onClick={() => setSelectedMethod(method.name)}
                className={`w-full rounded-xl border p-4 text-left transition-all ${
                  active
                    ? method.className
                    : 'border-white/10 bg-white/5 text-slate-200 hover:border-cyan-200/45 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-base font-black">{method.label}</p>
                    <p className="mt-1 text-sm opacity-80">{method.description}</p>
                  </div>
                  <span className={`h-4 w-4 rounded-full border ${active ? 'border-white bg-white' : 'border-white/40'}`}></span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300">
          当前选择：<span className="font-bold text-cyan-100">{selected.name}</span>。这是课程演示用模拟支付，不会连接真实支付平台。
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-slate-100 transition hover:border-cyan-200 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            稍后支付
          </button>
          <button
            type="button"
            onClick={() => onConfirm(selected.name)}
            disabled={loading}
            className="rounded-xl bg-cyan-300 px-6 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-200/25 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? '支付中...' : '确认支付'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDialog;
