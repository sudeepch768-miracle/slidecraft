import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSignedDownloadUrl, StorageBucket } from "@/lib/supabase/storage";

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

    const body = await req.json();
    const { bucket, filePath, expiresIn } = body;

    if (!bucket || !filePath) {
      return NextResponse.json({ error: "bucket and filePath are required" }, { status: 400 });
    }

    // Ensure the filePath is inside the authenticated user's prefix
    if (!filePath.startsWith(`${user.id}/`)) {
      return NextResponse.json(
        { error: "Forbidden: Cannot access assets outside user directory" },
        { status: 403 }
      );
    }

    const { signedUrl, error } = await createSignedDownloadUrl(
      supabase,
      bucket as StorageBucket,
      filePath,
      expiresIn || 3600
    );

    if (error || !signedUrl) {
      return NextResponse.json(
        { error: error?.message || "Failed to generate signed URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ signedUrl });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate signed URL" },
      { status: 500 }
    );
  }
}
