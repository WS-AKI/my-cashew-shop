import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const LINE_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "";
const LINE_USER_ID = process.env.LINE_USER_ID ?? "";

type OrderItemPayload = {
  name: string;
  size_g?: number | null;
  quantity: number;
  unit_price?: number | null;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const toSafe = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
    const order_id = body.order_id as string | undefined;
    const customer_name = (body.customer_name as string | undefined)?.trim() || "—";
    const customer_phone = (body.customer_phone as string | undefined)?.trim() || "—";
    const customer_address = (body.customer_address as string | undefined)?.trim() || "—";
    const order_notes = (body.order_notes as string | undefined)?.trim() || null;
    const items: OrderItemPayload[] = Array.isArray(body.items) ? body.items : [];
    const subtotal =
      typeof body.subtotal === "number" && Number.isFinite(body.subtotal)
        ? body.subtotal
        : null;
    const shipping_fee =
      typeof body.shipping_fee === "number" && Number.isFinite(body.shipping_fee)
        ? body.shipping_fee
        : null;
    const discount_amount =
      typeof body.discount_amount === "number" && Number.isFinite(body.discount_amount)
        ? body.discount_amount
        : null;
    const total_amount =
      typeof body.total_amount === "number" && Number.isFinite(body.total_amount)
        ? body.total_amount
        : null;

    if (!order_id) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    const rawAddress = toSafe(body.customer_address);
    const addressParts = rawAddress
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const deliveryName = toSafe(body.customer_name);
    const deliveryPhone = toSafe(body.customer_phone);
    const deliveryAddress1 =
      toSafe(body.customer_address_line1) ||
      toSafe(body.shipping_address_line1) ||
      addressParts[0] ||
      "";
    const tambon = toSafe(body.tambon) || toSafe(body.subdistrict);
    const amphoe = toSafe(body.amphoe) || toSafe(body.district);
    const province = toSafe(body.province);
    const postalCode = toSafe(body.postal_code) || toSafe(body.zip_code);
    const deliveryAddress2 =
      [tambon, amphoe, province, postalCode].filter(Boolean).join(" ") ||
      (addressParts.length > 1 ? addressParts.slice(1).join(" ") : "");

    if (!LINE_TOKEN || !LINE_USER_ID) {
      return NextResponse.json({ ok: true, notified: false });
    }

    const shortId = order_id.slice(0, 8);

    // 商品リスト行
    const itemsLines =
      items.length > 0
        ? items
            .map((it) => {
              const sizePart = it.size_g ? ` ${it.size_g}g` : "";
              const pricePart =
                it.unit_price != null
                  ? ` ฿${(it.unit_price * it.quantity).toLocaleString()}`
                  : "";
              return `  • ${it.name}${sizePart} ×${it.quantity}${pricePart}`;
            })
            .join("\n")
        : "  —";

    // 金額明細
    const priceLines: string[] = [];
    if (subtotal != null) priceLines.push(`  小計: ฿${subtotal.toLocaleString()}`);
    if (shipping_fee != null) priceLines.push(`  送料: ฿${shipping_fee.toLocaleString()}`);
    if (discount_amount != null && discount_amount > 0)
      priceLines.push(`  割引: -฿${discount_amount.toLocaleString()}`);
    if (total_amount != null) priceLines.push(`  合計: ฿${total_amount.toLocaleString()}`);

    const notesPart = order_notes ? `\n📝 備考\n  ${order_notes}` : "";
    const shippingCopyBlock = [
      "【📦 配送用コピペ枠】",
      deliveryName,
      deliveryPhone,
      deliveryAddress1,
      deliveryAddress2,
    ].join("\n");

    const text = [
      `📩 新規注文 #${shortId}`,
      "",
      `👤 お客様情報`,
      `  氏名: ${customer_name}`,
      `  電話: ${customer_phone}`,
      `  住所: ${customer_address}`,
      "",
      `🛒 注文内容`,
      itemsLines,
      "",
      `💴 金額`,
      ...priceLines,
      notesPart,
      "",
      shippingCopyBlock,
      "",
      `管理画面でご確認ください。`,
    ]
      .filter((l) => l !== undefined)
      .join("\n");

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
