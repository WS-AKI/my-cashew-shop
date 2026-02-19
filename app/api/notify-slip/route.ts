import { NextRequest, NextResponse } from "next/server";

const LINE_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "";
const LINE_USER_ID = process.env.LINE_USER_ID ?? "";

export async function POST(request: NextRequest) {
  try {
    const { order_id } = await request.json();
    if (!order_id) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    if (!LINE_TOKEN || !LINE_USER_ID) {
      return NextResponse.json({ ok: true, notified: false });
    }

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
            text: `🧾 スリップがアップロードされました\n注文: #${order_id.slice(0, 8)}\n\n管理画面で確認してください。`,
          },
        ],
      }),
    });

    return NextResponse.json({ ok: true, notified: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
