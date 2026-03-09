import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput } from '@/components/ui/GlassInput';
import { Search, Plus, Menu, Table as TableIcon } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { cn } from '@/lib/utils';

export function LeftPanel() {
  const { project, selectedTableId, setSelectedTable, addTable } = useCanvasStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const { setCenter } = useReactFlow();

  const filteredTables = useMemo(() => {
    if (!project) return [];
    if (!searchQuery.trim()) return project.tables;
    return project.tables.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [project, searchQuery]);

  const handleTableClick = (tableId: string, position: { x: number, y: number }) => {
    setSelectedTable(tableId);
    setCenter(position.x + 110, position.y + 100, { duration: 800, zoom: 1 }); // roughly center table
  };

  const handleAddTable = () => {
    addTable({ x: 200, y: 200 }); // default spawn position if added from list
  };

  if (!project) return null;

  return (
    <motion.div
      initial={false}
      animate={{ width: isExpanded ? 256 : 64 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute left-0 top-14 bottom-0 z-40 bg-bg-secondary/60 backdrop-blur-xl border-r border-glass-border flex flex-col"
    >
      <div className="p-4 flex items-center justify-between shrink-0">
        <AnimatePresence mode="popLayout">
          {isExpanded && (
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-bold text-lg"
            >
              Tables
            </motion.h2>
          )}
        </AnimatePresence>

        <GlassButton
          variant="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn("text-text-secondary hover:text-text-primary", !isExpanded && "w-full mx-auto")}
        >
          <Menu className="w-5 h-5" />
        </GlassButton>
      </div>

      <AnimatePresence mode="popLayout">
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-4 shrink-0 space-y-3"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <GlassInput
                placeholder="Search tables..."
                className="pl-9 h-9 text-sm bg-bg-primary/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <GlassButton
              variant="primary"
              className="w-full h-9 flex items-center justify-center space-x-2"
              onClick={handleAddTable}
            >
              <Plus className="w-4 h-4" />
              <span>Add Table</span>
            </GlassButton>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn("flex-1 overflow-y-auto px-2 pb-4 space-y-1", !isExpanded && "px-1 space-y-2 mt-4")}>
        {filteredTables.map((table) => (
          <button
            key={table.id}
            onClick={() => handleTableClick(table.id, table.position)}
            className={cn(
              "w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors",
              selectedTableId === table.id
                ? "bg-accent-blue/10 text-accent-blue font-medium"
                : "text-text-secondary hover:bg-glass-hover hover:text-text-primary",
              !isExpanded && "justify-center px-0 py-3"
            )}
            title={table.name}
          >
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: table.color }} />

            {isExpanded && (
              <>
                <span className="ml-3 truncate flex-1 text-left">{table.name}</span>
                <span className="ml-2 text-[10px] font-mono opacity-50 bg-bg-primary/50 px-1.5 py-0.5 rounded">
                  {table.columns.length}
                </span>
              </>
            )}
          </button>
        ))}

        {isExpanded && filteredTables.length === 0 && (
          <div className="text-center py-8 text-sm text-text-tertiary">
            {searchQuery ? "No matching tables" : "No tables yet"}
          </div>
        )}
      </div>
    </motion.div>
  );
}
