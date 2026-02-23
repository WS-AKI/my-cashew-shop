import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const LINE_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "";
const LINE_USER_ID = process.env.LINE_USER_ID ?? "";

async function sendLineNotification(orderId: string, body: string) {
  if (!LINE_TOKEN || !LINE_USER_ID) return;
  try {
    await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LINE_TOKEN}`,
      },
      body: JSON.stringify({
        to: LINE_USER_ID,
        messages: [
          {
            type: "text",
            text: `📩 新しいメッセージ\n注文: #${orderId.slice(0, 8)}\n\n${body}`,
          },
        ],
      }),
    });
  } catch {
    // LINE notification is best-effort
  }
}

export async function POST(request: NextRequest) {
  try {
    const { order_id, sender, body } = await request.json();

    if (!order_id || !sender || !body?.trim()) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (!["customer", "shop"].includes(sender)) {
      return NextResponse.json({ error: "Invalid sender" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 503 }
      );
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    });

    const { data, error } = await supabase
      .from("order_messages")
      .insert({ order_id, sender, body: body.trim() })
      .select("id, order_id, sender, body, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (sender === "customer") {
      sendLineNotification(order_id, body.trim());
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
