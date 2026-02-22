"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Product, FlavorColor, FLAVOR_COLORS, PriceVariant } from "@/types";
import {
  Camera,
  Loader2,
  X,
  Tag,
  Package,
  Banknote,
  BarChart2,
  Weight,
  Globe,
  ShoppingBag,
  Star,
  SortAsc,
  FileText,
  Hash,
  Plus,
} from "lucide-react";

type ProductFormProps = {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
};

const SIZE_OPTIONS = [100, 200, 250, 500] as const;

type SizePrices = Record<number, string>;
type SizeImageUrls = Record<number, string>;

type FormData = {
  name_ja: string;
  name_th: string;
  description_ja: string;
  description_th: string;
  price: string;
  sale_price: string;
  stock: string;
  display_order: string;
  is_active: boolean;
  is_promotion: boolean;
  flavor_color: FlavorColor | "";
  weight_g: string;
  is_set: boolean;
  set_quantity: string;
  sizePrices: SizePrices;
  sizeSalePrices: SizePrices;
  sizeImages: SizeImageUrls;
};

function buildInitialSizePrices(variants?: PriceVariant[]): SizePrices {
  const prices: SizePrices = {};
  for (const s of SIZE_OPTIONS) prices[s] = "";
  if (variants && Array.isArray(variants)) {
    for (const v of variants) {
      if (v.size_g in prices) prices[v.size_g] = String(v.price);
    }
  }
  return prices;
}

function buildInitialSizeSalePrices(variants?: PriceVariant[]): SizePrices {
  const prices: SizePrices = {};
  for (const s of SIZE_OPTIONS) prices[s] = "";
  if (variants && Array.isArray(variants)) {
    for (const v of variants) {
      if (v.size_g in prices && v.sale_price) prices[v.size_g] = String(v.sale_price);
    }
  }
  return prices;
}

function buildInitialSizeImages(variants?: PriceVariant[]): SizeImageUrls {
  const imgs: SizeImageUrls = {};
  for (const s of SIZE_OPTIONS) imgs[s] = "";
  if (variants && Array.isArray(variants)) {
    for (const v of variants) {
      if (v.size_g in imgs && v.image_url) imgs[v.size_g] = v.image_url;
    }
  }
  return imgs;
}

function buildInitialForm(product?: Product): FormData {
  if (!product) {
    return {
      name_ja: "", name_th: "",
      description_ja: "", description_th: "",
      price: "", sale_price: "", stock: "0", display_order: "0",
      is_active: true, is_promotion: false,
      flavor_color: "", weight_g: "", is_set: false, set_quantity: "",
      sizePrices: buildInitialSizePrices(),
      sizeSalePrices: buildInitialSizeSalePrices(),
      sizeImages: buildInitialSizeImages(),
    };
  }
  return {
    name_ja: product.name_ja,
    name_th: product.name_th ?? "",
    description_ja: product.description_ja ?? "",
    description_th: product.description_th ?? "",
    price: String(product.price),
    sale_price: product.sale_price ? String(product.sale_price) : "",
    stock: String(product.stock),
    display_order: String(product.display_order),
    is_active: product.is_active,
    is_promotion: product.is_promotion,
    flavor_color: product.flavor_color ?? "",
    weight_g: product.weight_g ? String(product.weight_g) : "",
    is_set: product.is_set,
    set_quantity: product.set_quantity ? String(product.set_quantity) : "",
    sizePrices: buildInitialSizePrices(product.price_variants),
    sizeSalePrices: buildInitialSizeSalePrices(product.price_variants),
    sizeImages: buildInitialSizeImages(product.price_variants),
  };
}

function buildPriceVariants(
  sizePrices: SizePrices,
  sizeSalePrices: SizePrices,
  sizeImages: SizeImageUrls,
): PriceVariant[] {
  const variants: PriceVariant[] = [];
  for (const s of SIZE_OPTIONS) {
    const val = Number(sizePrices[s]);
    if (val > 0) {
      const saleVal = Number(sizeSalePrices[s]);
      const variant: PriceVariant = { size_g: s, price: Math.floor(val) };
      if (saleVal > 0 && saleVal < val) variant.sale_price = Math.floor(saleVal);
      if (sizeImages[s]) variant.image_url = sizeImages[s];
      variants.push(variant);
    }
  }
  return variants;
}

function Label({
  icon: Icon,
  children,
  color = "text-amber-500",
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
      <Icon size={15} className={color} />
      {children}
    </label>
  );
}

function Input({
  className = "",
  ring = "focus:ring-amber-400",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { ring?: string }) {
  return (
    <input
      {...props}
      className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400
        focus:outline-none focus:ring-2 ${ring} focus:border-transparent transition ${className}`}
    />
  );
}

function Toggle({
  checked,
  onChange,
  color = "bg-amber-500",
}: {
  checked: boolean;
  onChange: () => void;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 ${
        checked ? color : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
          checked ? "translate-x-7" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>(buildInitialForm(product));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(product?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(
    (product?.gallery_urls ?? []).filter(Boolean)
  );
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [sizeImageFiles, setSizeImageFiles] = useState<Record<number, File | null>>({});
  const [sizeImagePreviews, setSizeImagePreviews] = useState<SizeImageUrls>(
    buildInitialSizeImages(product?.price_variants)
  );
  const sizeFileRefs = useRef<Record<number, HTMLInputElement | null>>({});

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("画像ファイルを選択してください"); return; }
    if (file.size > 10 * 1024 * 1024) { setError("ファイルサイズは10MB以下にしてください"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  }

  async function uploadImage(): Promise<{ url: string | null; ok: boolean }> {
    if (!imageFile) return { url: product?.image_url ?? null, ok: true };

    setUploading(true);
    const BUCKET = "product-images";
    const fileName = `${Date.now()}-${imageFile.name}`;

    try {
      const { data, error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error("[Supabase Storage] upload error:", uploadError);
        setError(`画像アップロードエラー: ${uploadError.message}`);
        return { url: null, ok: false };
      }

      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(data.path);

      return { url: urlData.publicUrl, ok: true };
    } catch (err) {
      console.error("[Supabase Storage] unexpected error:", err);
      setError(`予期しないエラーが発生しました: ${String(err)}`);
      return { url: null, ok: false };
    } finally {
      setUploading(false);
    }
  }

  function handleGalleryAdd(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!f.type.startsWith("image/")) continue;
      if (f.size > 10 * 1024 * 1024) continue;
      newFiles.push(f);
      newPreviews.push(URL.createObjectURL(f));
    }
    setGalleryFiles((prev) => [...prev, ...newFiles]);
    setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  }

  function removeGalleryImage(index: number) {
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
    const existingCount = (product?.gallery_urls ?? []).filter(Boolean).length;
    if (index >= existingCount) {
      const fileIdx = index - existingCount;
      setGalleryFiles((prev) => prev.filter((_, i) => i !== fileIdx));
    }
  }

  async function uploadGalleryImages(): Promise<{ urls: string[]; ok: boolean }> {
    const BUCKET = "product-images";
    const existingUrls = galleryPreviews.filter(
      (url) => !url.startsWith("blob:")
    );
    const uploadedUrls: string[] = [...existingUrls];

    for (const file of galleryFiles) {
      const fileName = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
      try {
        const { data, error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(fileName, file);
        if (uploadError) {
          setError(`ギャラリー画像アップロードエラー: ${uploadError.message}`);
          return { urls: uploadedUrls, ok: false };
        }
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
        uploadedUrls.push(urlData.publicUrl);
      } catch (err) {
        setError(`ギャラリー画像: ${String(err)}`);
        return { urls: uploadedUrls, ok: false };
      }
    }
    return { urls: uploadedUrls, ok: true };
  }

  function handleSizeImageChange(size: number, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("画像ファイルを選択してください"); return; }
    if (file.size > 10 * 1024 * 1024) { setError("ファイルサイズは10MB以下にしてください"); return; }
    setSizeImageFiles((prev) => ({ ...prev, [size]: file }));
    setSizeImagePreviews((prev) => ({ ...prev, [size]: URL.createObjectURL(file) }));
    setError(null);
  }

  function removeSizeImage(size: number) {
    setSizeImageFiles((prev) => ({ ...prev, [size]: null }));
    setSizeImagePreviews((prev) => ({ ...prev, [size]: "" }));
    setForm((prev) => ({
      ...prev,
      sizeImages: { ...prev.sizeImages, [size]: "" },
    }));
  }

  async function uploadSizeImages(): Promise<{ urls: SizeImageUrls; ok: boolean }> {
    const BUCKET = "product-images";
    const urls: SizeImageUrls = { ...form.sizeImages };

    for (const s of SIZE_OPTIONS) {
      const file = sizeImageFiles[s];
      if (!file) continue;

      const fileName = `${Date.now()}-size${s}-${file.name}`;
      try {
        const { data, error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(fileName, file);
        if (uploadError) {
          setError(`${s}g 画像アップロードエラー: ${uploadError.message}`);
          return { urls, ok: false };
        }
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
        urls[s] = urlData.publicUrl;
      } catch (err) {
        setError(`${s}g 画像: ${String(err)}`);
        return { urls, ok: false };
      }
    }
    return { urls, ok: true };
  }

  function updateSizePrice(size: number, value: string) {
    setForm((prev) => ({
      ...prev,
      sizePrices: { ...prev.sizePrices, [size]: value },
    }));
  }

  function updateSizeSalePrice(size: number, value: string) {
    setForm((prev) => ({
      ...prev,
      sizeSalePrices: { ...prev.sizeSalePrices, [size]: value },
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const priceVariants = form.is_set ? [] : buildPriceVariants(form.sizePrices, form.sizeSalePrices, form.sizeImages);
    const hasVariantPrices = priceVariants.length > 0;

    const basePrice = hasVariantPrices
      ? Math.min(...priceVariants.map((v) => v.price))
      : Number(form.price);

    const salePrice = form.sale_price ? Number(form.sale_price) : null;

    if (!form.name_ja.trim()) { setError("商品名（日本語）を入力してください"); return; }

    if (form.is_set) {
      if (isNaN(basePrice) || basePrice <= 0) { setError("セット商品の定価を入力してください"); return; }
    } else if (!hasVariantPrices) {
      setError("少なくとも1つのサイズに価格を入力してください"); return;
    }

    if (salePrice !== null && salePrice >= basePrice) {
      setError("セール価格は定価より低い金額にしてください"); return;
    }

    setSaving(true);
    const { url: imageUrl, ok: uploadOk } = await uploadImage();
    if (!uploadOk) { setSaving(false); return; }

    const { urls: uploadedSizeImages, ok: sizeUploadOk } = await uploadSizeImages();
    if (!sizeUploadOk) { setSaving(false); return; }

    const { urls: galleryUrls, ok: galleryUploadOk } = await uploadGalleryImages();
    if (!galleryUploadOk) { setSaving(false); return; }

    const finalVariants = form.is_set
      ? []
      : buildPriceVariants(form.sizePrices, form.sizeSalePrices, uploadedSizeImages);

    const payload: Record<string, unknown> = {
      name_ja: form.name_ja.trim() || "",
      name_th: form.name_th.trim() || "",
      description_ja: form.description_ja.trim() || null,
      description_th: form.description_th.trim() || null,
      price: Math.floor(form.is_set ? Number(form.price) || 0 : basePrice),
      sale_price: salePrice !== null ? Math.floor(salePrice) : null,
      stock: Math.floor(Number(form.stock)) || 0,
      display_order: Math.floor(Number(form.display_order)) || 0,
      is_active: form.is_active,
      is_promotion: form.is_promotion,
      image_url: imageUrl ?? "",
      flavor_color: form.flavor_color || "",
      weight_g: form.weight_g ? Math.floor(Number(form.weight_g)) : 0,
      is_set: form.is_set,
      set_quantity: form.is_set && form.set_quantity ? Math.floor(Number(form.set_quantity)) : null,
      price_variants: finalVariants,
      gallery_urls: galleryUrls,
    };

    let dbError;
    if (product) {
      const { error: e } = await supabase.from("products").update(payload).eq("id", product.id);
      dbError = e;
    } else {
      const { error: e } = await supabase.from("products").insert(payload);
      dbError = e;
    }

    setSaving(false);
    if (dbError) { setError(`保存エラー: ${dbError.message}`); return; }
    onSuccess();
  }

  const isLoading = uploading || saving;
  const hasDiscount =
    form.is_set &&
    form.sale_price !== "" &&
    Number(form.sale_price) > 0 &&
    Number(form.sale_price) < Number(form.price);

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-amber-700 to-amber-500 px-5 py-4 flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">
          {product ? "商品を編集" : "新しい商品を追加"}
        </h2>
        <button type="button" onClick={onCancel} className="text-white/80 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Photo */}
        <div>
          <Label icon={Camera}>商品写真（スマホカメラで撮影OK）</Label>
          <div onClick={() => fileInputRef.current?.click()} className="relative cursor-pointer group">
            {imagePreview ? (
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100">
                <Image src={imagePreview} alt="プレビュー" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Camera size={36} className="text-white" />
                  <span className="text-white font-bold">写真を変更</span>
                </div>
              </div>
            ) : (
              <div className="w-full aspect-square rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 flex flex-col items-center justify-center gap-3 hover:bg-amber-100 transition-colors">
                <Camera size={52} className="text-amber-400" />
                <p className="text-amber-700 font-bold text-lg">タップして写真を追加</p>
                <p className="text-amber-500 text-sm">カメラで撮影 または ギャラリーから選択</p>
                <p className="text-amber-400 text-xs">JPG・PNG・HEIC（最大10MB）</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Gallery */}
        <div>
          <Label icon={Camera} color="text-indigo-500">ギャラリー写真（複数枚OK）</Label>
          <p className="text-xs text-gray-500 mb-2">商品の魅力を伝える写真を追加できます。お客様に表示されます。</p>
          <div className="flex flex-wrap gap-2">
            {galleryPreviews.map((url, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 group">
                <Image src={url} alt={`Gallery ${i + 1}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(i)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="w-20 h-20 rounded-lg border-2 border-dashed border-indigo-300 bg-indigo-50 flex flex-col items-center justify-center gap-0.5 hover:border-indigo-400 hover:bg-indigo-100 transition-colors"
            >
              <Plus size={20} className="text-indigo-400" />
              <span className="text-[9px] text-indigo-400 font-medium">追加</span>
            </button>
          </div>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryAdd}
            className="hidden"
          />
        </div>

        {/* Product name JA */}
        <div>
          <Label icon={Package}>商品名（日本語）*</Label>
          <Input
            type="text"
            value={form.name_ja}
            onChange={(e) => setForm({ ...form, name_ja: e.target.value })}
            placeholder="例：オリジナル カシューナッツ"
            required
          />
        </div>

        {/* Product name TH */}
        <div>
          <Label icon={Globe} color="text-blue-500">商品名（タイ語）</Label>
          <Input
            type="text"
            value={form.name_th}
            onChange={(e) => setForm({ ...form, name_th: e.target.value })}
            placeholder="เช่น เม็ดมะม่วงหิมพานต์รสดั้งเดิม"
            ring="focus:ring-blue-400"
          />
        </div>

        {/* Description JA */}
        <div>
          <Label icon={FileText} color="text-teal-500">紹介文（日本語）</Label>
          <textarea
            value={form.description_ja}
            onChange={(e) => setForm({ ...form, description_ja: e.target.value })}
            placeholder="例：香ばしく焙煎した定番の味。おやつやお酒のお供に。"
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition resize-none text-sm"
          />
        </div>

        {/* Description TH */}
        <div>
          <Label icon={FileText} color="text-teal-500">紹介文（タイ語）</Label>
          <textarea
            value={form.description_th}
            onChange={(e) => setForm({ ...form, description_th: e.target.value })}
            placeholder="เช่น คั่วหอมกรุ่น รสชาติดั้งเดิม"
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition resize-none text-sm"
          />
        </div>

        {/* Flavor */}
        <div>
          <Label icon={Tag} color="text-purple-500">味・種類</Label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(FLAVOR_COLORS) as FlavorColor[]).map((key) => {
              const c = FLAVOR_COLORS[key];
              const selected = form.flavor_color === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm({ ...form, flavor_color: selected ? "" : key })}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ${
                    selected
                      ? `${c.bg} ${c.border} ${c.text} scale-105 shadow-md`
                      : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <span className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: c.hex }} />
                  <span className="text-xs font-bold leading-none">{c.label}</span>
                  <span className="text-[10px] leading-none opacity-70">{c.labelTh}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Set toggle */}
        <div className={`rounded-xl border-2 p-4 transition-colors ${
          form.is_set ? "bg-orange-50 border-orange-300" : "bg-gray-50 border-gray-200"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className={form.is_set ? "text-orange-500" : "text-gray-400"} />
              <div>
                <p className={`font-bold ${form.is_set ? "text-orange-700" : "text-gray-700"}`}>
                  セット販売商品
                </p>
                <p className="text-xs text-gray-500">複数の味を組み合わせて販売する場合</p>
              </div>
            </div>
            <Toggle
              checked={form.is_set}
              onChange={() => setForm({ ...form, is_set: !form.is_set })}
              color="bg-orange-500"
            />
          </div>
          {form.is_set && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-orange-600 bg-orange-100 rounded-lg p-2.5 leading-relaxed">
                セット商品はサイズ選択なし。下の「定価」にセット価格を入力してください。
              </p>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-orange-700 mb-1">
                  <Hash size={12} />
                  セット内の袋数 *
                </label>
                <Input
                  type="number"
                  value={form.set_quantity}
                  onChange={(e) => setForm({ ...form, set_quantity: e.target.value })}
                  placeholder="例: 3（3袋セット）"
                  min="1"
                  ring="focus:ring-orange-400"
                />
                <p className="text-[10px] text-gray-500 mt-1">お客様が選べる味の合計数になります</p>
              </div>
            </div>
          )}
        </div>

        {/* Size-based pricing (non-set only) */}
        {!form.is_set && (
          <div>
            <Label icon={Banknote}>サイズ別価格 (฿)</Label>
            <p className="text-xs text-gray-500 mb-3">価格を入力したサイズだけがお客様に表示されます。セール価格は任意です。</p>
            <div className="space-y-3">
              {SIZE_OPTIONS.map((size) => (
                <div key={size} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-bold text-gray-600 mb-2">{size}g</p>

                  {/* Per-size image */}
                  <div className="mb-2">
                    {sizeImagePreviews[size] ? (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 group">
                        <Image
                          src={sizeImagePreviews[size]}
                          alt={`${size}g`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeSizeImage(size)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                        <button
                          type="button"
                          onClick={() => sizeFileRefs.current[size]?.click()}
                          className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <Camera size={16} className="text-white" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => sizeFileRefs.current[size]?.click()}
                        className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center gap-0.5 hover:border-amber-400 hover:bg-amber-50 transition-colors"
                      >
                        <Camera size={16} className="text-gray-400" />
                        <span className="text-[9px] text-gray-400 font-medium">写真</span>
                      </button>
                    )}
                    <input
                      ref={(el) => { sizeFileRefs.current[size] = el; }}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handleSizeImageChange(size, e)}
                      className="hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      value={form.sizePrices[size]}
                      onChange={(e) => updateSizePrice(size, e.target.value)}
                      placeholder="通常価格"
                      min="0"
                    />
                    <Input
                      type="number"
                      value={form.sizeSalePrices[size]}
                      onChange={(e) => updateSizeSalePrice(size, e.target.value)}
                      placeholder="セール価格（任意）"
                      min="0"
                    />
                  </div>
                  {Number(form.sizeSalePrices[size]) > 0 && Number(form.sizePrices[size]) > 0 && (
                    <p className="text-xs mt-1 text-rose-500 font-medium">
                      {Math.round((1 - Number(form.sizeSalePrices[size]) / Number(form.sizePrices[size])) * 100)}% OFF
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Set price (set products only) */}
        {form.is_set && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label icon={Banknote}>セット定価 (฿) *</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="1000"
                min="1"
                required
              />
            </div>
            <div>
              <Label icon={Tag} color="text-red-500">セール価格 (฿)</Label>
              <Input
                type="number"
                value={form.sale_price}
                onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
                placeholder="空欄=通常価格"
                min="1"
                ring="focus:ring-red-400"
              />
            </div>
          </div>
        )}

        {/* Price preview */}
        {form.is_set && form.price && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-amber-600 mb-1.5">サイトでの表示プレビュー</p>
            {hasDiscount ? (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-gray-400 line-through text-lg">฿{Number(form.price).toLocaleString()}</span>
                <span className="text-red-500 font-bold text-2xl">฿{Number(form.sale_price).toLocaleString()}</span>
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                  {Math.round((1 - Number(form.sale_price) / Number(form.price)) * 100)}% OFF
                </span>
              </div>
            ) : (
              <span className="text-amber-900 font-bold text-2xl">฿{Number(form.price || 0).toLocaleString()}</span>
            )}
          </div>
        )}

        {/* Weight (set products) */}
        {form.is_set && (
          <div>
            <Label icon={Weight} color="text-green-500">内容量 (g) ※セット全体</Label>
            <Input
              type="number"
              value={form.weight_g}
              onChange={(e) => setForm({ ...form, weight_g: e.target.value })}
              placeholder="例：750 (250g x 3)"
              min="1"
              ring="focus:ring-green-400"
            />
          </div>
        )}

        {/* Stock & display order */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label icon={BarChart2}>在庫数</Label>
            <Input
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              min="0"
            />
          </div>
          <div>
            <Label icon={SortAsc} color="text-gray-500">表示順</Label>
            <Input
              type="number"
              value={form.display_order}
              onChange={(e) => setForm({ ...form, display_order: e.target.value })}
              min="0"
              placeholder="0"
              ring="focus:ring-gray-400"
            />
          </div>
        </div>

        {/* Promotion toggle */}
        <div className={`rounded-xl border-2 p-4 transition-colors ${
          form.is_promotion ? "bg-amber-50 border-amber-300" : "bg-gray-50 border-gray-200"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star size={18} className={form.is_promotion ? "text-amber-500 fill-amber-500" : "text-gray-400"} />
              <div>
                <p className={`font-bold ${form.is_promotion ? "text-amber-700" : "text-gray-700"}`}>
                  おすすめ商品（Recommended）
                </p>
                <p className="text-xs text-gray-500">ONにするとサイトに「おすすめ」バッジが表示されます</p>
              </div>
            </div>
            <Toggle
              checked={form.is_promotion}
              onChange={() => setForm({ ...form, is_promotion: !form.is_promotion })}
              color="bg-amber-500"
            />
          </div>
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
          <div>
            <p className="font-semibold text-gray-700">サイトに公開</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {form.is_active ? "現在お客様に表示中" : "非公開（下書き）"}
            </p>
          </div>
          <Toggle
            checked={form.is_active}
            onChange={() => setForm({ ...form, is_active: !form.is_active })}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-amber-700 to-amber-500 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={22} className="animate-spin" />
              {uploading ? "写真をアップロード中..." : "保存中..."}
            </>
          ) : (
            <>{product ? "変更を保存する" : "商品を登録する"}</>
          )}
        </button>
      </div>
    </form>
  );
}
