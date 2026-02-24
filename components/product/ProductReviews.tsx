"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, ChevronDown, ChevronUp, Send, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ProductReview } from "@/types";

type Props = { productId: string; productName: string };

function StarRating({
  value,
  onChange,
  size = 18,
  interactive = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  interactive?: boolean;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(n)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            size={size}
            className={n <= value ? "text-yellow-400" : "text-gray-300"}
            fill={n <= value ? "#facc15" : "none"}
          />
        </button>
      ))}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}分前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}日前`;
  const months = Math.floor(days / 30);
  return `${months}ヶ月前`;
}

export default function ProductReviews({ productId, productName }: Props) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [fetched, setFetched] = useState(false);

  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (fetched) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("product_reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    setReviews((data as ProductReview[]) ?? []);
    setFetched(true);
    setLoading(false);
  }, [productId, fetched]);

  useEffect(() => {
    if (open && !fetched) queueMicrotask(() => fetchReviews());
  }, [open, fetched, fetchReviews]);

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || rating < 1) return;
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("product_reviews").insert({
      product_id: productId,
      reviewer_name: name.trim(),
      rating,
      comment: comment.trim() || null,
    });
    setSubmitting(false);
    if (!error) {
      setSubmitted(true);
      setFetched(false);
      fetchReviews().then(() => setFetched(true));
      setName("");
      setComment("");
      setRating(5);
      setTimeout(() => setSubmitted(false), 3000);
    }
  }

  return (
    <div className="border-t border-gray-100">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Star size={13} className="text-yellow-400" fill="#facc15" />
          レビュー
          {fetched && reviews.length > 0 && (
            <span className="text-gray-400">
              ({avg.toFixed(1)} / {reviews.length}件)
            </span>
          )}
        </span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 size={20} className="animate-spin text-amber-400" />
            </div>
          ) : (
            <>
              {reviews.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {reviews.map((r) => (
                    <div key={r.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-700">{r.reviewer_name}</span>
                          <StarRating value={r.rating} size={12} />
                        </div>
                        <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(r.created_at)}</span>
                      </div>
                      {r.comment && (
                        <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{r.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-2">
                  まだレビューがありません。最初のレビューを書いてみましょう！
                </p>
              )}

              {/* Review form */}
              <form onSubmit={handleSubmit} className="bg-amber-50 rounded-xl p-3 space-y-2.5">
                <p className="text-xs font-bold text-amber-700">
                  「{productName}」のレビューを書く
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 shrink-0">評価:</span>
                  <StarRating value={rating} onChange={setRating} interactive size={20} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="お名前（ニックネームOK）"
                  maxLength={50}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                />
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="コメント（任意）"
                  rows={2}
                  maxLength={500}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent resize-none"
                />
                <button
                  type="submit"
                  disabled={submitting || !name.trim()}
                  className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : submitted ? (
                    "投稿しました！"
                  ) : (
                    <>
                      <Send size={12} />
                      レビューを投稿
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
