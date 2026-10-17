import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Play, 
  CheckCircle, 
  FileCheck, 
  FileText, 
  X,
  Sparkles,
  Layers
} from 'lucide-react';
import { sampleImagesList } from '../mockData';

export default function ImagePanel({ 
  selectedImage, 
  previewUrl, 
  onImageSelected, 
  onStartAnalysis, 
  isProcessing,
  sampleFileName
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      onImageSelected(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  const handleSelectSample = async (sample) => {
    try {
      const res = await fetch(`/samples/${sample.fileName}`);
      const blob = await res.blob();
      const file = new File([blob], sample.fileName, { type: blob.type || 'image/jpeg' });
      onImageSelected(file, sample.fileName);
    } catch (err) {
      console.error("Failed to load sample image file", err);
    }
  };

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.3, 3));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.3, 0.7));
  const resetZoom = () => setZoomLevel(1);

  return (
    <div className="w-full flex flex-col gap-4 sticky top-22">
      
      {/* Upload & Preview Card */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl flex flex-col">
        
        {/* Title */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <ImageIcon className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-200">
              سند دست‌نویس کارخانه (Sheet Scan)
            </h3>
          </div>

          {previewUrl && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-teal-400 hover:text-teal-300 font-medium underline transition-all"
            >
              تغییر تصویر
            </button>
          )}
        </div>

        {/* Hidden File Input */}
        <input 
          ref={fileInputRef} 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange} 
        />

        {/* Dropzone / Preview Area */}
        {previewUrl ? (
          <div className="relative flex flex-col rounded-xl overflow-hidden border border-slate-800 bg-slate-950 min-h-[340px] max-h-[460px]">
            
            {/* Floating Zoom & Controls Toolbar */}
            <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2 py-1.5 rounded-xl border border-slate-700/70 shadow-lg">
              <button 
                onClick={zoomIn} 
                className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-all"
                title="بزرگنمایی"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button 
                onClick={zoomOut} 
                className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-all"
                title="کوچک‌نمایی"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button 
                onClick={resetZoom} 
                className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-all text-xs font-mono"
                title="بازنشانی اندازه"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <div className="h-3 w-px bg-slate-700 mx-0.5" />
              <button 
                onClick={() => setIsFullscreen(true)} 
                className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-all"
                title="نمایش تمام‌صفحه با رزولوشن کامل"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono text-teal-400 px-1 font-bold">
                {Math.round(zoomLevel * 100)}%
              </span>
            </div>

            {/* Image Container with Scroll & Zoom */}
            <div className="w-full h-full flex-1 overflow-auto flex items-center justify-center p-2 select-none">
              <img
                src={previewUrl}
                alt="اسکن دست‌نویس کارخانه"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                className="max-h-[420px] w-auto object-contain transition-transform duration-150 rounded shadow"
              />
            </div>

            {/* Sheet Badge */}
            <div className="absolute bottom-2 right-2 z-20 bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-teal-400" />
              <span className="truncate max-w-[200px]">
                {selectedImage?.name || sampleFileName || "برگه دست‌نویس"}
              </span>
            </div>

          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[280px] ${
              isDragOver 
                ? 'border-teal-500 bg-teal-950/20 shadow-inner' 
                : 'border-slate-700/80 hover:border-teal-500/70 bg-slate-900/40 hover:bg-slate-900/70'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center mb-3">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-200 mb-1">
              تصویر یا اسکن برگه دست‌نویس را اینجا بکشید
            </h4>
            <p className="text-xs text-slate-400 mb-4 max-w-xs">
              پشتیبانی از فرمت‌های JPG, PNG, WEBP با وضوح بالا
            </p>
            <span className="px-4 py-2 text-xs font-semibold text-teal-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-all">
              انتخاب فایل از رایانه
            </span>
          </div>
        )}

        {/* Start Analysis CTA Button */}
        <div className="mt-4">
          <button
            onClick={onStartAnalysis}
            disabled={!previewUrl || isProcessing}
            className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-300 shadow-xl ${
              !previewUrl 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50' 
                : isProcessing 
                ? 'bg-teal-600/50 text-teal-200 cursor-wait animate-pulse' 
                : 'bg-gradient-to-r from-teal-500 via-emerald-600 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.01]'
            }`}
          >
            {isProcessing ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>در حال اجرای ممیزی ۳ ایجنتی...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>شروع پردازش چند ایجنتی (Start Multi-Agent Pipeline)</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Quick Sample Sheets Carousel / Selector */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h4 className="text-xs font-bold text-slate-300">
            برگه‌های نمونه کارخانه جهت بررسی فوری:
          </h4>
        </div>

        <div className="space-y-2">
          {sampleImagesList.map((sample, idx) => {
            const isSelected = sampleFileName === sample.fileName;
            return (
              <button
                key={sample.fileName}
                onClick={() => handleSelectSample(sample)}
                disabled={isProcessing}
                className={`w-full text-right p-2.5 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                  isSelected 
                    ? 'bg-teal-950/40 border-teal-500/60 text-teal-200 shadow-sm' 
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                }`}
              >
                <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
                  <img 
                    src={`/samples/${sample.fileName}`} 
                    alt={sample.title}
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-slate-200 truncate">{sample.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isSelected ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {sample.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {sample.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Modal Preview */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-5xl max-h-[95vh] w-full h-full flex flex-col items-center justify-center">
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 left-4 z-50 p-2 rounded-xl bg-slate-900/90 border border-slate-700 text-white hover:bg-slate-800"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewUrl}
              alt="برگه دست‌نویس تمام صفحه"
              className="max-h-[90vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}

    </div>
  );
}
