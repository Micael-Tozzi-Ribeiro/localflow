import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Phone,
  MapPin,
  Store,
  MessageCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

interface DeliveryInfo {
  id: string;
  status: string;
  delivery_person_id: string | null;
  delivery_person_name?: string;
  delivery_person_phone?: string;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  delivery_type: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  notes: string | null;
  created_at: string;
  store_id: string;
  store_name: string;
  store_phone: string;
  items: OrderItem[];
  delivery?: DeliveryInfo;
}

export default function MyOrders() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Fetch orders for the current user
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setIsLoading(false);
        return;
      }

      // Get store IDs
      const storeIds = [...new Set(ordersData.map(o => o.store_id))];
      
      // Fetch stores
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('id, name, phone')
        .in('id', storeIds);

      if (storesError) throw storesError;

      const storesMap = new Map(storesData?.map(s => [s.id, s]) || []);

      // Fetch order items
      const orderIds = ordersData.map(o => o.id);
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      if (itemsError) throw itemsError;

      // Fetch delivery requests
      const { data: deliveryData, error: deliveryError } = await supabase
        .from('delivery_requests')
        .select('*')
        .in('order_id', orderIds);

      if (deliveryError) throw deliveryError;

      // Fetch delivery person profiles
      const deliveryPersonIds = deliveryData
        ?.filter(d => d.delivery_person_id)
        .map(d => d.delivery_person_id) || [];

      let deliveryPersonsMap = new Map();
      if (deliveryPersonIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, name, phone')
          .in('user_id', deliveryPersonIds);

        deliveryPersonsMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
      }

      // Build orders with all data
      const enrichedOrders: Order[] = ordersData.map(order => {
        const store = storesMap.get(order.store_id);
        const items = itemsData?.filter(i => i.order_id === order.id) || [];
        const delivery = deliveryData?.find(d => d.order_id === order.id);
        const deliveryPerson = delivery?.delivery_person_id 
          ? deliveryPersonsMap.get(delivery.delivery_person_id) 
          : null;

        return {
          id: order.id,
          status: order.status,
          total_amount: order.total_amount,
          delivery_type: order.delivery_type,
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          customer_address: order.customer_address,
          notes: order.notes,
          created_at: order.created_at,
          store_id: order.store_id,
          store_name: store?.name || 'Loja',
          store_phone: store?.phone || '',
          items,
          delivery: delivery ? {
            id: delivery.id,
            status: delivery.status,
            delivery_person_id: delivery.delivery_person_id,
            delivery_person_name: deliveryPerson?.name,
            delivery_person_phone: deliveryPerson?.phone,
          } : undefined,
        };
      });

      setOrders(enrichedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Erro ao carregar pedidos",
        description: "Não foi possível carregar seus pedidos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (order: Order) => {
    const { status, delivery_type, delivery } = order;

    if (status === 'cancelled') {
      return <Badge variant="destructive">Cancelado</Badge>;
    }
    if (status === 'completed') {
      return <Badge className="bg-green-600">Entregue</Badge>;
    }
    if (status === 'in_delivery') {
      return <Badge className="bg-blue-600">Em entrega</Badge>;
    }
    if (status === 'awaiting_delivery') {
      if (delivery?.delivery_person_id) {
        return <Badge className="bg-blue-500">Entregador a caminho da loja</Badge>;
      }
      return <Badge variant="secondary">Aguardando entregador</Badge>;
    }
    if (status === 'confirmed') {
      return <Badge className="bg-amber-600">Preparando</Badge>;
    }
    return <Badge variant="outline">Pendente</Badge>;
  };

  const getStatusMessage = (order: Order) => {
    const { status, delivery_type, delivery, store_name } = order;

    if (status === 'cancelled') {
      return (
        <div className="flex items-center gap-2 text-destructive">
          <XCircle className="h-5 w-5" />
          <span>Seu pedido foi cancelado pela loja <strong>{store_name}</strong></span>
        </div>
      );
    }

    if (status === 'completed') {
      if (delivery?.delivery_person_name) {
        return (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span>Pedido entregue por <strong>{delivery.delivery_person_name}</strong></span>
          </div>
        );
      }
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span>Pedido finalizado</span>
        </div>
      );
    }

    if (status === 'in_delivery' && delivery?.delivery_person_name) {
      return (
        <div className="flex items-center gap-2 text-blue-600">
          <Truck className="h-5 w-5" />
          <span><strong>{delivery.delivery_person_name}</strong> está a caminho com seu pedido</span>
        </div>
      );
    }

    if (status === 'awaiting_delivery') {
      if (delivery?.delivery_person_name) {
        return (
          <div className="flex items-center gap-2 text-blue-500">
            <Truck className="h-5 w-5" />
            <span><strong>{delivery.delivery_person_name}</strong> aceitou a entrega e está indo até a loja</span>
          </div>
        );
      }
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-5 w-5" />
          <span>Aguardando um entregador aceitar a corrida</span>
        </div>
      );
    }

    if (status === 'confirmed') {
      return (
        <div className="flex items-center gap-2 text-amber-600">
          <Store className="h-5 w-5" />
          <span><strong>{store_name}</strong> confirmou seu pedido e ele está sendo preparado</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="h-5 w-5" />
        <span>Aguardando confirmação da loja <strong>{store_name}</strong></span>
      </div>
    );
  };

  const openWhatsApp = (phone: string, message?: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const url = message 
      ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/${formattedPhone}`;
    window.open(url, '_blank');
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="container py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Package className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Meus Pedidos</h1>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-48 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Nenhum pedido encontrado</h2>
                <p className="text-muted-foreground mb-6">
                  Você ainda não fez nenhum pedido.
                </p>
                <Button onClick={() => navigate('/lojas')}>
                  Explorar Lojas
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        {order.store_name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(order)}
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Status Message */}
                    <div className="p-4 bg-muted/50 rounded-lg">
                      {getStatusMessage(order)}
                    </div>

                    {/* Delivery Person Contact */}
                    {order.delivery?.delivery_person_id && order.delivery.delivery_person_phone && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => openWhatsApp(
                            order.delivery!.delivery_person_phone!,
                            `Olá ${order.delivery!.delivery_person_name}, sou ${order.customer_name} e gostaria de saber sobre meu pedido.`
                          )}
                        >
                          <MessageCircle className="h-4 w-4" />
                          Falar com {order.delivery.delivery_person_name}
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 inline mr-1" />
                          {order.delivery.delivery_person_phone}
                        </span>
                      </div>
                    )}

                    {/* Store Contact */}
                    {order.store_phone && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 text-muted-foreground hover:text-foreground"
                          onClick={() => openWhatsApp(
                            order.store_phone,
                            `Olá, sou ${order.customer_name} e gostaria de informações sobre meu pedido.`
                          )}
                        >
                          <Phone className="h-4 w-4" />
                          Falar com a loja: {order.store_phone}
                        </Button>
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Itens do pedido:</h4>
                      <div className="bg-background border rounded-lg divide-y">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-3">
                            <div>
                              <span className="font-medium">{item.quantity}x</span>{' '}
                              <span>{item.product_name}</span>
                            </div>
                            <span className="text-muted-foreground">
                              R$ {item.subtotal.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {order.delivery_type === 'delivery' ? (
                            <>
                              <Truck className="h-4 w-4" />
                              Entrega
                            </>
                          ) : (
                            <>
                              <Store className="h-4 w-4" />
                              Retirada
                            </>
                          )}
                        </span>
                        {order.customer_address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {order.customer_address}
                          </span>
                        )}
                      </div>
                      <div className="text-lg font-bold text-primary">
                        Total: R$ {order.total_amount.toFixed(2)}
                      </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                        <strong>Observações:</strong> {order.notes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
