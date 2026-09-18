import { DocumentSpec, createEmptyDocument } from "@/types/document-spec";
import { Project, ProjectVersion } from "@/types/database";
import { SAMPLE_PRESENTATION_DECKS } from "./sample-decks";

const STORAGE_KEY = "slidecraft_projects";

// Sample starter projects if the user has no cloud or local projects yet
const STARTER_PROJECTS: Project[] = [
  ...SAMPLE_PRESENTATION_DECKS,
  {
    id: "proj-1",
    user_id: "starter",
    name: "Q4 Board Strategy & Growth Deck",
    project_type: "presentation",
    status: "ready",
    original_prompt: "Executive Q4 growth metrics, OKRs, and market positioning",
    current_spec: createEmptyDocument("Q4 Board Strategy & Growth Deck"),
    thumbnail_url: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: "proj-2",
    user_id: "starter",
    name: "AI Product Launch Announcement",
    project_type: "poster",
    status: "ready",
    original_prompt: "High-impact visual poster for enterprise AI platform launch",
    current_spec: createEmptyDocument("AI Product Launch Announcement", "poster"),
    thumbnail_url: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "proj-3",
    user_id: "starter",
    name: "Cloud Infrastructure Flowchart",
    project_type: "diagram",
    status: "ready",
    original_prompt: "Distributed microservices cloud architecture DAG diagram",
    current_spec: createEmptyDocument("Cloud Infrastructure Flowchart", "diagram"),
    thumbnail_url: null,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

function getApiUrl(path: string): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return path;
  }
  return `http://localhost:3000${path}`;
}

let inMemoryProjects: Project[] = [...STARTER_PROJECTS];
const inMemoryVersions: Record<string, ProjectVersion[]> = {};

function getStoredProjects(): Project[] {
  if (typeof window === "undefined") return inMemoryProjects;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(STARTER_PROJECTS));
      return STARTER_PROJECTS;
    }
    const parsed: Project[] = JSON.parse(raw);
    const existingIds = new Set(parsed.map((p) => p.id));
    let updated = false;
    for (const starter of STARTER_PROJECTS) {
      if (!existingIds.has(starter.id)) {
        parsed.unshift(starter);
        updated = true;
      }
    }
    if (updated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (err) {
    console.warn("Failed to parse local projects:", err);
    return STARTER_PROJECTS;
  }
}

function setStoredProjects(projects: Project[]) {
  if (typeof window === "undefined") {
    inMemoryProjects = projects;
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.warn("Failed to persist local projects:", err);
  }
}

function getLocalVersions(projectId: string): ProjectVersion[] {
  if (typeof window === "undefined") return inMemoryVersions[projectId] || [];
  try {
    const raw = localStorage.getItem(`slidecraft_versions_${projectId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalVersion(projectId: string, version: ProjectVersion) {
  if (typeof window === "undefined") {
    if (!inMemoryVersions[projectId]) inMemoryVersions[projectId] = [];
    inMemoryVersions[projectId].unshift(version);
    return;
  }
  try {
    const versions = getLocalVersions(projectId);
    versions.unshift(version);
    localStorage.setItem(`slidecraft_versions_${projectId}`, JSON.stringify(versions));
  } catch {
    // Fallback
  }
}

export const projectService = {
  /**
   * Fetch user projects from cloud Supabase API, falling back to local storage.
   */
  async fetchUserProjects(options: { projectType?: string; limit?: number } = {}): Promise<{
    projects: Project[];
    source: "cloud" | "local";
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (options.projectType && options.projectType !== "all") {
        queryParams.set("type", options.projectType);
      }
      if (options.limit) {
        queryParams.set("limit", options.limit.toString());
      }

      const res = await fetch(getApiUrl(`/api/projects?${queryParams.toString()}`));
      if (res.ok) {
        const data = await res.json();
        const cloudProjects: Project[] = data.projects || [];

        // Merge with local projects that haven't synced yet
        const localProjects = getStoredProjects().filter((p) => p.id.startsWith("local-"));
        const merged = [...localProjects, ...cloudProjects];

        setStoredProjects(merged);
        return { projects: merged, source: "cloud" };
      }
    } catch {
      // Graceful fallback to local storage
    }

    // Fallback to local storage
    let local = getStoredProjects();
    if (options.projectType && options.projectType !== "all") {
      local = local.filter((p) => p.project_type === options.projectType);
    }
    if (options.limit) {
      local = local.slice(0, options.limit);
    }

    return { projects: local, source: "local" };
  },

  /**
   * Get a single project by ID (from cloud, session, or local cache).
   */
  async getProject(id: string): Promise<Project | null> {
    if (!id) return null;

    // 0. Synchronous fast-path: check isolated session storage and dedicated local storage keys
    if (typeof window !== "undefined") {
      try {
        const sessionRaw = sessionStorage.getItem(`slidecraft_project_${id}`);
        if (sessionRaw) {
          const parsed = JSON.parse(sessionRaw);
          if (parsed && parsed.current_spec) return parsed;
        }
      } catch {}

      try {
        const localRaw = localStorage.getItem(`slidecraft_project_${id}`);
        if (localRaw) {
          const parsed = JSON.parse(localRaw);
          if (parsed && parsed.current_spec) return parsed;
        }
      } catch {}
    }

    // 1. Check local storage cache or starter projects directly
    const local = getStoredProjects().find((p) => p.id === id);
    if (local && local.current_spec) return local;
    const starter = STARTER_PROJECTS.find((p) => p.id === id);
    if (starter && starter.current_spec) return starter;

    // 2. Try fetching from cloud
    try {
      const res = await fetch(getApiUrl(`/api/projects/${id}`));
      if (res.ok) {
        const data = await res.json();
        if (data.project) {
          // Update in isolated storage and local cache
          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem(`slidecraft_project_${id}`, JSON.stringify(data.project));
              localStorage.setItem(`slidecraft_project_${id}`, JSON.stringify(data.project));
            } catch {}
          }
          const storedLocal = getStoredProjects();
          const existingIdx = storedLocal.findIndex((p) => p.id === id);
          if (existingIdx >= 0) {
            storedLocal[existingIdx] = data.project;
          } else {
            storedLocal.unshift(data.project);
          }
          setStoredProjects(storedLocal);
          return data.project;
        }
      }
    } catch {
      // Graceful fallback to local storage
    }

    // 3. Fallback: check local storage and starter projects for any match
    return (
      getStoredProjects().find((p) => p.id === id) ||
      STARTER_PROJECTS.find((p) => p.id === id) ||
      null
    );
  },

  /**
   * Create a new project (attempt cloud creation, fallback to local).
   */
  async createProject(params: {
    id?: string;
    name: string;
    projectType: string;
    originalPrompt?: string;
    currentSpec: DocumentSpec;
  }): Promise<Project> {
    try {
      const res = await fetch(getApiUrl("/api/projects"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.project) {
          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem(`slidecraft_project_${data.project.id}`, JSON.stringify(data.project));
              localStorage.setItem(`slidecraft_project_${data.project.id}`, JSON.stringify(data.project));
            } catch {}
          }

          const local = getStoredProjects();
          local.unshift(data.project);
          setStoredProjects(local);

          saveLocalVersion(data.project.id, {
            id: `ver-1-${data.project.id}`,
            project_id: data.project.id,
            user_id: data.project.user_id,
            version_number: 1,
            design_spec: params.currentSpec,
            change_prompt: params.originalPrompt || "Initial creation",
            created_at: new Date().toISOString(),
          });

          return data.project;
        }
      }
    } catch {
      // Graceful fallback to local storage
    }

    // Local fallback
    const newProject: Project = {
      id: params.id || `local-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      user_id: "local-user",
      name: params.name,
      project_type: params.projectType,
      status: "ready",
      original_prompt: params.originalPrompt || null,
      current_spec: params.currentSpec,
      thumbnail_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(`slidecraft_project_${newProject.id}`, JSON.stringify(newProject));
        localStorage.setItem(`slidecraft_project_${newProject.id}`, JSON.stringify(newProject));
      } catch {}
    }

    const local = getStoredProjects();
    local.unshift(newProject);
    setStoredProjects(local);

    saveLocalVersion(newProject.id, {
      id: `ver-1-${newProject.id}`,
      project_id: newProject.id,
      user_id: newProject.user_id,
      version_number: 1,
      design_spec: params.currentSpec,
      change_prompt: params.originalPrompt || "Initial creation",
      created_at: new Date().toISOString(),
    });

    return newProject;
  },

  /**
   * Save / update an existing project (auto-save endpoint).
   */
  async saveProject(
    id: string,
    updates: {
      name?: string;
      current_spec?: DocumentSpec;
      thumbnail_url?: string;
      status?: "draft" | "generating" | "ready" | "archived";
      changePrompt?: string;
    }
  ): Promise<{ project: Project | null; source: "cloud" | "local" }> {
    const local = getStoredProjects();
    const existingIndex = local.findIndex((p) => p.id === id);

    let updatedProject: Project | null = null;
    if (existingIndex >= 0) {
      updatedProject = {
        ...local[existingIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      local[existingIndex] = updatedProject;
      setStoredProjects(local);

      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(`slidecraft_project_${id}`, JSON.stringify(updatedProject));
          localStorage.setItem(`slidecraft_project_${id}`, JSON.stringify(updatedProject));
        } catch {}
      }
    }

    // Record local version snapshot
    if (updates.current_spec) {
      const localVersions = getLocalVersions(id);
      const nextVer = localVersions.length + 1;
      saveLocalVersion(id, {
        id: `ver-${Date.now()}`,
        project_id: id,
        user_id: updatedProject?.user_id || "user",
        version_number: nextVer,
        design_spec: updates.current_spec,
        change_prompt: updates.changePrompt || "Document edit",
        created_at: new Date().toISOString(),
      });
    }

    // If local only, return immediately
    if (id.startsWith("local-") || id.startsWith("proj-")) {
      return { project: updatedProject, source: "local" };
    }

    // Sync to cloud
    try {
      const res = await fetch(getApiUrl(`/api/projects/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.project) {
          if (existingIndex >= 0) {
            local[existingIndex] = data.project;
            setStoredProjects(local);
          }
          return { project: data.project, source: "cloud" };
        }
      }
    } catch {
      // Graceful fallback to local storage
    }

    return { project: updatedProject, source: "local" };
  },

  /**
   * Rename a project with immediate persistence.
   */
  async renameProject(id: string, newName: string): Promise<Project | null> {
    const res = await this.saveProject(id, { name: newName });
    return res.project;
  },

  /**
   * Fetch full version snapshots for a project.
   */
  async getProjectVersions(id: string): Promise<ProjectVersion[]> {
    if (!id.startsWith("local-") && !id.startsWith("proj-")) {
      try {
        const res = await fetch(getApiUrl(`/api/projects/${id}`));
        if (res.ok) {
          const data = await res.json();
          if (data.versions && data.versions.length > 0) {
            return data.versions;
          }
        }
      } catch {
        // Fallback to local
      }
    }

    const localVersions = getLocalVersions(id);
    if (localVersions.length > 0) return localVersions;

    // Generate initial v1 if empty
    const proj = await this.getProject(id);
    if (proj) {
      const v1: ProjectVersion = {
        id: `ver-init-${id}`,
        project_id: id,
        user_id: proj.user_id,
        version_number: 1,
        design_spec: proj.current_spec,
        change_prompt: proj.original_prompt || "Initial generation",
        created_at: proj.created_at,
      };
      saveLocalVersion(id, v1);
      return [v1];
    }
    return [];
  },

  /**
   * Restore a project back to a specific version number.
   */
  async restoreVersion(projectId: string, versionNumber: number): Promise<Project | null> {
    const versions = await this.getProjectVersions(projectId);
    const target = versions.find((v) => v.version_number === versionNumber);
    if (!target) return null;

    const res = await this.saveProject(projectId, {
      name: target.design_spec.meta.title,
      current_spec: target.design_spec,
      changePrompt: `Restored to version ${versionNumber}`,
    });
    return res.project;
  },

  /**
   * Delete a project.
   */
  async deleteProject(id: string): Promise<boolean> {
    // 1. Remove from local storage
    const local = getStoredProjects().filter((p) => p.id !== id);
    setStoredProjects(local);

    // 2. If it's a cloud project, call cloud API
    if (!id.startsWith("local-") && !id.startsWith("proj-")) {
      try {
        await fetch(getApiUrl(`/api/projects/${id}`), { method: "DELETE" });
      } catch {
        // Fallback
      }
    }

    return true;
  },

  /**
   * Duplicate an existing project.
   */
  async duplicateProject(id: string): Promise<Project | null> {
    const existing = await this.getProject(id);
    if (!existing) return null;

    const clonedSpec = JSON.parse(JSON.stringify(existing.current_spec));
    clonedSpec.meta = {
      ...clonedSpec.meta,
      title: `${existing.name} (Copy)`,
    };

    return this.createProject({
      name: `${existing.name} (Copy)`,
      projectType: existing.project_type,
      originalPrompt: existing.original_prompt || undefined,
      currentSpec: clonedSpec,
    });
  },
};
