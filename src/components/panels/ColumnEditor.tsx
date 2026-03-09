import { Column, SQLDataType } from "@/lib/types";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassButton } from "@/components/ui/GlassButton";
import { Trash2 } from "lucide-react";

const SQL_TYPES: SQLDataType[] = [
  "INT", "BIGINT", "SMALLINT", "SERIAL", "UUID",
  "VARCHAR", "CHAR", "TEXT",
  "BOOLEAN",
  "DATE", "TIMESTAMP", "TIMESTAMPTZ",
  "FLOAT", "DOUBLE", "DECIMAL",
  "JSON", "JSONB",
  "BLOB", "ENUM"
];

const REQUIRES_LENGTH = ["VARCHAR", "CHAR"];
const REQUIRES_PRECISION = ["DECIMAL", "FLOAT", "DOUBLE"];

export function ColumnEditor() {
  const { project, selectedColumnId, updateColumn, deleteColumn, setSelectedColumn } = useCanvasStore();

  // Find the selected column and its parent table
  const findColumnAndTable = () => {
    if (!project || !selectedColumnId) return { table: null, column: null };
    for (const t of project.tables) {
      const c = t.columns.find(col => col.id === selectedColumnId);
      if (c) return { table: t, column: c };
    }
    return { table: null, column: null };
  };

  const { table, column } = findColumnAndTable();

  if (!table || !column) return null;

  const handleChange = (key: keyof Column, value: string | number | boolean | null) => {
    updateColumn(table.id, column.id, { [key]: value });
  };

  const handleDelete = () => {
    if (confirm("Delete this column?")) {
      deleteColumn(table.id, column.id);
      setSelectedColumn(null);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar px-5 py-6 space-y-6">

      {/* Name Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Column Name</label>
        <GlassInput
          value={column.name}
          onChange={(e) => handleChange("name", e.target.value.replace(/\s+/g, '_'))}
          className="font-mono"
        />
      </div>

      {/* Data Type Selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Data Type</label>
        <select
          className="w-full h-10 rounded-md border border-glass-border bg-glass-bg px-3 py-2 text-sm font-mono text-text-primary outline-none focus:ring-1 focus:ring-accent-blue focus:border-accent-blue"
          value={column.type}
          onChange={(e) => handleChange("type", e.target.value as SQLDataType)}
        >
          {SQL_TYPES.map(type => (
            <option key={type} value={type} className="bg-bg-secondary text-text-primary">
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Length/Precision Details */}
      <div className="grid grid-cols-2 gap-4">
        {REQUIRES_LENGTH.includes(column.type) && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Length</label>
            <GlassInput
              type="number"
              value={column.length || ""}
              onChange={(e) => handleChange("length", e.target.value ? parseInt(e.target.value) : null)}
              placeholder="e.g. 255"
              className="font-mono"
            />
          </div>
        )}

        {REQUIRES_PRECISION.includes(column.type) && (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Precision</label>
              <GlassInput
                type="number"
                value={column.precision || ""}
                onChange={(e) => handleChange("precision", e.target.value ? parseInt(e.target.value) : null)}
                placeholder="10"
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Scale</label>
              <GlassInput
                type="number"
                value={column.scale || ""}
                onChange={(e) => handleChange("scale", e.target.value ? parseInt(e.target.value) : null)}
                placeholder="2"
                className="font-mono"
              />
            </div>
          </>
        )}
      </div>

      {/* Default Value */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Default Value</label>
        <GlassInput
          value={column.defaultValue || ""}
          onChange={(e) => handleChange("defaultValue", e.target.value || null)}
          placeholder="NULL"
          className="font-mono text-accent-blue placeholder:text-text-tertiary"
        />
      </div>

      {/* Constraints Toggles */}
      <div className="space-y-3 pt-4 border-t border-glass-border">
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wider block mb-2">Constraints</label>

        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm text-text-primary font-medium flex items-center">
             <span className="w-4 h-4 mr-2 rounded flex items-center justify-center bg-accent-yellow/20 text-accent-yellow text-[10px]">PK</span>
             Primary Key
          </span>
          <input
            type="checkbox"
            checked={column.isPrimaryKey}
            onChange={(e) => handleChange("isPrimaryKey", e.target.checked)}
            className="w-4 h-4 accent-accent-blue rounded cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm text-text-primary font-medium flex items-center">
             <span className="w-4 h-4 mr-2 rounded flex items-center justify-center bg-accent-blue/20 text-accent-blue text-[10px]">FK</span>
             Foreign Key
          </span>
          <input
            type="checkbox"
            checked={column.isForeignKey}
            onChange={(e) => handleChange("isForeignKey", e.target.checked)}
            className="w-4 h-4 accent-accent-blue rounded cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm text-text-primary font-medium flex items-center">
             <span className="w-4 h-4 mr-2 rounded flex items-center justify-center bg-accent-red/20 text-accent-red text-[10px]">NN</span>
             Not Null
          </span>
          <input
            type="checkbox"
            checked={column.isNotNull}
            onChange={(e) => handleChange("isNotNull", e.target.checked)}
            className="w-4 h-4 accent-accent-blue rounded cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm text-text-primary font-medium flex items-center">
             <span className="w-4 h-4 mr-2 rounded flex items-center justify-center bg-accent-purple/20 text-accent-purple text-[10px]">UQ</span>
             Unique
          </span>
          <input
            type="checkbox"
            checked={column.isUnique}
            onChange={(e) => handleChange("isUnique", e.target.checked)}
            className="w-4 h-4 accent-accent-blue rounded cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm text-text-primary font-medium flex items-center">
             <span className="w-4 h-4 mr-2 rounded flex items-center justify-center bg-accent-orange/20 text-accent-orange text-[10px]">IX</span>
             Index
          </span>
          <input
            type="checkbox"
            checked={column.isIndexed}
            onChange={(e) => handleChange("isIndexed", e.target.checked)}
            className="w-4 h-4 accent-accent-blue rounded cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm text-text-primary font-medium flex items-center">
             <span className="w-4 h-4 mr-2 rounded flex items-center justify-center bg-text-secondary/20 text-text-secondary text-[10px]">AI</span>
             Auto Increment
          </span>
          <input
            type="checkbox"
            checked={column.isAutoIncrement}
            onChange={(e) => handleChange("isAutoIncrement", e.target.checked)}
            className="w-4 h-4 accent-accent-blue rounded cursor-pointer"
          />
        </label>
      </div>

      {/* Comment */}
      <div className="space-y-1.5 pt-4 border-t border-glass-border">
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Comment</label>
        <textarea
          value={column.comment || ""}
          onChange={(e) => handleChange("comment", e.target.value || null)}
          className="w-full h-24 rounded-md border border-glass-border bg-glass-bg px-3 py-2 text-sm text-text-primary outline-none focus:ring-1 focus:ring-accent-blue focus:border-accent-blue resize-none custom-scrollbar"
          placeholder="Add a note about this column..."
        />
      </div>

      {/* Delete Button */}
      <div className="pt-6 pb-4 mt-auto">
        <GlassButton
          variant="danger"
          className="w-full flex justify-center items-center space-x-2"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Column</span>
        </GlassButton>
      </div>
    </div>
  );
}
