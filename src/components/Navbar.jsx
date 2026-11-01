import React, { useRef } from 'react';
import { 
  Sparkles, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Printer, 
  Download, 
  FileCode, 
  RotateCcw, 
  FolderDown, 
  FolderUp,
  Eye,
  Edit3,
  FileText,
  MessageSquareHeart
} from 'lucide-react';
import { generateStandaloneHtml } from '../utils/exportHtml';
import { downloadBiodataText } from '../utils/exportText';

export default function Navbar({ 
  data, 
  onResetData, 
  onLoadDemo, 
  onImportData, 
  previewMode, 
  setPreviewMode,
  mobileActiveView,
  setMobileActiveView,
  onOpenFeedback
}) {
  const fileInputRef = useRef(null);

  // Download Standalone HTML file
  const handleExportHtml = () => {
    const htmlContent = generateStandaloneHtml(data);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanName = (data.fullName || 'Biodata').replace(/[^a-zA-Z0-9]/g, '_');
    a.download = `${cleanName}_ShubhParichay_Biodata.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Prompt for feedback after download
    setTimeout(() => {
      onOpenFeedback?.();
    }, 800);
  };

  // Download Plain Text file (~2 KB)
  const handleExportText = () => {
    downloadBiodataText(data);
    // Prompt for feedback
    setTimeout(() => {
      onOpenFeedback?.();
    }, 800);
  };

  // Print PDF
  const handlePrintPdf = () => {
    window.print();
    // Prompt for feedback after printing dialog closes
    setTimeout(() => {
      onOpenFeedback?.();
    }, 1200);
  };

  // Download JSON backup
  const handleSaveJson = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanName = (data.fullName || 'Biodata').replace(/[^a-zA-Z0-9]/g, '_');
    a.download = `${cleanName}_Biodata_Profile.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import JSON file
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          onImportData(parsed);
          alert('Biodata profile imported successfully!');
        } catch {
          alert('Failed to parse JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center text-stone-950 font-bold shadow-md shadow-amber-900/40">
            <span className="font-sanskrit text-lg">शुभ</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-base md:text-lg tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400">
                ShubhParichay
              </span>
              <span className="hidden sm:inline-block font-sanskrit text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                शुभ परिचय
              </span>
            </div>
            <p className="text-[10px] text-stone-400 -mt-0.5 hidden sm:block">
              Royal Indian Marriage Biodata Studio
            </p>
          </div>
        </div>

        {/* Center: Device View Toggles (Desktop only) */}
        <div className="hidden lg:flex items-center gap-1 bg-stone-800/80 p-1 rounded-xl border border-stone-700">
          <button
            type="button"
            onClick={() => setPreviewMode('mobile')}
            className={`p-1.5 rounded-lg transition-all ${
              previewMode === 'mobile' 
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-xs' 
                : 'text-stone-400 hover:text-white'
            }`}
            title="Mobile View"
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode('tablet')}
            className={`p-1.5 rounded-lg transition-all ${
              previewMode === 'tablet' 
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-xs' 
                : 'text-stone-400 hover:text-white'
            }`}
            title="Tablet View"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode('desktop')}
            className={`p-1.5 rounded-lg transition-all ${
              previewMode === 'desktop' 
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-xs' 
                : 'text-stone-400 hover:text-white'
            }`}
            title="Desktop View"
          >
            <Monitor className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile View Switcher */}
        <div className="flex lg:hidden items-center bg-stone-800 p-0.5 rounded-xl border border-stone-700">
          <button
            type="button"
            onClick={() => setMobileActiveView('editor')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              mobileActiveView === 'editor' 
                ? 'bg-amber-500 text-stone-950 font-semibold' 
                : 'text-stone-300'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveView('preview')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              mobileActiveView === 'preview' 
                ? 'bg-amber-500 text-stone-950 font-semibold' 
                : 'text-stone-300'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>

        {/* Right Actions: Text, HTML, PDF, Feedback */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sample Demo Data */}
          <button
            type="button"
            onClick={onLoadDemo}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition-all border border-stone-700/80"
            title="Fill with sample royal profile"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Sample</span>
          </button>

          {/* Plain Text (.txt) Download */}
          <button
            type="button"
            onClick={handleExportText}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-stone-800 text-amber-200 border border-stone-700 hover:bg-stone-700 transition-all shadow-xs"
            title="Download lightweight Plain Text summary (~2 KB)"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>.TXT <span className="hidden md:inline font-normal text-stone-400">(2KB)</span></span>
          </button>

          {/* Standalone HTML Export */}
          <button
            type="button"
            onClick={handleExportHtml}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25 transition-all shadow-xs"
            title="Download single-file offline HTML"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">HTML</span>
          </button>

          {/* Save PDF */}
          <button
            type="button"
            onClick={handlePrintPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-105 transition-all shadow-sm shadow-amber-900/30"
            title="Print or Save as A4 PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Save PDF</span>
          </button>

          {/* Feedback Icon Button */}
          <button
            type="button"
            onClick={onOpenFeedback}
            className="flex items-center p-1.5 rounded-xl text-stone-400 hover:text-amber-300 hover:bg-stone-800 transition-colors"
            title="Share Feedback"
          >
            <MessageSquareHeart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
