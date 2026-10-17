import React from 'react';
import { 
  Cpu, 
  Key, 
  Sparkles, 
  FileSpreadsheet, 
  ShieldCheck, 
  Info, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function Navbar({ 
  apiKey, 
  onOpenApiKeyModal, 
  onLoadDemoData, 
  onOpenArchitectureModal, 
  isProcessing,
  isDemoLoaded 
}) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 text-white shadow-lg shadow-teal-500/20">
            <Cpu className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                سامانه هوشمند پردازش و ممیزی گزارش‌های خطوط تولید
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                معماری Multi-Agent
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden md:block">
              بازخوانی موازی دست‌خط فارسی، تطبیق تصویری اختلافات و حسابرسی خودکار خطاهای انسانی کاغذ
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Architecture Modal Button */}
          <button
            onClick={onOpenArchitectureModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-all"
            title="مشاهده دیاگرام معماری ۳ ایجنت"
          >
            <Info className="w-4 h-4 text-indigo-400" />
            <span>معماری سیستم</span>
          </button>

          {/* Quick Demo Data Button */}
          <button
            onClick={onLoadDemoData}
            disabled={isProcessing}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all shadow-sm ${
              isDemoLoaded 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30' 
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/30'
            }`}
            title="بارگذاری سناریوی واقعی شامل اختلاف ایجنت‌ها و خطای محاسباتی روی کاغذ بدون نیاز به اینترنت"
          >
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            <span className="whitespace-nowrap">
              {isDemoLoaded ? 'داده دمو فعال است' : 'تست سریع بدون آپلود (دمو)'}
            </span>
          </button>

          {/* API Key Configure Button */}
          <button
            onClick={onOpenApiKeyModal}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
              apiKey 
                ? 'bg-slate-900 hover:bg-slate-800 text-teal-400 border-teal-500/40 shadow-sm shadow-teal-500/10' 
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
            }`}
          >
            <Key className={`w-4 h-4 ${apiKey ? 'text-teal-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">
              {apiKey ? 'کلید جمینای تنظیم شده' : 'تنظیم Gemini API Key'}
            </span>
            <span className="sm:hidden">کلید API</span>
            {apiKey ? (
              <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            )}
          </button>

        </div>

      </div>
    </header>
  );
}
