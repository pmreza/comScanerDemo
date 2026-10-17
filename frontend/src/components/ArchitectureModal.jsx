import React from 'react';
import { X, Layers, Cpu, CheckCircle, ArrowDown, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ArchitectureModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div 
        className="glass-panel w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 border border-slate-800 shadow-2xl bg-slate-900/95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">معماری ۳ لایه چند ایجنتی (Multi-Agent OCR & Audit)</h3>
              <p className="text-xs text-slate-400">چگونه ترکیب مدل‌های موازی خطا را به صفر نزدیک می‌کند؟</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-6 text-sm text-slate-300">
          
          {/* Explanation */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            در بازخوانی دست‌خط فارسی کارخانجات، خط‌خوردگی، شباهت ارقام (مانند ۲ و ۳ یا ۰ و ۵) و خطاهای جمع دستی انسان همواره چالش اصلی بوده‌اند. این سامانه با الهام از فرآیند حسابرسی چهارچشمی (Four-Eyes Principle)، از ۳ ایجنت هوش مصنوعی مجزا با رفتار مکمل استفاده می‌کند.
          </p>

          {/* 3 Agents Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Agent A */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-teal-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Agent A (Extractor 1)
                  </span>
                  <span className="text-xs font-mono text-slate-400">Gemini 1.5 Flash (T=0.1)</span>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">بازخوان مستقیم کاراکتر به کاراکتر</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  با کمترین درجه آزادی (دمای ۰.۱)، بر بازخوانی خام فرم، تفکیک ستون‌ها و ارقام فیزیکی تمرکز دارد و بدون اصلاح ریاضی متن را بازتاب می‌دهد.
                </p>
              </div>
              <div className="mt-3 text-[11px] text-teal-400 bg-teal-950/40 p-2 rounded border border-teal-900/50">
                اجرای موازی با تسک همزمان (Task.WhenAll)
              </div>
            </div>

            {/* Agent B */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-indigo-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Agent B (Extractor 2)
                  </span>
                  <span className="text-xs font-mono text-slate-400">Gemini 2.0 Flash (T=0.4)</span>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">حسابرس مستقل دیدگاه دوم</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  با زاویه دید مستقل و دمای بالاتر (۰.۴)، نسبت به تشخیص خط‌خوردگی‌ها و علائم دست‌کاری دستی حساس‌تر عمل می‌کند تا فرضیات ایجنت اول را به چالش بکشد.
                </p>
              </div>
              <div className="mt-3 text-[11px] text-indigo-400 bg-indigo-950/40 p-2 rounded border border-indigo-900/50">
                دیدگاه بدون بایاس و مستقل (Second Opinion)
              </div>
            </div>

          </div>

          {/* Merge Arrow */}
          <div className="flex justify-center -my-2">
            <div className="p-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 animate-bounce">
              <ArrowDown className="w-5 h-5" />
            </div>
          </div>

          {/* Agent C (Judge) */}
          <div className="p-4.5 rounded-xl bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border border-purple-500/40">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Agent C (Judge AI / سرحسابرس هوشمند)
              </span>
              <span className="text-xs font-mono text-purple-300">Gemini 1.5 Pro (T=0.0)</span>
            </div>
            
            <h4 className="text-sm font-semibold text-white mb-2">داوری اختلافات تصویری + ممیزی ریاضی کاغذ</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 mt-2">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="font-bold text-amber-400 block mb-1">۱. داوری موشکافانه (Visual Resolution):</span>
                تصویر اصلی دست‌خط را با خروجی A و B مقایسه کرده و در صورت اختلاف، دلیل فیزیکی (لکه جوهر، تصحیح قلم) را توضیح می‌دهد.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="font-bold text-rose-400 block mb-1">۲. کنترل فرمول‌های کارخانه (Math Logic):</span>
                فرمول <code className="text-teal-400 font-mono">تولید کل - ضایعات = خالص</code> و تراز جمع ستون‌ها را حسابرسی کرده و اشتباهات اپراتور روی برگه را فاش می‌کند.
              </div>
            </div>
          </div>

          {/* ERP Integration Output */}
          <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-400" />
              <span className="text-xs text-teal-200">
                خروجی نهایی: داده‌های پاکسازی شده آماده ثبت مستقیم در سپیدار، راهکاران سیستم، SAP یا صدور فایل اکسل
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
          >
            بستن
          </button>
        </div>

      </div>
    </div>
  );
}
