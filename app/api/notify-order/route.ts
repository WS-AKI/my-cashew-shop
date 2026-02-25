import { NextRequest, NextResponse } from "next/server";

const LINE_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "";
const LINE_USER_ID = process.env.LINE_USER_ID ?? "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const order_id = body.order_id as string | undefined;
    const customer_name = (body.customer_name as string | undefined)?.trim() || "—";
    const total_amount =
      typeof body.total_amount === "number" && Number.isFinite(body.total_amount)
        ? body.total_amount
        : null;

    if (!order_id) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    if (!LINE_TOKEN || !LINE_USER_ID) {
      return NextResponse.json({ ok: true, notified: false });
    }

    const shortId = order_id.slice(0, 8);
    const amountStr =
      total_amount != null ? `\n合計: ฿${total_amount.toLocaleString()}` : "";
    const text = `📩 新規注文がありました\n注文: #${shortId}\nお名前: ${customer_name}${amountStr}\n\n入金確認・管理画面でご確認ください。`;

    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LINE_TOKEN}`,
      },
      body: JSON.stringify({
        to: LINE_USER_ID,
        messages: [{ type: "text", text }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("LINE notify-order push failed", res.status, errText);
    }

    return NextResponse.json({ ok: true, notified: true });
  } catch (e) {
    console.error("LINE notify-order error", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
