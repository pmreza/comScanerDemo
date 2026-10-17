import React from 'react';
import { 
  Scan, 
  Bot, 
  Scale, 
  CheckCircle2, 
  Loader2, 
  Clock, 
  Cpu, 
  Sparkles 
} from 'lucide-react';

export default function PipelineStepper({ 
  currentStep = 0, 
  isProcessing = false, 
  processingTimeMs = null,
  isDemoMode = false
}) {
  const steps = [
    {
      id: 1,
      title: 'پیش‌پردازش و تحلیل هندسی',
      subtext: 'نرمال‌سازی ابعاد، کنتراست خط‌خوردگی‌ها',
      icon: Scan,
      activeColor: 'from-blue-500 to-cyan-500',
      activeRing: 'ring-blue-500/50 shadow-blue-500/30'
    },
    {
      id: 2,
      title: 'استخراج موازی دو ایجنت',
      subtext: 'Flash 1.5 (T=0.1) || Flash 2.0 (T=0.4)',
      icon: Bot,
      activeColor: 'from-teal-500 to-emerald-500',
      activeRing: 'ring-teal-500/50 shadow-teal-500/30'
    },
    {
      id: 3,
      title: 'داوری بصری و ممیزی ریاضی',
      subtext: 'Judge AI (Gemini Pro) + Math Audit',
      icon: Scale,
      activeColor: 'from-indigo-500 to-purple-500',
      activeRing: 'ring-indigo-500/50 shadow-indigo-500/30'
    },
    {
      id: 4,
      title: 'تراز نهایی و صدور سند',
      subtext: 'جدول معتبر جهت ERP و فایل اکسل',
      icon: CheckCircle2,
      activeColor: 'from-emerald-500 to-teal-400',
      activeRing: 'ring-emerald-500/50 shadow-emerald-500/30'
    }
  ];

  return (
    <div className="w-full glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Cpu className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-200">
            خط لوله پردازش چند ایجنتی (Multi-Agent Pipeline Execution)
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {processingTimeMs && (
            <div className="flex items-center gap-1.5 text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>زمان پردازش:</span>
              <span className="font-mono text-teal-300 font-bold">{(processingTimeMs / 1000).toFixed(2)}s</span>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center gap-1.5 text-teal-400 bg-teal-950/50 px-2.5 py-1 rounded-md border border-teal-800/50 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>در حال ممیزی زنده...</span>
            </div>
          )}

          {isDemoMode && !isProcessing && (
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              حالت پیش‌نمایش آفلاین (Mock)
            </span>
          )}
        </div>
      </div>

      {/* Stepper Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isDone = currentStep > step.id || (currentStep === 4 && !isProcessing);
          const isCurrent = currentStep === step.id && isProcessing;
          const isPending = currentStep < step.id;

          return (
            <div
              key={step.id}
              className={`relative rounded-xl p-3.5 border transition-all duration-300 ${
                isCurrent 
                  ? 'bg-slate-900/90 border-teal-500/50 shadow-lg glow-teal ring-2 ring-teal-500/30' 
                  : isDone 
                  ? 'bg-slate-900/40 border-emerald-500/30 text-slate-300' 
                  : 'bg-slate-950/40 border-slate-800/60 opacity-60'
              }`}
            >
              {/* Connector dot indicator */}
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold ${
                  isDone 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : isCurrent 
                    ? 'bg-teal-500 text-slate-950 font-black animate-pulse' 
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {isDone ? '✓' : step.id}
                </span>

                <div className="flex items-center">
                  {isCurrent && (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[10px] text-emerald-400 font-medium">تکمیل شد</span>
                  )}
                </div>
              </div>

              {/* Title & Icon */}
              <div className="flex items-center gap-2">
                <StepIcon className={`w-4 h-4 shrink-0 ${
                  isCurrent ? 'text-teal-400 animate-spin-slow' : isDone ? 'text-emerald-400' : 'text-slate-500'
                }`} />
                <h4 className={`text-xs font-bold ${
                  isCurrent ? 'text-teal-200' : isDone ? 'text-slate-200' : 'text-slate-400'
                }`}>
                  {step.title}
                </h4>
              </div>

              {/* Subtitle */}
              <p className="text-[11px] text-slate-400 mt-1 font-mono line-clamp-1">
                {step.subtext}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
