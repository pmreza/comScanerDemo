import React, { useState } from 'react';
import { Bot, Copy, Check, Code, FileText, ArrowLeftRight, Sparkles } from 'lucide-react';

export default function AgentsComparisonTab({ agentA, agentB }) {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'json'
  const [copiedSide, setCopiedSide] = useState(null);

  if (!agentA || !agentB) {
    return (
      <div className="glass-panel rounded-2xl p-8 border border-slate-800 text-center text-slate-400">
        <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-500 animate-pulse" />
        <p className="text-sm">داده‌های استخراج دو ایجنت موجود نیست. لطفاً ابتدا اسکن را اجرا کنید.</p>
      </div>
    );
  }

  const handleCopy = (data, side) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedSide(side);
    setTimeout(() => setCopiedSide(null), 1500);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      
      {/* Top Controls Bar */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
          <span className="text-xs sm:text-sm font-bold text-slate-200">
            مقایسه رو در رو استخراج مستقل (Side-by-Side Dual Agent Extraction)
          </span>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 rounded font-medium transition-all ${
              viewMode === 'table' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            نمایش جدولی
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`px-3 py-1 rounded font-medium transition-all ${
              viewMode === 'json' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            ساختار JSON خام
          </button>
        </div>
      </div>

      {/* Dual Side-by-Side Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Agent A Card */}
        <div className="glass-panel rounded-2xl border border-teal-500/30 p-4 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-teal-300">
                  Agent A: بازخوان مستقیم (Extractor 1)
                </h4>
                <p className="text-[11px] font-mono text-slate-400">Gemini 1.5 Flash • T=0.1</p>
              </div>
            </div>

            <button
              onClick={() => handleCopy(agentA, 'agentA')}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition-all"
              title="کپی JSON ایجنت A"
            >
              {copiedSide === 'agentA' ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[10px]">{copiedSide === 'agentA' ? 'کپی شد' : 'کپی JSON'}</span>
            </button>
          </div>

          {/* Metadata preview */}
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 mb-3 text-[11px] text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">تاریخ برگه:</span>
              <span className="font-semibold text-slate-200">{agentA.reportDate || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">سرپرست شیفت:</span>
              <span className="font-semibold text-slate-200">{agentA.shiftSupervisor || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">واحد کارخانه:</span>
              <span className="font-semibold text-slate-200 truncate max-w-[200px]">{agentA.factoryName || '—'}</span>
            </div>
          </div>

          {/* Content: Table or JSON */}
          {viewMode === 'table' ? (
            <div className="overflow-x-auto rounded-xl border border-slate-800 flex-1">
              <table className="w-full text-right text-[11px]">
                <thead className="bg-slate-900 text-slate-300 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-2 text-center">ردیف</th>
                    <th className="py-2 px-2">نام قطعه</th>
                    <th className="py-2 px-2 text-center">تولید</th>
                    <th className="py-2 px-2 text-center">ضایعات</th>
                    <th className="py-2 px-2 text-center">خالص</th>
                    <th className="py-2 px-2 text-center">خط‌خوردگی</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950/50">
                  {agentA.items?.map((item, idx) => {
                    const agentBItem = agentB?.items?.[idx];
                    const isDiff = agentBItem && (
                      item.totalProduced !== agentBItem.totalProduced ||
                      item.wasteCount !== agentBItem.wasteCount ||
                      item.netProduced !== agentBItem.netProduced
                    );

                    return (
                      <tr 
                        key={idx}
                        className={isDiff ? 'bg-amber-950/20' : ''}
                      >
                        <td className="py-2 px-2 text-center text-slate-400 font-mono">{item.rowNumber}</td>
                        <td className="py-2 px-2 font-medium truncate max-w-[130px]">{item.productName}</td>
                        <td className="py-2 px-2 text-center font-mono">{item.totalProduced}</td>
                        <td className={`py-2 px-2 text-center font-mono font-bold ${
                          isDiff ? 'text-amber-400 bg-amber-900/30 rounded' : 'text-rose-300'
                        }`}>
                          {item.wasteCount}
                        </td>
                        <td className="py-2 px-2 text-center font-mono text-teal-300">{item.netProduced}</td>
                        <td className="py-2 px-2 text-center">
                          {item.hasHandwritingStrike ? (
                            <span className="text-[10px] text-amber-400 font-medium">دارد</span>
                          ) : (
                            <span className="text-[10px] text-slate-500">ندارد</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-teal-300 overflow-x-auto max-h-[350px]">
              {JSON.stringify(agentA, null, 2)}
            </pre>
          )}

          {/* Summary footer */}
          <div className="mt-3 p-2 bg-slate-900/80 rounded-lg border border-slate-800 flex justify-between text-xs font-mono text-slate-300">
            <span>تولید کل: {agentA.summary?.totalProductionSum}</span>
            <span>ضایعات: {agentA.summary?.totalWasteSum}</span>
            <span className="text-teal-300 font-bold">خالص: {agentA.summary?.totalNetSum}</span>
          </div>
        </div>

        {/* Agent B Card */}
        <div className="glass-panel rounded-2xl border border-indigo-500/30 p-4 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-indigo-300">
                  Agent B: دیدگاه دوم مستقل (Extractor 2)
                </h4>
                <p className="text-[11px] font-mono text-slate-400">Gemini 2.0 Flash • T=0.4</p>
              </div>
            </div>

            <button
              onClick={() => handleCopy(agentB, 'agentB')}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition-all"
              title="کپی JSON ایجنت B"
            >
              {copiedSide === 'agentB' ? <Check className="w-3.5 h-3.5 text-indigo-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[10px]">{copiedSide === 'agentB' ? 'کپی شد' : 'کپی JSON'}</span>
            </button>
          </div>

          {/* Metadata preview */}
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 mb-3 text-[11px] text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">تاریخ برگه:</span>
              <span className="font-semibold text-slate-200">{agentB.reportDate || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">سرپرست شیفت:</span>
              <span className="font-semibold text-slate-200">{agentB.shiftSupervisor || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">واحد کارخانه:</span>
              <span className="font-semibold text-slate-200 truncate max-w-[200px]">{agentB.factoryName || '—'}</span>
            </div>
          </div>

          {/* Content: Table or JSON */}
          {viewMode === 'table' ? (
            <div className="overflow-x-auto rounded-xl border border-slate-800 flex-1">
              <table className="w-full text-right text-[11px]">
                <thead className="bg-slate-900 text-slate-300 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-2 text-center">ردیف</th>
                    <th className="py-2 px-2">نام قطعه</th>
                    <th className="py-2 px-2 text-center">تولید</th>
                    <th className="py-2 px-2 text-center">ضایعات</th>
                    <th className="py-2 px-2 text-center">خالص</th>
                    <th className="py-2 px-2 text-center">خط‌خوردگی</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950/50">
                  {agentB.items?.map((item, idx) => {
                    const agentAItem = agentA?.items?.[idx];
                    const isDiff = agentAItem && (
                      item.totalProduced !== agentAItem.totalProduced ||
                      item.wasteCount !== agentAItem.wasteCount ||
                      item.netProduced !== agentAItem.netProduced
                    );

                    return (
                      <tr 
                        key={idx}
                        className={isDiff ? 'bg-amber-950/20' : ''}
                      >
                        <td className="py-2 px-2 text-center text-slate-400 font-mono">{item.rowNumber}</td>
                        <td className="py-2 px-2 font-medium truncate max-w-[130px]">{item.productName}</td>
                        <td className="py-2 px-2 text-center font-mono">{item.totalProduced}</td>
                        <td className={`py-2 px-2 text-center font-mono font-bold ${
                          isDiff ? 'text-amber-400 bg-amber-900/30 rounded' : 'text-rose-300'
                        }`}>
                          {item.wasteCount}
                        </td>
                        <td className="py-2 px-2 text-center font-mono text-indigo-300">{item.netProduced}</td>
                        <td className="py-2 px-2 text-center">
                          {item.hasHandwritingStrike ? (
                            <span className="text-[10px] text-amber-400 font-medium">دارد</span>
                          ) : (
                            <span className="text-[10px] text-slate-500">ندارد</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-indigo-300 overflow-x-auto max-h-[350px]">
              {JSON.stringify(agentB, null, 2)}
            </pre>
          )}

          {/* Summary footer */}
          <div className="mt-3 p-2 bg-slate-900/80 rounded-lg border border-slate-800 flex justify-between text-xs font-mono text-slate-300">
            <span>تولید کل: {agentB.summary?.totalProductionSum}</span>
            <span>ضایعات: {agentB.summary?.totalWasteSum}</span>
            <span className="text-indigo-300 font-bold">خالص: {agentB.summary?.totalNetSum}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
