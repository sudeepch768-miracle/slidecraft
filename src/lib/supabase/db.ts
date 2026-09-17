import { SupabaseClient } from "@supabase/supabase-js";
import { Project, ProjectVersion, BrandKit, UsageEvent, GeneratedAsset } from "@/types/database";
import { DocumentSpec } from "@/types/document-spec";

export async function createProject(
  supabase: SupabaseClient,
  params: {
    userId: string;
    name: string;
    projectType: string;
    originalPrompt?: string;
    currentSpec: DocumentSpec;
  }
): Promise<{ project: Project | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: params.userId,
      name: params.name,
      project_type: params.projectType,
      status: "ready",
      original_prompt: params.originalPrompt || null,
      current_spec: params.currentSpec,
    })
    .select()
    .single();

  if (error) {
    return { project: null, error: new Error(error.message) };
  }

  // Create initial version snapshot (v1)
  await supabase.from("project_versions").insert({
    project_id: data.id,
    user_id: params.userId,
    version_number: 1,
    design_spec: params.currentSpec,
    change_prompt: "Initial generation",
  });

  return { project: data as Project, error: null };
}

export async function getUserProjects(
  supabase: SupabaseClient,
  userId: string,
  options: { projectType?: string; limit?: number } = {}
): Promise<{ projects: Project[]; error: Error | null }> {
  let query = supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (options.projectType && options.projectType !== "all") {
    query = query.eq("project_type", options.projectType);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    return { projects: [], error: new Error(error.message) };
  }

  return { projects: (data as Project[]) || [], error: null };
}

export async function getProjectById(
  supabase: SupabaseClient,
  projectId: string
): Promise<{ project: Project | null; error: Error | null }> {
  const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).single();

  if (error) {
    return { project: null, error: new Error(error.message) };
  }

  return { project: data as Project, error: null };
}

export async function updateProject(
  supabase: SupabaseClient,
  projectId: string,
  updates: Partial<Pick<Project, "name" | "current_spec" | "thumbnail_url" | "status">>,
  changePrompt?: string
): Promise<{ project: Project | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", projectId)
    .select()
    .single();

  if (error) {
    return { project: null, error: new Error(error.message) };
  }

  // If spec updated, record new project version
  if (updates.current_spec) {
    const { count } = await supabase
      .from("project_versions")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId);

    const nextVersion = (count || 0) + 1;
    await supabase.from("project_versions").insert({
      project_id: projectId,
      user_id: data.user_id,
      version_number: nextVersion,
      design_spec: updates.current_spec,
      change_prompt: changePrompt || "Document edit",
    });
  }

  return { project: data as Project, error: null };
}

export async function deleteProject(
  supabase: SupabaseClient,
  projectId: string
): Promise<{ success: boolean; error: Error | null }> {
  const { error } = await supabase.from("projects").delete().eq("id", projectId);

  if (error) {
    return { success: false, error: new Error(error.message) };
  }

  return { success: true, error: null };
}

export async function getProjectVersions(
  supabase: SupabaseClient,
  projectId: string
): Promise<{ versions: ProjectVersion[]; error: Error | null }> {
  const { data, error } = await supabase
    .from("project_versions")
    .select("*")
    .eq("project_id", projectId)
    .order("version_number", { ascending: false });

  if (error) {
    return { versions: [], error: new Error(error.message) };
  }

  return { versions: (data as ProjectVersion[]) || [], error: null };
}

export async function getUserBrandKits(
  supabase: SupabaseClient,
  userId: string
): Promise<{ brandKits: BrandKit[]; error: Error | null }> {
  const { data, error } = await supabase
    .from("brand_kits")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return { brandKits: [], error: new Error(error.message) };
  }

  return { brandKits: (data as BrandKit[]) || [], error: null };
}

export async function trackUsageEvent(
  supabase: SupabaseClient,
  params: {
    userId: string;
    eventType: string;
    projectId?: string;
    metadata?: Record<string, any>;
  }
): Promise<{ success: boolean }> {
  const { error } = await supabase.from("usage_events").insert({
    user_id: params.userId,
    event_type: params.eventType,
    project_id: params.projectId || null,
    metadata: params.metadata || {},
  });

  return { success: !error };
}

export async function createGeneratedAsset(
  supabase: SupabaseClient,
  params: {
    projectId: string;
    userId: string;
    assetType: "pptx" | "pdf" | "png" | "json";
    storagePath: string;
    mimeType: string;
    fileSize: number;
  }
): Promise<{ asset: GeneratedAsset | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("generated_assets")
    .insert({
      project_id: params.projectId,
      user_id: params.userId,
      asset_type: params.assetType,
      storage_path: params.storagePath,
      mime_type: params.mimeType,
      file_size: params.fileSize,
    })
    .select()
    .single();

  if (error) {
    return { asset: null, error: new Error(error.message) };
  }

  return { asset: data as GeneratedAsset, error: null };
}

export async function getProjectGeneratedAssets(
  supabase: SupabaseClient,
  projectId: string
): Promise<{ assets: GeneratedAsset[]; error: Error | null }> {
  const { data, error } = await supabase
    .from("generated_assets")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    return { assets: [], error: new Error(error.message) };
  }

  return { assets: (data as GeneratedAsset[]) || [], error: null };
}

