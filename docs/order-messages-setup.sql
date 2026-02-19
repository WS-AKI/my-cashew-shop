-- order_messages: 注文ごとのメッセージ（お客様 ↔ 店舗）
CREATE TABLE IF NOT EXISTS public.order_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id),
  sender text NOT NULL CHECK (sender IN ('customer', 'shop')),
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert messages" ON public.order_messages;
CREATE POLICY "Anyone can insert messages" ON public.order_messages
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read messages" ON public.order_messages;
CREATE POLICY "Anyone can read messages" ON public.order_messages
  FOR SELECT TO anon USING (true);
