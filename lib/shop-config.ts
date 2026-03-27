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
    /** {remaining} = 残りバーツ（割引後の合計ベース） */
    freeShippingProgress: {
      ja: "あと ฿{remaining} で送料無料（合計1,000฿以上）",
      th: "อีก ฿{remaining} ส่งฟรี (ยอดรวม 1,000 บาทขึ้นไป)",
    },
    freeShippingUnlocked: {
      ja: "この金額で送料無料です。レジへ進みましょう。",
      th: "ยอดนี้ส่งฟรีแล้ว ไปชำระเงินได้เลย",
    },
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
    shipping: { ja: "送料", th: "ค่าขนส่ง" },
    /** 大きく表示する用 */
    shippingBasic50: { ja: "送料は基本的に50バーツ", th: "ค่าขนส่งปกติ 50 บาท" },
    shippingFreeOver1000: { ja: "1000バーツ以上で送料無料", th: "ซื้อครบ 1,000 บาท ส่งฟรี" },
    shippingFree: { ja: "送料無料", th: "ส่งฟรี" },
    vipCartBlocked: {
      ja: "カートに会員ランクの条件を満たさない商品が含まれています。対象商品を削除するか、ログインのうえランクをご確認ください。",
      th: "ในตะกร้ามีสินค้าที่ต้องใช้ระดับสมาชิกสูงกว่าที่คุณมี กรุณาลบสินค้าหรือเข้าสู่ระบบและตรวจสอบระดับ",
    },
    /** 注文確定前の不安解消（振込フロー） */
    paymentFlowTitle: { ja: "お支払いの流れ", th: "ขั้นตอนการชำระเงิน" },
    paymentStep1: {
      ja: "1. 注文確定 → 表示された口座へお振込み",
      th: "1. ยืนยันคำสั่งซื้อ → โอนเข้าบัญชีที่แสดง",
    },
    paymentStep2: {
      ja: "2. 振込後、スリップ（振込証明）をアップロード",
      th: "2. หลังโอน อัพโหลดสลิปโอนเงิน",
    },
    paymentStep3: {
      ja: "3. 確認後、発送のご連絡（平日・混雑時は前後する場合があります）",
      th: "3. หลังตรวจสอบ แจ้งการจัดส่ง (วันทำการ อาจช้าหากคิวเยอะ)",
    },
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
    /** スリップ提出後〜確認までの目安（不安解消・問い合わせ削減） */
    confirmationEta: {
      ja: "入金・スリップの確認は、平日で通常24〜48時間以内を目安に行います（混雑時は遅れる場合があります）。",
      th: "ตรวจสอบการโอน/สลิป โดยปกติภายใน 24–48 ชม. ในวันทำการ (ช่วงคิวเยอะอาจล่าช้า)",
    },
    /** 注文金額とスリップ金額が一致しない場合 */
    slipAmountMismatch: {
      ja: "一致しません。または、支払いが確認できるまで送ることはできません。",
      th: "จำนวนไม่ตรงกัน หรือเราจะจัดส่งได้เมื่อยืนยันการชำระเงินแล้วเท่านั้น",
    },
    orderTotalLabel: { ja: "お支払い合計", th: "ยอดที่ต้องชำระ" },
    slipAmountLabel: { ja: "スリップに記載の金額 (฿)", th: "จำนวนในสลิป (บาท)" },
    slipAmountRequired: { ja: "（必須・照合用）", th: "(จำเป็น เพื่อตรวจสอบ)" },
    /** スリップ金額が注文合計と一致 */
    slipAmountMatch: {
      ja: "注文金額と一致しています。",
      th: "จำนวนตรงกับยอดสั่งซื้อ",
    },
    /** スリップ金額が注文合計より多い */
    slipAmountOver: {
      ja: "注文金額より多いです。過払い分は返金等で対応します。",
      th: "จ่ายเกินยอดสั่ง เราจะจัดการส่วนที่เกิน (คืนหรือเก็บเป็นเครดิต)",
    },
    /** 写真から金額を読み取ったとき */
    slipAmountOcrHint: {
      ja: "写真から読み取りました。確認・修正してください。",
      th: "อ่านจากรูปแล้ว กรุณาตรวจสอบหรือแก้ไข",
    },
    slipOcrReading: { ja: "写真から金額を読み取り中…", th: "กำลังอ่านจำนวนจากรูป…" },
  },
  nav: {
    home: { ja: "ホーム", th: "หน้าแรก" },
    products: { ja: "商品一覧", th: "สินค้า" },
    about: { ja: "私たちについて", th: "เกี่ยวกับเรา" },
    track: { ja: "注文確認", th: "ติดตามคำสั่งซื้อ" },
  },
  product: {
    outOfStock: { ja: "品切れ中", th: "หมดแล้ว" },
    set: { ja: "セット", th: "เซ็ต" },
    recommended: { ja: "おすすめ", th: "แนะนำ" },
    saltWith: { ja: "塩あり", th: "มีเกลือ" },
    saltWithout: { ja: "塩なし", th: "ไม่มีเกลือ" },
    saltLabel: { ja: "塩:", th: "เกลือ:" },
    chooseFlavors: { ja: "味を選んでください", th: "เลือกรส" },
    chooseMoreBags: { ja: "あと", th: "เลือกอีก " },
    chooseMoreBagsSuffix: { ja: "袋選んでください", th: " ถุง" },
  },
  /** VIP / ロイヤリティ UI */
  vip: {
    silverRibbon: { ja: "SILVER & ABOVE", th: "SILVER ขึ้นไป" },
    goldRibbon: { ja: "GOLD MEMBERS", th: "GOLD MEMBERS" },
    silverLockLead: {
      ja: "シルバー会員以上限定の商品です",
      th: "สินค้าสำหรับสมาชิกซิลเวอร์ขึ้นไปเท่านั้น",
    },
    goldLockLead: {
      ja: "ゴールド会員限定商品です",
      th: "สินค้าสำหรับสมาชิกโกลด์เท่านั้น",
    },
    goldLockYouAre: { ja: "あなたは現在", th: "คุณเป็นสมาชิก" },
    goldLockSuffix: { ja: "です。", th: "ในขณะนี้" },
    tierGuest: { ja: "ゲスト", th: "ผู้เยี่ยมชม" },
    tierNormal: { ja: "Normal", th: "Normal" },
    tierSilver: { ja: "Silver", th: "Silver" },
    tierGold: { ja: "Gold", th: "Gold" },
    signInForGold: { ja: "会員登録・ログイン", th: "สมัคร / เข้าสู่ระบบ" },
    signInForVip: { ja: "会員ログインへ", th: "เข้าสู่ระบบสมาชิก" },
    cartGoldProgress: {
      ja: "あと {amount} THB で【ゴールド会員】に昇格します",
      th: "อีก {amount} บาท คุณจะเลื่อนระดับเป็น【สมาชิกโกลด์】",
    },
    cartGoldReached: {
      ja: "このお買い物でゴールド会員の条件を満たす見込みです。",
      th: "การสั่งซื้อนี้น่าจะครบเงื่อนไขสมาชิกโกลด์",
    },
    celebrationCta: { ja: "特典を見る", th: "ดูสิทธิพิเศษ" },
  },
} as const;

export const BANK_INFO = {
  bankName: "Government Savings Bank (ธนาคารออมสิน)",
  accountName: "CHIRAPHON KHEHALUN",
  /** Thai name exactly as shown in the PromptPay QR image (for verification) */
  accountNameTH: "น.ส. จิราพร เคหะลูน",
  accountNumber: "020-4-57390-910",
  /** Path to PromptPay QR image in /public. 実際のファイルに合わせて .png または .jpg を指定。 */
  promptPayQrPath: "/promptpay-qr.jpg",
  /** Optional fallback when main path fails to load. */
  promptPayQrPathFallback: "/promptpay-qr.png",
} as const;

/** 送料無料になる小計（割引後）の閾値（バーツ） */
export const FREE_SHIPPING_THRESHOLD_BAHT = 1000;

/** 1000未満のときの送料（バーツ） */
export const DEFAULT_SHIPPING_FEE_BAHT = 50;

/**
 * 送料計算（小計ベース）
 * 小計が1000バーツ未満 → 50฿、1000バーツ以上 → 0฿
 */
export function getShippingFeeBaht(subtotalBaht: number): number {
  return subtotalBaht >= FREE_SHIPPING_THRESHOLD_BAHT ? 0 : DEFAULT_SHIPPING_FEE_BAHT;
}

/** 送料表示用テキスト（送料ページ・チェックアウトで使用） */
export const SHIPPING_DESCRIPTION = {
  ja: "1000バーツ未満は送料50バーツ。1000バーツ以上のお買い上げで送料無料です。",
  th: "ยอดต่ำกว่า 1,000 บาท ค่าขนส่ง 50 บาท ซื้อครบ 1,000 บาท ส่งฟรี",
} as const;

/** サイトの絶対URL（sitemap.xml 等で使用）。本番では NEXT_PUBLIC_SITE_URL を設定すること。 */
export const SITE_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL?.trim()) ||
  "https://example.com";

/** 公式LINEアカウントのURL（お問い合わせ用）。Cloudflare の環境変数で NEXT_PUBLIC_LINE_OFFICIAL_URL を設定可能。 */
export const LINE_OFFICIAL_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_LINE_OFFICIAL_URL) ||
  "https://line.me";

/** 公式LINEのQRコード画像（public 内のパス）。空なら非表示。 */
export const LINE_OFFICIAL_QR_PATH = "/line-official-qr.png";

/**
 * PromptPayに紐づくID（電話番号・口座番号・National IDなど）。
 * 金額入りQRコード生成に使用。環境変数 NEXT_PUBLIC_PROMPTPAY_ID で上書き可能。
 * 例: オームシン銀行口座ベースの場合は "020457390910"
 */
export function getPromptPayId(): string {
  const id =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_PROMPTPAY_ID?.trim()) ||
    "";
  return id || "020457390910";
}
