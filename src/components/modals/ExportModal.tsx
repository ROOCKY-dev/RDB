import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlassButton } from '@/components/ui/GlassButton';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { X, Image as ImageIcon, FileCode2, FileJson } from 'lucide-react';
import { exportToPng } from '@/lib/export/exportPng';
import { exportToSvg } from '@/lib/export/exportSvg';
import { exportToJson } from '@/lib/export/exportJson';
import { toast } from 'sonner';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { project } = useCanvasStore();
  const [isExporting, setIsExporting] = useState(false);
  const [transparentBg, setTransparentBg] = useState(false);

  if (!project) return null;

  const handleExportPng = async () => {
    try {
      setIsExporting(true);
      await exportToPng(project, { transparent: transparentBg });
      toast.success('Exported PNG successfully');
      onClose();
    } catch (err) {
      toast.error('Failed to export PNG');
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSvg = async () => {
    try {
      setIsExporting(true);
      await exportToSvg(project, { transparent: transparentBg });
      toast.success('Exported SVG successfully');
      onClose();
    } catch (err) {
      toast.error('Failed to export SVG');
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJson = () => {
    try {
      exportToJson(project);
      toast.success('Exported JSON successfully');
      onClose();
    } catch (err) {
      toast.error('Failed to export JSON');
      console.error(err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md"
          >
            <GlassPanel variant="modal" className="w-full flex flex-col bg-bg-secondary/90 shadow-2xl border-glass-border overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-glass-border bg-glass-bg">
                <h2 className="text-xl font-bold">Export Schema</h2>
                <GlassButton variant="icon" onClick={onClose} className="text-text-secondary hover:text-accent-red">
                  <X className="w-5 h-5" />
                </GlassButton>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">

                <div className="space-y-4">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={transparentBg}
                      onChange={(e) => setTransparentBg(e.target.checked)}
                      className="w-4 h-4 accent-accent-blue rounded cursor-pointer"
                    />
                    <span className="text-sm font-medium text-text-primary">Transparent Background</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={handleExportPng}
                    disabled={isExporting}
                    className="flex items-center p-4 rounded-xl border border-glass-border bg-glass-bg hover:bg-glass-hover hover:border-accent-blue/50 transition-all text-left disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center mr-4 shrink-0">
                      <ImageIcon className="w-5 h-5 text-accent-blue" />
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary">Export as PNG</h3>
                      <p className="text-xs text-text-secondary mt-0.5">High resolution image (2x) of your canvas</p>
                    </div>
                  </button>

                  <button
                    onClick={handleExportSvg}
                    disabled={isExporting}
                    className="flex items-center p-4 rounded-xl border border-glass-border bg-glass-bg hover:bg-glass-hover hover:border-accent-purple/50 transition-all text-left disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent-purple/10 flex items-center justify-center mr-4 shrink-0">
                      <FileCode2 className="w-5 h-5 text-accent-purple" />
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary">Export as SVG</h3>
                      <p className="text-xs text-text-secondary mt-0.5">Scalable vector graphics format</p>
                    </div>
                  </button>

                  <button
                    onClick={handleExportJson}
                    className="flex items-center p-4 rounded-xl border border-glass-border bg-glass-bg hover:bg-glass-hover hover:border-accent-green/50 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent-green/10 flex items-center justify-center mr-4 shrink-0">
                      <FileJson className="w-5 h-5 text-accent-green" />
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary">Export as JSON</h3>
                      <p className="text-xs text-text-secondary mt-0.5">Raw schema data for backup or sharing</p>
                    </div>
                  </button>
                </div>

              </div>
            </GlassPanel>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
