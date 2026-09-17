import { SupabaseClient } from "@supabase/supabase-js";

export type StorageBucket = "uploads" | "generated-assets" | "brand-assets";

export interface UploadResult {
  path: string;
  fullPath: string;
  error: Error | null;
}

/**
 * Uploads a file to a private user-scoped bucket folder (auth.uid()/filename)
 */
export async function uploadUserFile(
  supabase: SupabaseClient,
  bucket: StorageBucket,
  userId: string,
  fileName: string,
  fileBody: Buffer | Blob | File,
  contentType?: string
): Promise<UploadResult> {
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `${userId}/${Date.now()}-${sanitizedName}`;

  const { data, error } = await supabase.storage.from(bucket).upload(filePath, fileBody, {
    contentType,
    upsert: false,
  });

  if (error) {
    return { path: "", fullPath: "", error: new Error(error.message) };
  }

  return {
    path: data.path,
    fullPath: `${bucket}/${data.path}`,
    error: null,
  };
}

/**
 * Creates a signed download URL for private bucket objects
 */
export async function createSignedDownloadUrl(
  supabase: SupabaseClient,
  bucket: StorageBucket,
  filePath: string,
  expiresInSeconds = 3600
): Promise<{ signedUrl: string | null; error: Error | null }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    return {
      signedUrl: null,
      error: error ? new Error(error.message) : new Error("Signed URL creation failed"),
    };
  }

  return { signedUrl: data.signedUrl, error: null };
}

/**
 * Deletes a file from user's storage bucket
 */
export async function deleteUserFile(
  supabase: SupabaseClient,
  bucket: StorageBucket,
  filePath: string
): Promise<{ success: boolean; error: Error | null }> {
  const { error } = await supabase.storage.from(bucket).remove([filePath]);

  if (error) {
    return { success: false, error: new Error(error.message) };
  }

  return { success: true, error: null };
}
