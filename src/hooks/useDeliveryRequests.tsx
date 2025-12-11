import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface DeliveryRequest {
  id: string;
  store_id: string;
  order_id: string | null;
  delivery_person_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  store?: {
    id: string;
    name: string;
    phone: string;
    address: string;
    neighborhood: string;
    state: string;
  };
  order?: {
    id: string;
    total_amount: number;
  };
}

export function useDeliveryRequests() {
  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const fetchDeliveryRequests = async () => {
    if (!user || !profile) return;

    setIsLoading(true);
    try {
      // Fetch delivery requests
      const { data, error } = await supabase
        .from('delivery_requests')
        .select(`
          *,
          store:stores(id, name, phone, address, neighborhood, state),
          order:orders(id, total_amount)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter by region for delivery people (pending requests in their area)
      // Or show all for assigned deliveries
      const filteredData = (data || []).filter((req: any) => {
        // Show all requests assigned to this delivery person
        if (req.delivery_person_id === user.id) return true;
        
        // For pending requests, show only those in the same region
        if (req.status === 'pending' && profile.user_type === 'entregador') {
          return req.store?.neighborhood === profile.neighborhood && 
                 req.store?.state === profile.state;
        }
        
        return false;
      });

      setDeliveryRequests(filteredData as DeliveryRequest[]);
    } catch (error: any) {
      console.error('Error fetching delivery requests:', error);
      toast({
        title: "Erro ao carregar entregas",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const acceptDelivery = async (requestId: string) => {
    if (!user) return { error: 'Usuário não autenticado' };

    try {
      const { error } = await supabase
        .from('delivery_requests')
        .update({ 
          delivery_person_id: user.id,
          status: 'accepted'
        })
        .eq('id', requestId);

      if (error) throw error;

      // Update order status if there's an associated order
      const request = deliveryRequests.find(r => r.id === requestId);
      if (request?.order_id) {
        await supabase
          .from('orders')
          .update({ status: 'in_delivery' })
          .eq('id', request.order_id);
      }

      // Update local state
      setDeliveryRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, delivery_person_id: user.id, status: 'accepted' }
          : req
      ));

      return { error: null };
    } catch (error: any) {
      console.error('Error accepting delivery:', error);
      return { error: error.message };
    }
  };

  const updateDeliveryStatus = async (requestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('delivery_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;

      // Update order if completing delivery
      if (status === 'completed') {
        const request = deliveryRequests.find(r => r.id === requestId);
        if (request?.order_id) {
          await supabase
            .from('orders')
            .update({ status: 'completed' })
            .eq('id', request.order_id);
        }
      }

      setDeliveryRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status } : req
      ));

      return { error: null };
    } catch (error: any) {
      console.error('Error updating delivery status:', error);
      return { error: error.message };
    }
  };

  useEffect(() => {
    if (user && profile) {
      fetchDeliveryRequests();
    }
  }, [user, profile]);

  return {
    deliveryRequests,
    isLoading,
    acceptDelivery,
    updateDeliveryStatus,
    refetch: fetchDeliveryRequests
  };
}
