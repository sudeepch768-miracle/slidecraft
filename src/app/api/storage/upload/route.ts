import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadUserFile, StorageBucket } from "@/lib/supabase/storage";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as StorageBucket) || "uploads";
    const projectId = (formData.get("projectId") as string) || null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to private bucket under <userId>/<timestamp>-<name>
    const uploadResult = await uploadUserFile(
      supabase,
      bucket,
      user.id,
      file.name,
      buffer,
      file.type
    );

    if (uploadResult.error) {
      return NextResponse.json({ error: uploadResult.error.message }, { status: 500 });
    }

    // Record in uploaded_files table
    const { data: fileRecord, error: dbError } = await supabase
      .from("uploaded_files")
      .insert({
        project_id: projectId,
        user_id: user.id,
        file_name: file.name,
        file_type: file.type,
        storage_path: uploadResult.path,
        file_size: file.size,
        extraction_status: "completed",
      })
      .select()
      .single();

    return NextResponse.json({
      success: true,
      file: fileRecord,
      path: uploadResult.path,
      fullPath: uploadResult.fullPath,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to upload file" }, { status: 500 });
  }
}
