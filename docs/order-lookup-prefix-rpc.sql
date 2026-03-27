-- ============================================================
-- 注文番号の短縮参照（先頭8桁・#付き入力の解決用）
-- アプリ: supabase.rpc('find_orders_by_id_prefix', { p_prefix: 'xxxxxxxx' })
-- ============================================================
-- 管理画面や通知で「#xxxxxxxx」と表示している場合、顧客がそのまま検索できるようにする。

CREATE OR REPLACE FUNCTION public.find_orders_by_id_prefix(p_prefix text)
RETURNS TABLE (
  id uuid,
  status text,
  total_amount numeric,
  created_at timestamptz,
  slip_image_url text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    o.id,
    o.status::text,
    o.total_amount,
    o.created_at,
    o.slip_image_url
  FROM public.orders o
  WHERE length(trim(p_prefix)) >= 8
    AND lower(o.id::text) LIKE lower(left(trim(p_prefix), 8)) || '%'
  ORDER BY o.created_at DESC
  LIMIT 5;
$$;

COMMENT ON FUNCTION public.find_orders_by_id_prefix(text) IS
  'UUID の先頭8桁（16進）で注文を検索。複数件のときは新しい順に最大5件。';

GRANT EXECUTE ON FUNCTION public.find_orders_by_id_prefix(text) TO anon;
GRANT EXECUTE ON FUNCTION public.find_orders_by_id_prefix(text) TO authenticated;
