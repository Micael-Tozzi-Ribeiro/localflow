-- Allow store owners to delete orders for their stores
CREATE POLICY "Store owners can delete orders for their stores" 
ON public.orders 
FOR DELETE 
USING (EXISTS ( SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.owner_id = auth.uid()));

-- Allow deletion of order items when the order is being deleted by store owner
CREATE POLICY "Store owners can delete order items for their stores" 
ON public.order_items 
FOR DELETE 
USING (EXISTS ( SELECT 1 FROM orders JOIN stores ON stores.id = orders.store_id WHERE orders.id = order_items.order_id AND stores.owner_id = auth.uid()));

-- Allow store owners to delete delivery requests for their stores
CREATE POLICY "Store owners can delete delivery requests" 
ON public.delivery_requests 
FOR DELETE 
USING (EXISTS ( SELECT 1 FROM stores WHERE stores.id = delivery_requests.store_id AND stores.owner_id = auth.uid()));