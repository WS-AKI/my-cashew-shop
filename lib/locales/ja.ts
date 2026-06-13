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
    giftProof: string;
    giftSupport: string;
  };
  gift: {
    eyebrow: string;
    heading: string;
    desc: string;
    cta: string;
    essentialTitle: string;
    essentialDesc: string;
    premiumTitle: string;
    premiumDesc: string;
    executiveTitle: string;
    executiveDesc: string;
    proofFresh: string;
    proofSupport: string;
    proofDelivery: string;
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
    giftGuideTitle: string;
    giftGuideDesc: string;
    giftEssential: string;
    giftEssentialDesc: string;
    giftPremium: string;
    giftPremiumDesc: string;
    giftExecutive: string;
    giftExecutiveDesc: string;
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
    giftSetBadge: string;
    premiumThaiGift: string;
    giftReady: string;
    freshlyPacked: string;
    souvenirFriendly: string;
    englishSupport: string;
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
    amountPlaceholder: string;
    copied: string;
    ocrFailedReadAmount: string;
    ocrFailedGeneric: string;
    uploadFailedGeneric: string;
  };
  header: {
    signIn: string;
    signOut: string;
    loggedIn: string;
    vipPageAriaLabel: string;
    languageSwitchAria: string;
  };
  home: {
    productsLabel: string;
    productsHeading: string;
    productsSub: string;
    navAria: string;
    single: string;
    set: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    songkranBannerTitle: string;
    songkranBannerExpiry: string;
    farmVideoEyebrow: string;
    farmVideoTitle: string;
    farmVideoDesc: string;
    farmVideoWatchOnYoutube: string;
    farmVideoChannelLabel: string;
    farmVideoIframeTitle: string;
  };
  productsGrid: {
    singleBadge: string;
    singleTitle: string;
    singleSub: string;
    setBadge: string;
    setTitle: string;
    setSub: string;
    viewAll: string;
    loadFailed: string;
    preparing: string;
  };
  productCard: {
    curatedContents: string;
    curatedSilverHint: string;
    vipPerkCustomize: string;
    bagsSuffix: string;
    vipPriceShort: string;
    vipMemberPriceFlag: string;
    vipSavingApprox: string;
  };
  productReviews: {
    toggleLabel: string;
    loading: string;
    countSuffix: string;
    reviewsCount: string;
    thanksFallback: string;
    none: string;
    formTitle: string;
    ratingLabel: string;
    namePlaceholder: string;
    commentPlaceholder: string;
    submit: string;
    posted: string;
    ariaOpen: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
    monthsAgo: string;
  };
  orderProgress: {
    ariaLabel: string;
    stepReceived: string;
    stepPayment: string;
    stepRoast: string;
    stepShipped: string;
    stepDelivered: string;
    roastingNow: string;
  };
  tierCelebration: {
    invitation: string;
    silverHeadline: string;
    silverSub: string;
    silverPerk: string;
    goldHeadline: string;
    goldSub: string;
    goldPerk: string;
    imagePreparing: string;
  };
  authToast: {
    loginSuccess: string;
    loginFailed: string;
  };
  authCallback: {
    processing: string;
    pleaseWait: string;
    timeout: string;
    returnToLogin: string;
  };
  login: {
    eyebrow: string;
    title: string;
    subtitle: string;
    benefitsHeading: string;
    benefit1: string;
    benefit2: string;
    benefit3: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordNote: string;
    submit: string;
    sending: string;
    back: string;
    hint: string;
    success: string;
    errorGeneric: string;
    errorRateLimit: string;
    errorLinkRetry: string;
    errorMissingCode: string;
    errorConfig: string;
    firstTimeLink: string;
  };
  account: {
    title: string;
    subtitle: string;
    vipTitle: string;
    vipDesc: string;
    trackTitle: string;
    trackDesc: string;
    ordersTitle: string;
    ordersDesc: string;
  };
  accountOrders: {
    title: string;
    subtitle: string;
    loginHint: string;
    loginCta: string;
    trackCta: string;
    empty: string;
    emptyHint: string;
    date: string;
    total: string;
    detail: string;
    loadError: string;
  };
  accountOrderDetail: {
    title: string;
    backList: string;
    loginRequired: string;
    forbidden: string;
    notFound: string;
    loadError: string;
    orderId: string;
    trackFull: string;
    signInLink: string;
  };
  accountVip: {
    title: string;
    subtitle: string;
    silverRoom: string;
    goldRoom: string;
    locked: string;
    addToCart: string;
    /** "{amount}" 含む */
    unlockSoon: string;
    toProducts: string;
    signIn: string;
    emptySilver: string;
    emptyGold: string;
  };
  accountError: {
    title: string;
    description: string;
    retry: string;
    toAccount: string;
  };
  announcement: {
    closeLabel: string;
    dontShowAgain: string;
    overlayClose: string;
  };
  checkoutExtra: {
    bannerSavedTitle: string;
    bannerClearButton: string;
    statusFilled: string;
    statusUnfilled: string;
    statusCompleteMessage: string;
    fieldEmail: string;
    fieldName: string;
    fieldAddress: string;
    fieldPhone: string;
    fieldNote: string;
    areaSelectPlaceholder: string;
    addressLine1Placeholder: string;
    postalPlaceholder: string;
    phonePlaceholder: string;
    /** "{remaining}" "{pct}" 含む */
    addMoreForOff: string;
    errorVipFallback: string;
    songkranTitle: string;
    songkranExpiry: string;
    bankSubtotal: string;
    bankDiscount: string;
    bankTotal: string;
  };
  orderSuccessExtra: {
    /** track ページへの誘導の予備テキスト */
    trackHintFallback: string;
    qrMissingNotice: string;
    slipUploadHeadingMandatory: string;
    slipUploadInstructionFallback: string;
    slipUploadLineFallbackJa: string;
    slipUploadDoneSimple: string;
    slipUploadEtaFallback: string;
    memberLoginTitleFallback: string;
    memberLoginDescFallback: string;
    memberLoginLinkFallback: string;
    trackOrderLinkFallback: string;
    amountPlaceholderExample: string;
    /** OCR 失敗 */
    ocrAmountFailed: string;
    ocrGenericFailed: string;
    uploadGenericFailed: string;
  };
  trackExtra: {
    amountPlaceholderExample: string;
    copied: string;
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
    giftProof: "ギフトにも選ばれるタイ産プレミアムナッツ",
    giftSupport: "日本語・英語で注文サポート",
  },
  gift: {
    eyebrow: "Premium Thai Gifts",
    heading: "タイらしさが伝わる、上質なカシューナッツギフト",
    desc: "旅行のお土産、ホテル滞在中の差し入れ、友人宅への手土産に。ウタラディット産カシューナッツを、贈り物として選びやすい3つのランクでご案内します。",
    cta: "ギフトセットを見る",
    essentialTitle: "Essential Gift",
    essentialDesc: "初めての方や軽いお土産に。少量で試しやすい入口セット。",
    premiumTitle: "Premium Gift",
    premiumDesc: "家族・友人・滞在先への手土産に。複数の味を楽しめる定番ギフト。",
    executiveTitle: "Executive Gift",
    executiveDesc: "会食や特別な相手に。高単価・まとめ買いにも向いた贈答向け。",
    proofFresh: "焙煎後に丁寧にパック",
    proofSupport: "英語注文サポート",
    proofDelivery: "タイ国内配送対応",
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
    giftGuideTitle: "ギフトセットの選び方",
    giftGuideDesc: "贈る相手・場面・予算に合わせて選びやすい3つのランク。",
    giftEssential: "Essential",
    giftEssentialDesc: "軽いお土産・初回購入に",
    giftPremium: "Premium",
    giftPremiumDesc: "友人・家族への手土産に",
    giftExecutive: "Executive",
    giftExecutiveDesc: "会食・特別な贈り物に",
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
    giftSetBadge: "Gift Set",
    premiumThaiGift: "Premium Thai Gift",
    giftReady: "ギフト向け",
    freshlyPacked: "丁寧にパック",
    souvenirFriendly: "お土産に最適",
    englishSupport: "英語サポート",
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
    tambonLabel: "町名・地区 (แขวง/ตำบล)",
    amphoeLabel: "区・郡 (เขต/อำเภอ)",
    provinceLabel: "都・県 (จังหวัด)",
    postalLabel: "郵便番号 (รหัสไปรษณีย์)",
    quickSelectLabel: "📍 エリアをクイック選択（任意）",
    quickSelectHint: "選択すると下の区・町・郡が自動入力されます（後から編集可）",
    tambonPlaceholder: "例: Khlong Tan Nuea",
    amphoePlaceholder: "例: Watthana",
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
    amountPlaceholder: "例: 150",
    copied: "コピーしました",
    ocrFailedReadAmount: "金額を読み取れませんでした。手動で入力してください。",
    ocrFailedGeneric: "OCRの読み取りに失敗しました。手動で入力してください。",
    uploadFailedGeneric: "アップロードに失敗しました",
  },
  header: {
    signIn: "会員ログイン",
    signOut: "ログアウト",
    loggedIn: "ログイン中",
    vipPageAriaLabel: "VIPページへ",
    languageSwitchAria: "言語切り替え",
  },
  home: {
    productsLabel: "Our Products",
    productsHeading: "人気商品ラインナップ",
    productsSub: "全商品、タイ・ウタラディット県産を使用。素材本来の旨みを引き出すために、丁寧に焙煎しています。",
    navAria: "商品セクションへジャンプ",
    single: "単品",
    set: "詰め合わせ",
    feature1Title: "ウタラディット産プレミアム",
    feature1Desc: "タイ・ウタラディット県産の厳選されたカシューナッツのみを使用。",
    feature2Title: "品質保証",
    feature2Desc: "毎ロット品質検査済み。鮮度にこだわり真空パックでお届け。",
    feature3Title: "迅速発送",
    feature3Desc: "ご入金確認後、1〜2営業日以内に発送いたします。",
    songkranBannerTitle: "ソンクラーン前 送料無料キャンペーン適用中！",
    songkranBannerExpiry: "4月10日（バンコク時間）23:59まで有効",
    farmVideoEyebrow: "農園ダイジェスト",
    farmVideoTitle: "ウタラディットの農園から — 動画で見るカシューナッツ",
    farmVideoDesc:
      "ご案内したブランドの舞台であるウタラディットの農園では、収穫や選別、焙煎にまつわる様子をYouTubeで公開しています。お届けするナッツがどんな土地から来ているか、短い動画でイメージしやすくなります。",
    farmVideoWatchOnYoutube: "YouTubeで見る",
    farmVideoChannelLabel: "農園チャンネル（YouTube）",
    farmVideoIframeTitle: "Sam Sian カシューナッツ — 農園の動画",
  },
  productsGrid: {
    singleBadge: "単品",
    singleTitle: "1袋から選べる",
    singleSub: "Single bags by flavor",
    setBadge: "詰め合わせ",
    setTitle: "組み合わせでお得",
    setSub: "Mix-and-match savings sets",
    viewAll: "すべての商品を見る",
    loadFailed: "商品の読み込みに失敗しました。ページを再読み込みしてください。",
    preparing: "ただいま商品の準備中です。しばらくお待ちください。",
  },
  productCard: {
    curatedContents: "セット内容（お店推奨ミックス）",
    curatedSilverHint: "Silver会員以上はお好みで味の組み合わせを自由に変更できます。",
    vipPerkCustomize: "VIP特典: お好みで味を変更できます（お店推奨をプリセット表示中）",
    bagsSuffix: "袋",
    vipPriceShort: "VIP価格",
    vipMemberPriceFlag: "会員限定価格を適用可能",
    vipSavingApprox: "VIPでさらに約{pct}%OFF（目安）",
  },
  productReviews: {
    toggleLabel: "レビュー",
    loading: "確認中…",
    countSuffix: "件",
    reviewsCount: "{count}件のレビュー",
    thanksFallback: "評価ありがとうございます。",
    none: "まだレビューがありません。最初のレビューを書いてみましょう！",
    formTitle: "「{name}」のレビューを書く",
    ratingLabel: "評価:",
    namePlaceholder: "お名前（ニックネームOK）",
    commentPlaceholder: "コメント（任意）",
    submit: "レビューを投稿",
    posted: "投稿しました！",
    ariaOpen: "{name}のレビューを開く",
    minutesAgo: "{n}分前",
    hoursAgo: "{n}時間前",
    daysAgo: "{n}日前",
    monthsAgo: "{n}ヶ月前",
  },
  orderProgress: {
    ariaLabel: "ご注文の進捗",
    stepReceived: "ご注文受付",
    stepPayment: "ご入金確認",
    stepRoast: "焙煎・準備中",
    stepShipped: "発送済み",
    stepDelivered: "お届け完了",
    roastingNow: "丁寧に焙煎・詰め合わせています",
  },
  tierCelebration: {
    invitation: "Sam Sian · Invitation",
    silverHeadline: "Welcome to Silver Status.",
    silverSub: "Sam Sian Cashew Nuts のシルバー会員として、特別なおもてなしをご用意しております。",
    silverPerk: "限定フレーバーやセットの先行案内、さらにゴールド会員向けレア商品（ジャム等）への道がひらけます。静かに、長くお付き合いくださいませ。",
    goldHeadline: "Welcome to Gold Status.",
    goldSub: "最上級のお客様として、心を込めてお迎えいたします。",
    goldPerk: "ゴールド会員限定商品（No.0・ジャムなど）のご購入権、優先的なご案内をお約束いたします。",
    imagePreparing: "画像は準備中です。落ち着いた余白をお楽しみください。",
  },
  authToast: {
    loginSuccess: "ログインしました",
    loginFailed: "ログインに失敗しました。もう一度お試しください。",
  },
  authCallback: {
    processing: "ログイン処理中…",
    pleaseWait: "しばらくそのままお待ちください",
    timeout: "ログインリンクの処理がタイムアウトしました。お手数ですが、もう一度メールアドレスを入力してログインし直してください。",
    returnToLogin: "ログインページへ戻る",
  },
  login: {
    eyebrow: "Members",
    title: "VIPラウンジへようこそ",
    subtitle: "お持ちのメールアドレスだけで、特別な会員特典をご利用いただけます。",
    benefitsHeading: "会員になる3つの特別なメリット",
    benefit1: "ランクアップ制度：ご購入金額に応じて Silver / Gold へ昇格",
    benefit2: "シークレット特典：VIP限定商品のご購入アクセス",
    benefit3: "パスワードレス：次回からメールだけで簡単・安全にログイン",
    emailLabel: "メールアドレス",
    emailPlaceholder: "例：name@example.com",
    passwordNote: "※面倒なパスワードの登録や暗記は一切不要です",
    submit: "メールでログイン（パスワード不要）",
    sending: "メールをお送りしています…",
    back: "ショップに戻る",
    hint: "届いたメール内のリンクをタップするだけでログインできます。GmailはChromeで開かれることがありますが、そのままご利用いただけます。",
    success: "ログイン用のメールをお送りしました。受信トレイをご確認のうえ、届いたメールのリンクをタップしてください。GmailアプリやChromeで開かれても問題ありません。",
    errorGeneric: "送信に失敗しました。時間をおいて再度お試しください。",
    errorRateLimit: "少し時間をおいてから再度お試しください。",
    errorLinkRetry: "リンクの有効期限が切れた可能性があります。お手数ですが、もう一度メールアドレスを入力してログインし直してください。",
    errorMissingCode: "ログイン用のリンクが不完全です。メールからもう一度お開きください。",
    errorConfig: "一時的に接続できませんでした。時間をおいて再度お試しください。",
    firstTimeLink: "お買い物だけの方（ログイン不要）",
  },
  account: {
    title: "マイページ",
    subtitle: "会員メニュー",
    vipTitle: "VIPルーム",
    vipDesc: "特典確認・限定商品の購入はこちら",
    trackTitle: "注文状況の確認",
    trackDesc: "注文番号から配送状況を確認できます",
    ordersTitle: "注文履歴",
    ordersDesc: "ログイン中のアカウントの注文一覧と進捗",
  },
  accountOrders: {
    title: "注文履歴",
    subtitle: "マイページ",
    loginHint: "注文一覧を表示するには、会員ログインしてください（注文時のメールアドレスと同じアカウント）。",
    loginCta: "ログインへ",
    trackCta: "注文番号で確認",
    empty: "まだ表示できる注文がありません。",
    emptyHint: "ゲスト購入の場合は、注文完了メールの番号から「注文状況の確認」でご確認ください。",
    date: "注文日",
    total: "合計",
    detail: "詳細",
    loadError: "読み込みに失敗しました。しばらくしてから再度お試しください。",
  },
  accountOrderDetail: {
    title: "注文詳細",
    backList: "注文履歴に戻る",
    loginRequired: "ログインが必要です",
    forbidden: "この注文を表示する権限がありません。",
    notFound: "注文が見つかりませんでした。",
    loadError: "読み込みに失敗しました。",
    orderId: "注文番号",
    trackFull: "メッセージ・スリップはこちら",
    signInLink: "ログイン",
  },
  accountVip: {
    title: "VIPルーム",
    subtitle: "限定特典と会員限定プロダクト",
    silverRoom: "Silver Selection",
    goldRoom: "Gold Collection",
    locked: "ロック中",
    addToCart: "カートに追加",
    unlockSoon: "あと {amount} THB でアンロック",
    toProducts: "商品一覧へ",
    signIn: "会員ログイン",
    emptySilver: "現在、Silver 以上限定の商品はありません。",
    emptyGold: "現在、Gold 限定の商品はありません。",
  },
  accountError: {
    title: "読み込みに失敗しました",
    description: "ページの表示中にエラーが発生しました。しばらくしてから再度お試しください。",
    retry: "再試行",
    toAccount: "マイページへ",
  },
  announcement: {
    closeLabel: "閉じる",
    dontShowAgain: "今後このメッセージを表示しない",
    overlayClose: "オーバーレイを閉じる",
  },
  checkoutExtra: {
    bannerSavedTitle: "前回のご注文情報が入力されています",
    bannerClearButton: "クリア",
    statusFilled: "入力済み",
    statusUnfilled: "未入力",
    statusCompleteMessage: "必須項目はすべて入力済みです。「注文を確定する」ボタンを押してください。",
    fieldEmail: "メールアドレス",
    fieldName: "名前",
    fieldAddress: "お届け先住所",
    fieldPhone: "電話番号",
    fieldNote: "備考",
    areaSelectPlaceholder: "エリアを選択",
    addressLine1Placeholder: "Room 123, Waterford Condo, 50/1 Soi Sukhumvit 39",
    postalPlaceholder: "10110",
    phonePlaceholder: "08x-xxx-xxxx",
    addMoreForOff: "あと ฿{remaining} で {pct}% OFF！",
    errorVipFallback: "購入可否の確認に失敗しました。時間をおいて再度お試しください。",
    songkranTitle: "ソンクラーン前 送料無料キャンペーン適用中！",
    songkranExpiry: "4月10日（バンコク時間）23:59まで有効",
    bankSubtotal: "小計",
    bankDiscount: "割引",
    bankTotal: "合計（THB）",
  },
  orderSuccessExtra: {
    trackHintFallback: "注文後の状況は「注文状況の確認」ページでいつでもご確認いただけます。ヘッダー・フッターからもアクセスできます。",
    qrMissingNotice: "QRコード画像がありません。public フォルダに promptpay-qr.png または promptpay-qr.jpg を配置してください。",
    slipUploadHeadingMandatory: "お支払いスリップのアップロード",
    slipUploadInstructionFallback: "お振込後、スリップ（振込証明）をアップロードしてください。",
    slipUploadLineFallbackJa: "難しい場合は、公式LINEに「注文番号＋スリップ写真」を送ってください。",
    slipUploadDoneSimple: "アップロード完了",
    slipUploadEtaFallback: "ご入金確認は通常24〜48時間以内（営業日）に行います。確認後、順次発送いたします。",
    memberLoginTitleFallback: "同じメールで会員ログインできます",
    memberLoginDescFallback: "初回購入のあとで大丈夫です。ご注文に使ったメールアドレスでサインインすると、VIPランクや会員向け表示が反映されます。",
    memberLoginLinkFallback: "会員ログインへ",
    trackOrderLinkFallback: "注文状況を確認する",
    amountPlaceholderExample: "例: 150",
    ocrAmountFailed: "金額を読み取れませんでした。手動で金額を入力してください。",
    ocrGenericFailed: "OCRの読み取りに失敗しました。手動で金額を入力してください。",
    uploadGenericFailed: "アップロードに失敗しました",
  },
  trackExtra: {
    amountPlaceholderExample: "例: 150",
    copied: "コピーしました",
  },
};
