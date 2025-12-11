-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  delivery_type TEXT NOT NULL DEFAULT 'pickup', -- 'pickup' or 'delivery'
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  total_amount NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Customers can view their own orders"
ON public.orders FOR SELECT
USING (auth.uid() = customer_id);

CREATE POLICY "Store owners can view orders for their stores"
ON public.orders FOR SELECT
USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.owner_id = auth.uid()));

CREATE POLICY "Authenticated users can create orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Store owners can update their orders"
ON public.orders FOR UPDATE
USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.owner_id = auth.uid()));

-- Order items policies
CREATE POLICY "Users can view order items for their orders"
ON public.order_items FOR SELECT
USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()));

CREATE POLICY "Store owners can view order items for their stores"
ON public.order_items FOR SELECT
USING (EXISTS (SELECT 1 FROM orders JOIN stores ON stores.id = orders.store_id WHERE orders.id = order_items.order_id AND stores.owner_id = auth.uid()));

CREATE POLICY "Authenticated users can create order items"
ON public.order_items FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()));

-- Add order_id to delivery_requests table
ALTER TABLE public.delivery_requests ADD COLUMN order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE;

-- Update trigger for orders
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();