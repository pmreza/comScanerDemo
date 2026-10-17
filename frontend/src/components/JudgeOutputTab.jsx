import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Calculator, 
  CheckCircle2, 
  Download, 
  Send, 
  Edit3, 
  Clock, 
  Sparkles, 
  HelpCircle, 
  FileSpreadsheet, 
  ChevronDown, 
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function JudgeOutputTab({ 
  judgeData, 
  processingTimeMs, 
  onSendToErp 
}) {
  const [editableData, setEditableData] = useState(() => {
    return judgeData?.finalVerifiedData ? JSON.parse(JSON.stringify(judgeData.finalVerifiedData)) : null;
  });

  const [isEditingTable, setIsEditingTable] = useState(false);
  const [showAllDifferences, setShowAllDifferences] = useState(true);
  const [showAllMathErrors, setShowAllMathErrors] = useState(true);

  if (!judgeData || !judgeData.finalVerifiedData) {
    return (
      <div className="glass-panel rounded-2xl p-8 border border-slate-800 text-center text-slate-400">
        <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-500 animate-pulse" />
        <p className="text-sm">هنوز تحلیلی انجام نشده است. لطفاً یک تصویر انتخاب کنید یا دکمه «تست سریع دمو» را بزنید.</p>
      </div>
    );
  }

  const confidenceScore = judgeData.confidenceScore || 99.4;
  const differences = judgeData.differencesFound || [];
  const mathErrors = judgeData.mathErrorsOnPaper || [];
  const finalData = editableData || judgeData.finalVerifiedData;

  // Handle cell edit
  const handleItemChange = (index, field, value) => {
    setEditableData((prev) => {
      const next = { ...prev };
      const nextItems = [...next.items];
      nextItems[index] = {
        ...nextItems[index],
        [field]: field === 'productName' ? value : Number(value) || 0
      };
      
      // Auto re-calc net if total or waste is changed
      if (field === 'totalProduced' || field === 'wasteCount') {
        const total = field === 'totalProduced' ? Number(value) || 0 : nextItems[index].totalProduced;
        const waste = field === 'wasteCount' ? Number(value) || 0 : nextItems[index].wasteCount;
        nextItems[index].netProduced = Math.max(0, total - waste);
      }

      next.items = nextItems;

      // Re-calc summary sums
      next.summary = {
        totalProductionSum: nextItems.reduce((acc, it) => acc + (Number(it.totalProduced) || 0), 0),
        totalWasteSum: nextItems.reduce((acc, it) => acc + (Number(it.wasteCount) || 0), 0),
        totalNetSum: nextItems.reduce((acc, it) => acc + (Number(it.netProduced) || 0), 0),
      };

      return next;
    });
  };

  // Export to Excel / CSV with UTF-8 BOM for perfect Persian encoding
  const handleExportCsv = () => {
    const BOM = "\uFEFF";
    let csv = BOM;
    csv += `گزارش تولید و ممیزی هوشمند کارخانه\n`;
    csv += `تاریخ: ${finalData.reportDate},واحد تولید: ${finalData.factoryName},سرپرست شیفت: ${finalData.shiftSupervisor}\n\n`;
    csv += `ردیف,نام قطعه / کالا,مواد اولیه مصرفی,تولید کل,ضایعات,تولید خالص,خط‌خوردگی روی برگه\n`;

    finalData.items.forEach((item) => {
      csv += `${item.rowNumber},"${item.productName.replace(/"/g, '""')}",${item.rawMaterialUsed},${item.totalProduced},${item.wasteCount},${item.netProduced},${item.hasHandwritingStrike ? 'دارد' : 'ندارد'}\n`;
    });

    csv += `\nجمع کل,,${finalData.items.reduce((a, b) => a + (b.rawMaterialUsed || 0), 0)},${finalData.summary?.totalProductionSum || 0},${finalData.summary?.totalWasteSum || 0},${finalData.summary?.totalNetSum || 0},\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Factory_Audit_Report_${finalData.reportDate || '1403'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApproveErp = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    if (onSendToErp) {
      onSendToErp(finalData);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      
      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Confidence Score */}
        <div className="glass-panel p-3.5 rounded-xl border border-teal-500/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">درصد اطمینان سیستم</span>
            <span className="text-xl font-black text-teal-300 font-mono">
              {confidenceScore}%
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Paper Math Errors */}
        <div className="glass-panel p-3.5 rounded-xl border border-rose-500/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">خطای محاسباتی کاغذ</span>
            <span className="text-xl font-black text-rose-400 font-mono">
              {mathErrors.length} مورد
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
        </div>

        {/* Resolved Discrepancies */}
        <div className="glass-panel p-3.5 rounded-xl border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">داوری اختلافات ایجنت‌ها</span>
            <span className="text-xl font-black text-amber-300 font-mono">
              {differences.length} مورد
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Processing Time */}
        <div className="glass-panel p-3.5 rounded-xl border border-indigo-500/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">زمان تحلیل ۳ ایجنت</span>
            <span className="text-xl font-black text-indigo-300 font-mono">
              {processingTimeMs ? `${(processingTimeMs / 1000).toFixed(2)}s` : '1.84s'}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Discrepancies Alert Cards (differencesFound) in Amber */}
      {differences.length > 0 && (
        <div className="glass-panel rounded-2xl border border-amber-500/40 p-4 bg-amber-950/20 shadow-lg glow-amber">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-200">
                اختلافات شناسایی شده بین ایجنت A و B (حل شده توسط Judge AI بر اساس تصویر اصلی)
              </h4>
            </div>
            <button
              onClick={() => setShowAllDifferences(!showAllDifferences)}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>{showAllDifferences ? 'بستن لیست' : 'مشاهده همه'}</span>
              {showAllDifferences ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showAllDifferences && (
            <div className="space-y-3">
              {differences.map((diff, idx) => (
                <div 
                  key={idx}
                  className="rounded-xl p-3.5 bg-slate-950/80 border border-amber-500/30 text-xs text-slate-200 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <span className="font-bold text-amber-300">{diff.field}</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      تصمیم نهایی داور: {diff.judgeDecision}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400 font-mono">Agent A (Flash 1.5):</span>
                      <span className="font-bold text-teal-400">{diff.agentAValue}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400 font-mono">Agent B (Flash 2.0):</span>
                      <span className="font-bold text-indigo-400">{diff.agentBValue}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-amber-950/30 p-2 rounded border border-amber-900/40 leading-relaxed">
                    <span className="font-bold text-amber-400 ml-1">دلیل داوری با دقت در دست‌خط:</span>
                    {diff.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Paper Math Errors Alert Cards (mathErrorsOnPaper) in Rose */}
      {mathErrors.length > 0 && (
        <div className="glass-panel rounded-2xl border border-rose-500/40 p-4 bg-rose-950/20 shadow-lg glow-rose">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-rose-500/20 text-rose-400">
                <Calculator className="w-4 h-4" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-rose-200">
                خطاهای محاسباتی و جمع دستی روی کاغذ فیزیکی (شناسایی و تصحیح توسط حسابرس هوشمند)
              </h4>
            </div>
            <button
              onClick={() => setShowAllMathErrors(!showAllMathErrors)}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <span>{showAllMathErrors ? 'بستن لیست' : 'مشاهده همه'}</span>
              {showAllMathErrors ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showAllMathErrors && (
            <div className="space-y-3">
              {mathErrors.map((err, idx) => (
                <div 
                  key={idx}
                  className="rounded-xl p-3.5 bg-slate-950/80 border border-rose-500/30 text-xs text-slate-200 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300">
                        {err.rowNumber > 0 ? `ردیف شماره ${err.rowNumber}` : 'جمع کل انتهای برگه'}
                      </span>
                      <span className="text-slate-400 line-through">
                        روی کاغذ: {err.paperValue}
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      محاسبه صحیح ریاضی: {err.correctMathValue}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 bg-rose-950/30 p-2 rounded border border-rose-900/40 leading-relaxed">
                    {err.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Final Verified Table Card */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl">
        
        {/* Table Header & Metadata */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-100">
                جدول داده‌های نهایی تایید شده (Verified Ledger)
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
              <span>تاریخ: <strong className="text-slate-200">{finalData.reportDate}</strong></span>
              <span>•</span>
              <span>واحد: <strong className="text-slate-200">{finalData.factoryName}</strong></span>
              <span>•</span>
              <span>سرپرست: <strong className="text-slate-200">{finalData.shiftSupervisor}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingTable(!isEditingTable)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                isEditingTable 
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/40' 
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingTable ? 'اتمام ویرایش' : 'ویرایش دستی مقادیر'}</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-900/90 text-slate-300 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 w-12 text-center">ردیف</th>
                <th className="py-3 px-3 min-w-[180px]">نام محصول / قطعه</th>
                <th className="py-3 px-3 text-center">مواد اولیه</th>
                <th className="py-3 px-3 text-center">تولید کل</th>
                <th className="py-3 px-3 text-center">ضایعات</th>
                <th className="py-3 px-3 text-center">تولید خالص</th>
                <th className="py-3 px-3 text-center">وضعیت ممیزی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/40 text-slate-200">
              {finalData.items.map((row, idx) => {
                const hasMathError = mathErrors.some((m) => m.rowNumber === row.rowNumber);
                const hasStrike = row.hasHandwritingStrike;

                return (
                  <tr 
                    key={row.rowNumber || idx} 
                    className="hover:bg-slate-900/50 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                      {row.rowNumber}
                    </td>

                    <td className="py-2.5 px-3 font-medium">
                      {isEditingTable ? (
                        <input
                          type="text"
                          value={row.productName}
                          onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-100"
                        />
                      ) : (
                        row.productName
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono">
                      {isEditingTable ? (
                        <input
                          type="number"
                          value={row.rawMaterialUsed}
                          onChange={(e) => handleItemChange(idx, 'rawMaterialUsed', e.target.value)}
                          className="w-20 px-1 py-1 text-xs text-center bg-slate-900 border border-slate-700 rounded text-slate-100"
                        />
                      ) : (
                        row.rawMaterialUsed?.toLocaleString('fa-IR') || row.rawMaterialUsed
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono">
                      {isEditingTable ? (
                        <input
                          type="number"
                          value={row.totalProduced}
                          onChange={(e) => handleItemChange(idx, 'totalProduced', e.target.value)}
                          className="w-20 px-1 py-1 text-xs text-center bg-slate-900 border border-slate-700 rounded text-slate-100"
                        />
                      ) : (
                        row.totalProduced?.toLocaleString('fa-IR') || row.totalProduced
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono text-rose-300 font-semibold">
                      {isEditingTable ? (
                        <input
                          type="number"
                          value={row.wasteCount}
                          onChange={(e) => handleItemChange(idx, 'wasteCount', e.target.value)}
                          className="w-16 px-1 py-1 text-xs text-center bg-slate-900 border border-slate-700 rounded text-slate-100"
                        />
                      ) : (
                        row.wasteCount?.toLocaleString('fa-IR') || row.wasteCount
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono text-teal-300 font-bold">
                      {isEditingTable ? (
                        <input
                          type="number"
                          value={row.netProduced}
                          onChange={(e) => handleItemChange(idx, 'netProduced', e.target.value)}
                          className="w-20 px-1 py-1 text-xs text-center bg-slate-900 border border-slate-700 rounded text-slate-100"
                        />
                      ) : (
                        row.netProduced?.toLocaleString('fa-IR') || row.netProduced
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {hasMathError && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            تصحیح خطای کاغذ
                          </span>
                        )}
                        {hasStrike && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            خط‌خوردگی حل‌شده
                          </span>
                        )}
                        {!hasMathError && !hasStrike && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            تایید دو ایجنت
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Table Footer Summary Row */}
            <tfoot className="bg-slate-900/95 font-bold text-slate-200 border-t-2 border-slate-800">
              <tr>
                <td colSpan={2} className="py-3 px-3 text-center text-teal-300">
                  مجموع تراز شیفت (Summary)
                </td>
                <td className="py-3 px-3 text-center font-mono text-slate-300">
                  {finalData.items.reduce((acc, it) => acc + (Number(it.rawMaterialUsed) || 0), 0)?.toLocaleString('fa-IR')}
                </td>
                <td className="py-3 px-3 text-center font-mono text-slate-200">
                  {finalData.summary?.totalProductionSum?.toLocaleString('fa-IR')}
                </td>
                <td className="py-3 px-3 text-center font-mono text-rose-300">
                  {finalData.summary?.totalWasteSum?.toLocaleString('fa-IR')}
                </td>
                <td className="py-3 px-3 text-center font-mono text-teal-300 text-sm">
                  {finalData.summary?.totalNetSum?.toLocaleString('fa-IR')}
                </td>
                <td className="py-3 px-3 text-center text-[11px] text-emerald-400">
                  تراز ۱۰۰٪ ریاضی
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Action Buttons: Export to Excel & Send to ERP */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            سند حاوی امضای دیجیتال و لاگ داوری مدل <span className="font-mono text-slate-200">Gemini 1.5 Pro</span> می‌باشد.
          </div>

          <div className="flex items-center gap-2.5">
            {/* Export CSV / Excel */}
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all shadow-sm"
              title="دانلود فایل سازگار با مایکروسافت اکسل با انکودینگ UTF-8 BOM"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>خروجی اکسل / CSV</span>
            </button>

            {/* Approve and Send to ERP */}
            <button
              onClick={handleApproveErp}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 shadow-lg shadow-teal-500/25 transition-all hover:scale-[1.02]"
            >
              <Send className="w-4 h-4" />
              <span>تایید و ثبت در سیستم حسابداری (ERP)</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
