import { get, set, del, keys, createStore } from 'idb-keyval';
import { Project } from './types';

// Create a custom store to avoid interfering with other apps
const customStore = createStore('SchemaVision-DB', 'projects');

export const db = {
  /**
   * Save a project to IndexedDB
   */
  saveProject: async (project: Project): Promise<void> => {
    try {
      await set(project.id, project, customStore);
    } catch (error) {
      console.error('Failed to save project:', error);
      throw new Error('Failed to save project to local storage');
    }
  },

  /**
   * Load a specific project by ID
   */
  getProject: async (id: string): Promise<Project | undefined> => {
    try {
      return await get(id, customStore);
    } catch (error) {
      console.error(`Failed to get project ${id}:`, error);
      return undefined;
    }
  },

  /**
   * Get all projects (metadata only for the dashboard)
   */
  getAllProjects: async (): Promise<Project[]> => {
    try {
      const projectKeys = await keys(customStore);
      const projects: Project[] = [];

      for (const key of projectKeys) {
        const project = await get<Project>(key, customStore);
        if (project) {
          projects.push(project);
        }
      }

      // Sort by updatedAt descending
      return projects.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (error) {
      console.error('Failed to get all projects:', error);
      return [];
    }
  },

  /**
   * Delete a project
   */
  deleteProject: async (id: string): Promise<void> => {
    try {
      await del(id, customStore);
    } catch (error) {
      console.error(`Failed to delete project ${id}:`, error);
      throw new Error('Failed to delete project');
    }
  }
};
