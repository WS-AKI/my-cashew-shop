import { NextResponse } from "next/server";
import { adminPinAuthErrorResponse } from "@/lib/admin-api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

type SaveBody = {
  id: string | null;
  title_ja: string;
  body_ja: string;
  title_th: string | null;
  body_th: string | null;
  image_url: string | null;
  display_start: string | null;
  display_end: string | null;
  is_active: boolean;
};

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

  let body: SaveBody;
  try {
    body = (await request.json()) as SaveBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.title_ja?.trim() || !body.body_ja?.trim()) {
    return NextResponse.json({ error: "title_ja and body_ja are required" }, { status: 400 });
  }

  if (
    body.display_start &&
    body.display_end &&
    new Date(body.display_start).getTime() > new Date(body.display_end).getTime()
  ) {
    return NextResponse.json({ error: "display_end must be after display_start" }, { status: 400 });
  }

  const payload = {
    title_ja: body.title_ja.trim(),
    body_ja: body.body_ja.trim(),
    title_th: body.title_th?.trim() || null,
    body_th: body.body_th?.trim() || null,
    image_url: body.image_url?.trim() || null,
    display_start: body.display_start,
    display_end: body.display_end,
    is_active: Boolean(body.is_active),
  };

  if (body.id) {
    const { error } = await supabase.from("announcements").update(payload).eq("id", body.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true, id: body.id });
  }

  const { data, error } = await supabase.from("announcements").insert(payload).select("id").single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: data?.id ?? null });
}
