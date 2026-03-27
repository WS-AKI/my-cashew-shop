import { NextResponse } from "next/server";
import { adminPinAuthErrorResponse } from "@/lib/admin-api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const BUCKET = "announcement-images";

export async function POST(request: Request) {
  const authErr = adminPinAuthErrorResponse(request);
  if (authErr) return authErr;

  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `サーバー設定: ${msg}` }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file field" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  const fileName = `announcements/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
  const buffer = await file.arrayBuffer();

  const { data, error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);

  return NextResponse.json({ publicUrl: urlData.publicUrl });
}
