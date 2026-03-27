/**
 * 日本語ロケール辞書
 * LanguageContext の "ja" モード時に使用します。
 * ※ マーケット切り替え（ja/th audience）とは独立した、表示言語の制御専用です。
 */
export type Locale = {
  nav: {
    home: string;
    products: string;
    about: string;
    track: string;
  };
  hero: {
    eyebrow: string;
    title1: string;
    title2: string;
    sub: string;
    cta: string;
    ctaAbout: string;
  };
  footer: {
    brandDesc: string;
    shopHeading: string;
    products: string;
    cart: string;
    track: string;
    paymentMethod: string;
    infoHeading: string;
    about: string;
    shipping: string;
    lineHeading: string;
    lineQrAlt: string;
    lineScan: string;
    lineSlipNote: string;
    lineSlipNoteStrong: string;
    lineSlipNoteSuffix: string;
  };
  productsPage: {
    back: string;
    heading: string;
    desc: string;
    single: string;
    set: string;
    navAria: string;
    sortLabel: string;
    filterAll: string;
    filterSet: string;
    filterOriginal: string;
    filterCheese: string;
    filterBbq: string;
    filterNori: string;
    filterTomyum: string;
    sortRecommended: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    noResults: string;
    singleSection: string;
    setSection: string;
    loadError: string;
  };
  cart: {
    title: string;
    empty: string;
    emptyHint: string;
    viewProducts: string;
    subtotal: string;
    discount: string;
    total: string;
    proceedToCheckout: string;
    increase: string;
    decrease: string;
    remove: string;
    freeShippingUnlocked: string;
    /** "{remaining}" プレースホルダーを含む */
    freeShippingProgress: string;
    withSalt: string;
    withoutSalt: string;
  };
  product: {
    addToCart: string;
    added: string;
    vipPriceLabel: string;
    vipMemberPrice: string;
    /** "{pct}" プレースホルダーを含む */
    vipSaving: string;
    withSalt: string;
    withoutSalt: string;
  };
  checkout: {
    required: string;
    optional: string;
    /** バリデーションエラー */
    errorEmail: string;
    errorName: string;
    errorPhone: string;
    errorAddress1: string;
    errorTambon: string;
    errorAmphoe: string;
    errorProvince: string;
    errorPostalEmpty: string;
    errorPostalFormat: string;
    errorValidation: string;
    errorVipCheck: string;
    /** 住所サブフィールドラベル */
    address1Label: string;
    tambonLabel: string;
    amphoeLabel: string;
    provinceLabel: string;
    postalLabel: string;
    quickSelectLabel: string;
    quickSelectHint: string;
    /** プレースホルダー */
    tambonPlaceholder: string;
    amphoePlaceholder: string;
    provincePlaceholder: string;
    namePlaceholder: string;
    notePlaceholder: string;
    /** 3ステップ案内 */
    stepsHeading: string;
    step1: string;
    step1Sub: string;
    step2: string;
    step2Sub: string;
    step3: string;
    step3Sub: string;
    /** 塩オプション */
    withSalt: string;
    withoutSalt: string;
  };
  orderSuccess: {
    orderNumberHeading: string;
    orderNumberHint: string;
    orderNumberTrackHint: string;
    copyButton: string;
    copyLineButton: string;
    copied: string;
    scanAmountHint: string;
    slipUploadHeading: string;
    slipUploadInstruction: string;
    slipUploadLineFallback: string;
    slipSelectButton: string;
    slipUploadButton: string;
    slipUploading: string;
    slipOcrButton: string;
    slipOcrPreparing: string;
    slipOcrReading: string;
    slipUploadDone: string;
    uploadEta: string;
    memberLoginTitle: string;
    memberLoginDesc: string;
    memberLoginLink: string;
    trackOrderLink: string;
  };
  track: {
    pageTitle: string;
    pageSub: string;
    searchPlaceholder: string;
    searchButton: string;
    errorInvalidFormat: string;
    errorNotFound: string;
    errorAmbiguous: string;
    errorGeneric: string;
    slipPendingTitle: string;
    slipPendingLineFallback: string;
    slipCopyLine: string;
    amountLabel: string;
    slipOcrButton: string;
    slipOcrRunning: string;
    slipOcrDoneHint: string;
    slipSelectButton: string;
    slipUploadButton: string;
    slipUploading: string;
    slipUploadDone: string;
    uploadEta: string;
    orderDateLabel: string;
    orderTotalLabel: string;
    messagesHeading: string;
    noMessages: string;
    messagePlaceholder: string;
    messageSend: string;
    notFound: string;
  };
};

export const ja: Locale = {
  nav: {
    home: "ホーム",
    products: "商品",
    about: "私たちについて",
    track: "注文追跡",
  },
  hero: {
    eyebrow: "🌿 Sam Sian Cashew Nuts — Uttaradit, Thailand",
    title1: "タイ・ウタラディット県の大地で、",
    title2: "大切に育てました。",
    sub: "豊かな自然と温かい気候に恵まれたウタラディットの大地で育ったカシューナッツを、産地直送でお届けします。一度食べたら忘れられない、本物の味をぜひ。",
    cta: "商品を見る",
    ctaAbout: "私たちについて",
  },
  footer: {
    brandDesc: "タイ・ウタラディット県産の最高品質カシューナッツを産地直送でお届け。",
    shopHeading: "ショップ",
    products: "商品一覧",
    cart: "カート",
    track: "注文状況の確認",
    paymentMethod: "振込方法",
    infoHeading: "インフォメーション",
    about: "私たちについて",
    shipping: "送料・お届けについて",
    lineHeading: "公式LINE",
    lineQrAlt: "公式LINE 友だち追加用QRコード（スマホで読み取ってください）",
    lineScan: "スマホでQRを読み取って友だち追加・お問い合わせ",
    lineSlipNote: "銀行のスリップを送る時は、サイトからアップロードのほか、",
    lineSlipNoteStrong: "LINEで写真を送っていただくことも可能",
    lineSlipNoteSuffix: "です。",
  },
  productsPage: {
    back: "トップへ戻る",
    heading: "商品一覧",
    desc: "単品は1袋から、詰め合わせは組み合わせでお得に。タイ・ウタラディット県産を使用しています。",
    single: "単品",
    set: "詰め合わせ",
    navAria: "商品セクションへジャンプ",
    sortLabel: "並び替え",
    filterAll: "すべて",
    filterSet: "詰め合わせ",
    filterOriginal: "オリジナル",
    filterCheese: "チーズ",
    filterBbq: "BBQ",
    filterNori: "のり",
    filterTomyum: "トムヤム",
    sortRecommended: "おすすめ順",
    sortPriceAsc: "価格の安い順",
    sortPriceDesc: "価格の高い順",
    noResults: "条件に合う商品が見つかりませんでした。",
    singleSection: "単品商品",
    setSection: "詰め合わせ・お得セット",
    loadError: "商品の読み込みに失敗しました。ページを再読み込みしてください。",
  },
  cart: {
    title: "カート",
    empty: "カートは空です",
    emptyHint: "気になる商品をカートに追加してください",
    viewProducts: "商品を見る",
    subtotal: "小計",
    discount: "割引",
    total: "合計",
    proceedToCheckout: "チェックアウトへ進む",
    increase: "個数を増やす",
    decrease: "個数を減らす",
    remove: "削除",
    freeShippingUnlocked: "🎉 送料無料が適用されました！",
    freeShippingProgress: "送料無料まで残り ฿{remaining}",
    withSalt: "塩あり",
    withoutSalt: "塩なし",
  },
  product: {
    addToCart: "カートに追加",
    added: "追加しました",
    vipPriceLabel: "VIP価格",
    vipMemberPrice: "会員限定価格を適用可能",
    vipSaving: "VIPでさらに約{pct}%OFF（目安）",
    withSalt: "塩あり",
    withoutSalt: "塩なし",
  },
  checkout: {
    required: "必須",
    optional: "任意",
    errorEmail: "メールアドレスを入力してください",
    errorName: "名前 (Name) を入力してください",
    errorPhone: "電話番号を入力してください",
    errorAddress1: "住所1を入力してください",
    errorTambon: "区・町を入力してください",
    errorAmphoe: "郡・区を入力してください",
    errorProvince: "都・県を入力してください",
    errorPostalEmpty: "郵便番号を入力してください",
    errorPostalFormat: "郵便番号は5桁の数字で入力してください",
    errorValidation: "入力内容をご確認ください。赤いメッセージの項目を修正してください。",
    errorVipCheck: "購入可否の確認に失敗しました。時間をおいて再度お試しください。",
    address1Label: "住所1（番地・建物・Soi・道路）",
    tambonLabel: "区・町 (แขวง/ตำบล)",
    amphoeLabel: "郡・区 (เขต/อำเภอ)",
    provinceLabel: "都・県 (จังหวัด)",
    postalLabel: "郵便番号 (รหัสไปรษณีย์)",
    quickSelectLabel: "📍 エリアをクイック選択（任意）",
    quickSelectHint: "選択すると下の区・町・郡が自動入力されます（後から編集可）",
    tambonPlaceholder: "例: Khlong Tan Nuea / Watthana",
    amphoePlaceholder: "例: Watthana / Khlong Toei",
    provincePlaceholder: "例: Bangkok / กรุงเทพมหานคร",
    namePlaceholder: "例: Taro Yamada (アルファベット推奨)",
    notePlaceholder: "味の指定・配達希望・上記にない住所など",
    stepsHeading: "ご注文後の流れ (3ステップ)",
    step1: "注文を確定する",
    step1Sub: "Confirm your order",
    step2: "銀行振込 ＆ スリップ画像のアップロード",
    step2Sub: "Bank transfer & slip upload",
    step3: "入金確認 ＆ 商品の発送",
    step3Sub: "Payment confirmation & shipping",
    withSalt: "塩あり",
    withoutSalt: "塩なし",
  },
  orderSuccess: {
    orderNumberHeading: "注文番号",
    orderNumberHint: "この番号を控えてください。注文状況の確認に必要です。",
    orderNumberTrackHint: "注文後の状況は「注文状況の確認」ページでいつでもご確認いただけます。",
    copyButton: "Copy",
    copyLineButton: "LINE用にコピー",
    copied: "Copied",
    scanAmountHint: "スキャン後、この金額を入力してください",
    slipUploadHeading: "お支払いスリップのアップロード",
    slipUploadInstruction: "お振込後、スリップ（振込証明）をアップロードしてください。",
    slipUploadLineFallback: "難しい場合は、公式LINEに「注文番号＋スリップ写真」を送ってください。",
    slipSelectButton: "スリップを選択",
    slipUploadButton: "アップロードする",
    slipUploading: "アップロード中...",
    slipOcrButton: "スリップの金額を自動入力（任意）",
    slipOcrPreparing: "画像を最適化中...",
    slipOcrReading: "読み取り中...",
    slipUploadDone: "アップロード完了",
    uploadEta: "ご入金確認は通常24〜48時間以内（営業日）に行います。確認後、順次発送いたします。",
    memberLoginTitle: "同じメールで会員ログインできます",
    memberLoginDesc: "初回購入のあとで大丈夫です。ご注文に使ったメールアドレスでサインインすると、VIPランクや会員向け表示が反映されます。",
    memberLoginLink: "会員ログインへ",
    trackOrderLink: "注文状況を確認する",
  },
  track: {
    pageTitle: "注文状況を確認",
    pageSub: "注文番号を入力してください",
    searchPlaceholder: "注文番号（#付き・先頭8桁可）",
    searchButton: "確認",
    errorInvalidFormat:
      "注文番号の形式が正しくありません。表示されている番号をそのまま（または # 付き・先頭8桁）で入力してください。",
    errorNotFound: "注文が見つかりませんでした。注文番号をご確認ください。",
    errorAmbiguous:
      "同じ先頭番号に複数の注文が見つかりました。注文完了メールなどに記載の完全な注文番号（UUID）で検索してください。",
    errorGeneric: "エラーが発生しました。もう一度お試しください。",
    slipPendingTitle: "お支払いスリップが未提出です",
    slipPendingLineFallback: "難しい場合は、公式LINEに「注文番号＋スリップ写真」を送ってください。",
    slipCopyLine: "LINE用にコピー",
    amountLabel: "金額（任意）",
    slipOcrButton: "スリップの金額を自動入力（任意）",
    slipOcrRunning: "読み取り中...",
    slipOcrDoneHint: "OCRで金額候補を入力しました。最終確認をお願いします。",
    slipSelectButton: "スリップをアップロード",
    slipUploadButton: "アップロードする",
    slipUploading: "アップロード中...",
    slipUploadDone: "スリップをアップロードしました",
    uploadEta:
      "ご入金確認は通常24〜48時間以内（営業日）に行います。確認後、順次発送いたします。",
    orderDateLabel: "注文日",
    orderTotalLabel: "合計",
    messagesHeading: "メッセージ",
    noMessages: "メッセージはまだありません",
    messagePlaceholder: "メッセージを入力...",
    messageSend: "送信",
    notFound: "注文が見つかりませんでした",
  },
};
