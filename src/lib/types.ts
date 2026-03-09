export type SQLDataType =
  | "INT" | "BIGINT" | "SMALLINT" | "SERIAL" | "UUID"
  | "VARCHAR" | "CHAR" | "TEXT"
  | "BOOLEAN"
  | "DATE" | "TIMESTAMP" | "TIMESTAMPTZ"
  | "FLOAT" | "DOUBLE" | "DECIMAL"
  | "JSON" | "JSONB"
  | "BLOB" | "ENUM";

export interface Column {
  id: string;
  name: string;
  type: SQLDataType;
  length: number | null;
  precision: number | null;
  scale: number | null;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isNotNull: boolean;
  isUnique: boolean;
  isAutoIncrement: boolean;
  isIndexed: boolean;
  defaultValue: string | null;
  comment: string | null;
  order: number;
}

export interface Table extends Record<string, unknown> {
  id: string;
  name: string;
  position: { x: number; y: number };
  color: string;
  collapsed: boolean;
  columns: Column[];
  comment: string | null;
}

export interface Relationship extends Record<string, unknown> {
  id: string;
  sourceTableId: string;
  sourceColumnId: string;
  targetTableId: string;
  targetColumnId: string;
  type: "1:1" | "1:N" | "M:N";
  label: string | null;
}

export interface ProjectSettings {
  defaultDialect: "postgresql" | "mysql" | "sqlite" | "mssql";
  canvasBackground: "dots" | "lines" | "none";
  snapToGrid: boolean;
  gridSize: number;
  edgeStyle: "bezier" | "smoothstep" | "straight";
  theme: "dark" | "light" | "system";
  autoSave: boolean;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  settings: ProjectSettings;
  tables: Table[];
  relationships: Relationship[];
  canvasState: { x: number; y: number; zoom: number };
}
