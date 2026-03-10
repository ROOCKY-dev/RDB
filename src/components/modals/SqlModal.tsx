import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlassButton } from '@/components/ui/GlassButton';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { generateSQL } from '@/lib/sql-generators';
import { X, Copy, Download, Check } from 'lucide-react';
import { ProjectSettings } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SqlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SqlModal({ isOpen, onClose }: SqlModalProps) {
  const { project } = useCanvasStore();
  const [dialect, setDialect] = useState<ProjectSettings['defaultDialect']>('postgresql');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (project && isOpen) {
      setTimeout(() => {
        setDialect(project.settings.defaultDialect);
      }, 0);
    }
  }, [project, isOpen]);

  const sql = project && isOpen ? generateSQL(project, dialect) : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.name || 'schema'}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
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
            className="relative w-full max-w-4xl h-[85vh] flex flex-col"
          >
            <GlassPanel variant="modal" className="w-full h-full flex flex-col bg-bg-secondary/90 shadow-2xl border-glass-border overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-glass-border bg-glass-bg">
                <div className="flex items-center space-x-6">
                  <h2 className="text-xl font-bold">Generated SQL</h2>

                  {/* Dialect Tabs */}
                  <div className="flex bg-bg-primary/50 p-1 rounded-lg border border-glass-border">
                    {(['postgresql', 'mysql', 'sqlite', 'mssql'] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDialect(d)}
                        className={cn(
                          "px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize",
                          dialect === d
                            ? "bg-accent-blue text-white shadow-md"
                            : "text-text-secondary hover:text-text-primary hover:bg-glass-hover"
                        )}
                      >
                        {d === 'mssql' ? 'SQL Server' : d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <GlassButton variant="secondary" onClick={handleCopy} className="space-x-2">
                    {copied ? <Check className="w-4 h-4 text-accent-green" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </GlassButton>

                  <GlassButton variant="primary" onClick={handleDownload} className="space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </GlassButton>

                  <div className="w-px h-6 bg-glass-border mx-2" />

                  <GlassButton variant="icon" onClick={onClose} className="text-text-secondary hover:text-accent-red">
                    <X className="w-5 h-5" />
                  </GlassButton>
                </div>
              </div>

              {/* Code Area */}
              <div className="flex-1 overflow-auto bg-[#0d0d12] p-6 relative group custom-scrollbar">
                <pre className="font-mono text-[13px] leading-relaxed text-blue-300">
                  <code dangerouslySetInnerHTML={{
                    __html: sql
                      .replace(/--.*/g, match => `<span class="text-text-tertiary">${match}</span>`)
                      .replace(/\/\*[\s\S]*?\*\//g, match => `<span class="text-text-tertiary">${match}</span>`)
                      .replace(/\b(CREATE|TABLE|ALTER|ADD|CONSTRAINT|FOREIGN|KEY|REFERENCES|PRIMARY|UNIQUE|INDEX|ON|DEFAULT|NOT|NULL|COMMENT|IS|EXEC|IDENTITY|GO)\b/g, match => `<span class="text-accent-purple font-bold">${match}</span>`)
                      .replace(/\b(INT|BIGINT|SMALLINT|SERIAL|BIGSERIAL|SMALLSERIAL|VARCHAR|CHAR|TEXT|BOOLEAN|DATE|TIMESTAMP|TIMESTAMPTZ|FLOAT|DOUBLE|DECIMAL|JSON|JSONB|BLOB|ENUM|INTEGER)\b/g, match => `<span class="text-accent-yellow">${match}</span>`)
                      .replace(/['"`\[\]]/g, match => `<span class="text-accent-green">${match}</span>`)
                  }} />
                </pre>
              </div>

            </GlassPanel>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
