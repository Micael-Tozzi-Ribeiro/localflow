import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

export interface DeliveryInfo {
  id: string;
  status: string;
  delivery_person_id: string | null;
  delivery_person?: {
    name: string;
    phone: string | null;
  };
}

export interface Order {
  id: string;
  customer_id: string;
  store_id: string;
  status: string;
  delivery_type: 'pickup' | 'delivery';
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  store?: {
    id: string;
    name: string;
    phone: string;
    address: string;
  };
  delivery_request?: DeliveryInfo;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMerchantOrders = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch orders for stores owned by this merchant
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          store:stores(id, name, phone, address)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch order items and delivery requests for each order
      if (ordersData && ordersData.length > 0) {
        const orderIds = ordersData.map(o => o.id);
        
        const [itemsResult, deliveryResult] = await Promise.all([
          supabase.from('order_items').select('*').in('order_id', orderIds),
          supabase.from('delivery_requests').select('id, status, delivery_person_id, order_id').in('order_id', orderIds)
        ]);

        if (itemsResult.error) throw itemsResult.error;

        // Fetch delivery person info for accepted deliveries
        const deliveryPersonIds = deliveryResult.data
          ?.filter(d => d.delivery_person_id)
          .map(d => d.delivery_person_id) || [];
        
        let deliveryPersons: Record<string, { name: string; phone: string | null }> = {};
        if (deliveryPersonIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('user_id, name, phone')
            .in('user_id', deliveryPersonIds);
          
          profilesData?.forEach(p => {
            deliveryPersons[p.user_id] = { name: p.name, phone: p.phone };
          });
        }

        const ordersWithItems = ordersData.map(order => {
          const deliveryReq = deliveryResult.data?.find(d => d.order_id === order.id);
          return {
            ...order,
            items: itemsResult.data?.filter(item => item.order_id === order.id) || [],
            delivery_request: deliveryReq ? {
              ...deliveryReq,
              delivery_person: deliveryReq.delivery_person_id 
                ? deliveryPersons[deliveryReq.delivery_person_id] 
                : undefined
            } : undefined
          };
        });

        setOrders(ordersWithItems as Order[]);
      } else {
        setOrders([]);
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Erro ao carregar pedidos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = async (
    storeId: string,
    items: { productId: string; productName: string; productPrice: number; quantity: number }[],
    deliveryType: 'pickup' | 'delivery',
    customerName: string,
    customerPhone: string,
    customerAddress?: string,
    notes?: string
  ) => {
    if (!user) return { data: null, error: 'Usuário não autenticado' };

    const totalAmount = items.reduce((acc, item) => acc + (item.productPrice * item.quantity), 0);

    try {
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          store_id: storeId,
          delivery_type: deliveryType,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_address: customerAddress || null,
          total_amount: totalAmount,
          notes: notes || null
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.productId,
        product_name: item.productName,
        product_price: item.productPrice,
        quantity: item.quantity,
        subtotal: item.productPrice * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return { data: orderData, error: null };
    } catch (error: any) {
      console.error('Error creating order:', error);
      return { data: null, error: error.message };
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status } : o
      ));

      return { error: null };
    } catch (error: any) {
      console.error('Error updating order:', error);
      return { error: error.message };
    }
  };

  const requestDelivery = async (orderId: string, storeId: string, storeName: string, customerAddress: string, customerPhone: string, customerName: string, totalAmount: number) => {
    if (!user) return { error: 'Usuário não autenticado' };

    try {
      const { error } = await supabase
        .from('delivery_requests')
        .insert({
          store_id: storeId,
          order_id: orderId,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_address: customerAddress,
          notes: `Valor do pedido: R$ ${totalAmount.toFixed(2)}`
        });

      if (error) throw error;

      // Update order status
      await updateOrderStatus(orderId, 'awaiting_delivery');

      return { error: null };
    } catch (error: any) {
      console.error('Error requesting delivery:', error);
      return { error: error.message };
    }
  };

  const deleteCompletedOrders = async () => {
    if (!user) return { error: 'Usuário não autenticado' };

    try {
      const completedOrderIds = orders
        .filter(o => o.status === 'completed' || o.status === 'cancelled')
        .map(o => o.id);

      if (completedOrderIds.length === 0) {
        return { error: 'Nenhum pedido finalizado para apagar' };
      }

      // Delete order items first
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .in('order_id', completedOrderIds);

      if (itemsError) throw itemsError;

      // Delete delivery requests
      await supabase
        .from('delivery_requests')
        .delete()
        .in('order_id', completedOrderIds);

      // Delete orders
      const { error: ordersError } = await supabase
        .from('orders')
        .delete()
        .in('id', completedOrderIds);

      if (ordersError) throw ordersError;

      setOrders(prev => prev.filter(o => !completedOrderIds.includes(o.id)));
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting orders:', error);
      return { error: error.message };
    }
  };

  const confirmPickup = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'in_delivery' })
        .eq('id', orderId);

      if (error) throw error;

      // Update delivery request status too
      await supabase
        .from('delivery_requests')
        .update({ status: 'in_progress' })
        .eq('order_id', orderId);

      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: 'in_delivery' } : o
      ));

      return { error: null };
    } catch (error: any) {
      console.error('Error confirming pickup:', error);
      return { error: error.message };
    }
  };

  useEffect(() => {
    if (user) {
      fetchMerchantOrders();
    }
  }, [user]);

  return {
    orders,
    isLoading,
    createOrder,
    updateOrderStatus,
    requestDelivery,
    deleteCompletedOrders,
    confirmPickup,
    refetchOrders: fetchMerchantOrders
  };
}
