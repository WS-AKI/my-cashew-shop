/**
 * Shop copy and bank details. Edit this file to change labels or payment info
 * without touching component code.
 */

export const SHOP_TEXT = {
  cart: {
    title: { ja: "カート", th: "ตะกร้าสินค้า" },
    empty: { ja: "カートが空です", th: "ตะกร้าว่าง" },
    emptyHint: { ja: "商品をカートに追加してください。", th: "กรุณาเพิ่มสินค้าในตะกร้า" },
    viewProducts: { ja: "商品を見る", th: "ดูสินค้า" },
    add: { ja: "カートに入れる", th: "ใส่ตะกร้า" },
    added: { ja: "Added!", th: "เพิ่มแล้ว" },
    subtotal: { ja: "小計", th: "ยอดรวมย่อย" },
    discount: { ja: "割引", th: "ส่วนลด" },
    total: { ja: "合計 (THB)", th: "รวม (บาท)" },
    proceedToCheckout: { ja: "レジに進む", th: "ไปชำระเงิน" },
    decrease: { ja: "減らす", th: "ลด" },
    increase: { ja: "増やす", th: "เพิ่ม" },
    remove: { ja: "削除", th: "ลบ" },
  },
  checkout: {
    title: { ja: "ご注文内容の確認", th: "ยืนยันคำสั่งซื้อ" },
    orderSummary: { ja: "注文内容", th: "สรุปคำสั่งซื้อ" },
    yourDetails: { ja: "お客様情報", th: "ข้อมูลลูกค้า" },
    name: { ja: "お名前", th: "ชื่อ" },
    phone: { ja: "電話番号", th: "เบอร์โทร" },
    address: { ja: "お届け先住所", th: "ที่อยู่จัดส่ง" },
    note: { ja: "備考", th: "หมายเหตุ" },
    confirmOrder: { ja: "注文を確定する", th: "ยืนยันคำสั่งซื้อ" },
    confirming: { ja: "送信中...", th: "กำลังส่ง..." },
    nameRequired: { ja: "お名前を入力してください", th: "กรุณากรอกชื่อ" },
    phoneRequired: { ja: "電話番号を入力してください", th: "กรุณากรอกเบอร์โทร" },
    addressRequired: { ja: "住所を入力してください", th: "กรุณากรอกที่อยู่" },
    cartEmpty: { ja: "カートが空です", th: "ตะกร้าว่าง" },
    cartEmptyHint: { ja: "商品をカートに入れてからお進みください。", th: "กรุณาเพิ่มสินค้าในตะกร้าก่อน" },
  },
  orderSuccess: {
    /** Before slip upload */
    titleReceived: { ja: "注文を受け付けました", th: "รับคำสั่งซื้อแล้ว" },
    thankYouReceived: {
      ja: "お支払いのうえ、下の「お支払いスリップのアップロード」からスリップを送信してください。",
      th: "กรุณาชำระเงินแล้วอัพโหลดสลิปที่ด้านล่าง",
    },
    /** After slip upload */
    titleConfirmed: { ja: "ご注文を承りました", th: "รับคำสั่งซื้อแล้ว" },
    thankYou: {
      ja: "ご注文ありがとうございます。お支払い確認後、発送のご連絡をいたします。",
      th: "ขอบคุณที่สั่งซื้อ เราจะติดต่อหลังยืนยันการชำระเงิน",
    },
    /** Legacy: same as titleConfirmed */
    title: { ja: "ご注文を承りました", th: "รับคำสั่งซื้อแล้ว" },
    continueShopping: { ja: "買い物を続ける", th: "ช้อปต่อ" },
    paymentMethod: { ja: "お支払い方法：銀行振込", th: "ชำระผ่านโอนธนาคาร" },
    bankTransfer: { ja: "振込先", th: "โอนเข้าบัญชี" },
    bankName: { ja: "銀行名", th: "ธนาคาร" },
    accountName: { ja: "口座名義", th: "ชื่อบัญชี" },
    accountNumber: { ja: "口座番号", th: "เลขบัญชี" },
    promptPay: { ja: "PromptPay QR", th: "พร้อมเพย์ QR" },
    copy: { ja: "コピー", th: "คัดลอก" },
    copied: { ja: "コピーしました", th: "คัดลอกแล้ว" },
    notePayment: {
      ja: "ご入金確認後、1〜2営業日以内に発送いたします。",
      th: "จัดส่งภายใน 1-2 วันทำการหลังยืนยันการโอน",
    },
  },
  product: {
    outOfStock: { ja: "品切れ中", th: "หมดแล้ว" },
    set: { ja: "セット", th: "เซ็ต" },
    recommended: { ja: "おすすめ", th: "แนะนำ" },
  },
} as const;

export const BANK_INFO = {
  bankName: "Kasikornbank (ธนาคารกสิกรไทย)",
  accountName: "CHIRAPHON KHEHALUN",
  /** Thai name exactly as shown in the PromptPay QR image (for verification) */
  accountNameTH: "น.ส. จิราพร เคหะลูน",
  accountNumber: "004-3-70237-8",
  /** Path to PromptPay QR image in /public. Empty = hide QR section. */
  promptPayQrPath: "",
} as const;

/** 公式LINEアカウントのURL（お問い合わせ用）。Vercel/環境変数で NEXT_PUBLIC_LINE_OFFICIAL_URL を設定可能。 */
export const LINE_OFFICIAL_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_LINE_OFFICIAL_URL) ||
  "https://line.me";
