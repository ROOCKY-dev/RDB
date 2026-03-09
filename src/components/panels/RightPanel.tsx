import { motion, AnimatePresence } from 'framer-motion';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { GlassButton } from '@/components/ui/GlassButton';
import { X } from 'lucide-react';
import { ColumnEditor } from './ColumnEditor';

export function RightPanel() {
  const { selectedColumnId, setSelectedColumn } = useCanvasStore();

  return (
    <AnimatePresence>
      {selectedColumnId && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute right-0 top-14 bottom-0 w-80 z-40 bg-bg-secondary/60 backdrop-blur-xl border-l border-glass-border flex flex-col shadow-2xl"
        >
          <div className="h-14 px-4 flex items-center justify-between border-b border-glass-border shrink-0">
            <h2 className="font-bold text-lg">Column Properties</h2>
            <GlassButton
              variant="icon"
              size="sm"
              onClick={() => setSelectedColumn(null)}
              className="text-text-secondary hover:text-text-primary"
            >
              <X className="w-4 h-4" />
            </GlassButton>
          </div>

          <div className="flex-1 overflow-hidden relative">
            <ColumnEditor />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
