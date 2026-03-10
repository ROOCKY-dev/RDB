import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { Search, Plus, Save, Image as ImageIcon, FileJson, Table, Maximize } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { exportToPng } from '@/lib/export/exportPng';
import { exportToSvg } from '@/lib/export/exportSvg';
import { exportToJson } from '@/lib/export/exportJson';
import { toast } from 'sonner';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSqlModal: () => void;
}

export function CommandPalette({ isOpen, onClose, onOpenSqlModal }: CommandPaletteProps) {
  const { project, addTable, saveProject, setSelectedTable } = useCanvasStore();
  const { fitView, setCenter } = useReactFlow();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Group commands and actions
  const commands = [
    { id: 'add-table', icon: Plus, label: 'Add Table', action: () => addTable({ x: window.innerWidth/2, y: window.innerHeight/2 }) },
    { id: 'save', icon: Save, label: 'Save Project', action: async () => { await saveProject(); toast.success('Project saved'); } },
    { id: 'sql', icon: Search, label: 'Generate SQL', action: onOpenSqlModal },
    { id: 'fit-view', icon: Maximize, label: 'Fit View to Screen', action: () => fitView({ padding: 0.2, duration: 500 }) },
    { id: 'export-png', icon: ImageIcon, label: 'Export as PNG', action: () => { if (project) exportToPng(project); } },
    { id: 'export-svg', icon: ImageIcon, label: 'Export as SVG', action: () => { if (project) exportToSvg(project); } },
    { id: 'export-json', icon: FileJson, label: 'Export as JSON', action: () => { if (project) exportToJson(project); } },
  ];

  const tableCommands = project?.tables.map(t => ({
    id: `table-${t.id}`,
    icon: Table,
    label: `Go to Table: ${t.name}`,
    action: () => {
      setSelectedTable(t.id);
      setCenter(t.position.x + 110, t.position.y + 100, { duration: 800, zoom: 1 });
    }
  })) || [];

  const allItems = [...commands, ...tableCommands];

  const filteredItems = allItems.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const t = setTimeout(() => {
      setSelectedIndex(0);
    }, 0);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      const t = setTimeout(() => {
        setSearch('');
      }, 0);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filteredItems[selectedIndex];
      if (item) {
        item.action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-start justify-center pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-[600px] bg-bg-secondary/90 backdrop-blur-xl border border-glass-border shadow-2xl rounded-2xl overflow-hidden"
          >
            <div className="flex items-center px-4 py-3 border-b border-glass-border">
              <Search className="w-5 h-5 text-text-tertiary mr-3" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-text-tertiary text-text-primary"
              />
              <div className="flex space-x-1">
                <kbd className="px-2 py-1 text-[10px] font-mono bg-bg-primary border border-glass-border rounded text-text-secondary">esc</kbd>
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
              {filteredItems.length === 0 ? (
                <div className="p-4 text-center text-text-tertiary text-sm">
                  No results found.
                </div>
              ) : (
                filteredItems.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      "w-full flex items-center px-4 py-3 rounded-xl text-left text-sm transition-colors",
                      idx === selectedIndex ? "bg-accent-blue text-white" : "text-text-secondary hover:bg-glass-hover hover:text-text-primary"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4 mr-3", idx === selectedIndex ? "text-white" : "text-text-tertiary")} />
                    <span className={cn("font-medium", idx === selectedIndex ? "text-white" : "text-text-primary")}>{item.label}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
