import React, { useState } from 'react';
import { Key, Eye, EyeOff, Check, X, ShieldAlert, ExternalLink } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, currentKey, onSaveKey }) {
  const [keyInput, setKeyInput] = useState(currentKey || '');
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveKey(keyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
  };

  const handleClear = () => {
    setKeyInput('');
    onSaveKey('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-800 shadow-2xl bg-slate-900/95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">تنظیم کلید Google Gemini API</h3>
              <p className="text-xs text-slate-400">برای اجرای زنده سناریوی Multi-Agent</p>
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
        <div className="mt-4 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            کلید شما صرفاً در حافظه مرورگر شما (localStorage) ذخیره شده و از طریق هدر{' '}
            <code className="text-teal-400 bg-slate-800 px-1 py-0.5 rounded">X-Gemini-Key</code>{' '}
            به بک‌اند ارسال می‌گردد.
          </p>

          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              dir="ltr"
              className="w-full px-4 py-2.5 pl-10 text-sm font-mono bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/30 flex items-start gap-2.5 text-xs text-indigo-300">
            <ExternalLink className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
            <div>
              <span>دریافت رایگان کلید API از گوگل استودیو: </span>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="underline hover:text-white font-medium"
              >
                aistudio.google.com/app/apikey
              </a>
              <p className="text-[11px] text-slate-400 mt-0.5">
                (در صورت نداشتن کلید، دکمه «تست سریع دمو» کل فرآیند را بدون قطعی شبیه‌سازی می‌کند)
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-all"
          >
            حذف کلید
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-lg shadow-teal-700/20 transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>ذخیره شد!</span>
                </>
              ) : (
                <span>ذخیره کلید</span>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
