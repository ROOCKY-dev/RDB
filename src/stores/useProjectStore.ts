import { create } from 'zustand';
import { Project, ProjectSettings } from '@/lib/types';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

interface ProjectState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  loadProjects: () => Promise<void>;
  createProject: (name: string) => Promise<string>;
  deleteProject: (id: string) => Promise<void>;
  duplicateProject: (id: string) => Promise<string | undefined>;
  renameProject: (id: string, newName: string) => Promise<void>;
}

const defaultSettings: ProjectSettings = {
  defaultDialect: 'postgresql',
  canvasBackground: 'dots',
  snapToGrid: true,
  gridSize: 20,
  edgeStyle: 'bezier',
  theme: 'dark',
  autoSave: true,
};

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  isLoading: true,
  error: null,

  loadProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await db.getAllProjects();
      set({ projects, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createProject: async (name: string) => {
    const newProject: Project = {
      id: nanoid(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: { ...defaultSettings },
      tables: [],
      relationships: [],
      canvasState: { x: 0, y: 0, zoom: 1 }
    };

    try {
      await db.saveProject(newProject);
      const projects = await db.getAllProjects();
      set({ projects });
      return newProject.id;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    try {
      await db.deleteProject(id);
      const projects = await db.getAllProjects();
      set({ projects });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  duplicateProject: async (id: string) => {
    try {
      const sourceProject = await db.getProject(id);
      if (!sourceProject) throw new Error("Project not found");

      const newProject: Project = {
        ...sourceProject,
        id: nanoid(),
        name: `${sourceProject.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.saveProject(newProject);
      const projects = await db.getAllProjects();
      set({ projects });
      return newProject.id;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  renameProject: async (id: string, newName: string) => {
    try {
      const project = await db.getProject(id);
      if (!project) throw new Error("Project not found");

      project.name = newName;
      project.updatedAt = new Date().toISOString();

      await db.saveProject(project);
      const projects = await db.getAllProjects();
      set({ projects });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  }
}));
