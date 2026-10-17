import React from 'react';
import { CheckCircle2, X, Printer, ArrowRight, Building2, Hash, Calendar, ShieldCheck } from 'lucide-react';

export default function ErpSuccessModal({ isOpen, onClose, finalData }) {
  if (!isOpen || !finalData) return null;

  const txnId = `ERP-TXN-${Date.now().toString().slice(-6)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div 
        className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-emerald-500/40 shadow-2xl bg-slate-900/95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center pb-4 border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white">تایید نهایی و ثبت موفق در سیستم ERP</h3>
          <p className="text-xs text-slate-400 mt-1">
            سند با امضای داوری هوشمند در پایگاه داده مالی و انبار کارخانه ثبت گردید
          </p>
        </div>

        {/* Voucher Info */}
        <div className="my-5 space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-teal-400" />
              شماره پیگیری سند ERP:
            </span>
            <span className="font-mono font-bold text-teal-300">{txnId}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              سیستم مقصد:
            </span>
            <span className="font-semibold text-slate-200">سپیدار / راهکاران سیستم (ماژول تولید و انبار)</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              تاریخ شیفت و گزارش:
            </span>
            <span className="font-semibold text-slate-200">{finalData.reportDate}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-slate-400">تعداد ردیف‌های تایید شده:</span>
            <span className="font-bold text-slate-200">{finalData.items?.length} ردیف کالا</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">مجموع تولید خالص وارده به انبار:</span>
            <span className="font-bold text-teal-300 text-sm">
              {finalData.summary?.totalNetSum?.toLocaleString('fa-IR')} واحد
            </span>
          </div>
        </div>

        {/* Audit confirmation note */}
        <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-800/40 text-[11px] text-teal-300 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-teal-400" />
          <span>
            کلیه خطاهای محاسباتی انسانی برگه اصلاح شده و لاگ مقایسه چند ایجنتی به پیوست سند الکترونیکی آرشیو شد.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>چاپ حواله رسمی</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-all shadow-md shadow-teal-700/20"
          >
            <span>بستن و ادامه کار</span>
          </button>
        </div>

      </div>
    </div>
  );
}
