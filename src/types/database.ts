import { DocumentSpec, GeneratedDesignSystem } from "./document-spec";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  project_type: string;
  status: "draft" | "generating" | "ready" | "archived";
  original_prompt: string | null;
  current_spec: DocumentSpec;
  design_system?: GeneratedDesignSystem | null;
  generation_config?: Record<string, any> | null;
  export_formats?: string[];
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectVersion {
  id: string;
  project_id: string;
  user_id: string;
  version_number: number;
  design_spec: DocumentSpec;
  change_prompt: string | null;
  created_at: string;
}

export interface UploadedFile {
  id: string;
  project_id: string | null;
  user_id: string;
  file_name: string;
  file_type: string;
  storage_path: string;
  file_size: number;
  extraction_status: "pending" | "processing" | "completed" | "failed";
  extracted_text: string | null;
  created_at: string;
}

export interface GeneratedAsset {
  id: string;
  project_id: string;
  user_id: string;
  asset_type: "pptx" | "pdf" | "png" | "svg" | "json";
  storage_path: string;
  mime_type: string;
  file_size: number;
  created_at: string;
}

export interface BrandKit {
  id: string;
  user_id: string;
  name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  heading_font: string;
  body_font: string;
  design_preferences: {
    borderRadiusPx: number;
    shadow: "none" | "sm" | "md" | "lg";
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface UsageEvent {
  id: string;
  user_id: string;
  event_type: string;
  project_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Project>;
      };
      project_versions: {
        Row: ProjectVersion;
        Insert: Omit<ProjectVersion, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<ProjectVersion>;
      };
      uploaded_files: {
        Row: UploadedFile;
        Insert: Omit<UploadedFile, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<UploadedFile>;
      };
      generated_assets: {
        Row: GeneratedAsset;
        Insert: Omit<GeneratedAsset, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<GeneratedAsset>;
      };
      brand_kits: {
        Row: BrandKit;
        Insert: Omit<BrandKit, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<BrandKit>;
      };
      usage_events: {
        Row: UsageEvent;
        Insert: Omit<UsageEvent, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<UsageEvent>;
      };
    };
  };
}
