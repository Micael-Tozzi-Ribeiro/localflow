import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  Truck, 
  Store as StoreIcon,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  UserCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const MerchantOrders = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();
  const { orders, isLoading, updateOrderStatus, requestDelivery, deleteCompletedOrders, confirmPickup, refetchOrders } = useOrders();
  const { toast } = useToast();

  if (!authLoading && (!user || profile?.user_type !== 'comerciante')) {
    navigate('/auth');
    return null;
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string, deliveryRequest?: any) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Pendente', variant: 'default' },
      confirmed: { label: 'Confirmado', variant: 'secondary' },
      awaiting_delivery: { label: 'Aguardando Entrega', variant: 'outline' },
      in_delivery: { label: 'Em Entrega', variant: 'secondary' },
      completed: { label: 'Concluído', variant: 'default' },
      cancelled: { label: 'Cancelado', variant: 'destructive' }
    };

    // Check if delivery was accepted
    if (status === 'awaiting_delivery' && deliveryRequest?.status === 'accepted') {
      return <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/30">Entregador Aceitou</Badge>;
    }

    const config = statusConfig[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleConfirmOrder = async (orderId: string) => {
    const { error } = await updateOrderStatus(orderId, 'confirmed');
    if (error) {
      toast({ title: "Erro", description: error, variant: "destructive" });
    } else {
      toast({ title: "Pedido confirmado!" });
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const { error } = await updateOrderStatus(orderId, 'cancelled');
    if (error) {
      toast({ title: "Erro", description: error, variant: "destructive" });
    } else {
      toast({ title: "Pedido cancelado" });
    }
  };

  const handleRequestDelivery = async (order: any) => {
    if (!order.customer_address) {
      toast({ 
        title: "Erro", 
        description: "Endereço do cliente não informado", 
        variant: "destructive" 
      });
      return;
    }

    const { error } = await requestDelivery(
      order.id,
      order.store_id,
      order.store?.name || 'Loja',
      order.customer_address,
      order.customer_phone,
      order.customer_name,
      order.total_amount
    );

    if (error) {
      toast({ title: "Erro", description: error, variant: "destructive" });
    } else {
      toast({ 
        title: "Entrega solicitada!", 
        description: "Aguardando entregador aceitar" 
      });
      refetchOrders();
    }
  };

  const handleConfirmPickup = async (orderId: string) => {
    const { error } = await confirmPickup(orderId);
    if (error) {
      toast({ title: "Erro", description: error, variant: "destructive" });
    } else {
      toast({ title: "Retirada confirmada!", description: "Entregador saiu para entrega" });
      refetchOrders();
    }
  };

  const handleDeleteHistory = async () => {
    const { error } = await deleteCompletedOrders();
    if (error) {
      toast({ title: "Erro", description: error, variant: "destructive" });
    } else {
      toast({ title: "Histórico apagado!" });
    }
  };

  const completedOrdersCount = orders.filter(o => o.status === 'completed' || o.status === 'cancelled').length;

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="container px-4 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-4">Carregando pedidos...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-4 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Pedidos Recebidos</h1>
          </div>
          
          {completedOrdersCount > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                  Apagar Histórico ({completedOrdersCount})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apagar histórico de pedidos?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Isso irá apagar {completedOrdersCount} pedido(s) concluído(s) ou cancelado(s). Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteHistory} className="bg-destructive hover:bg-destructive/90">
                    Apagar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <StoreIcon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{order.store?.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.status, order.delivery_request)}
                      <Badge variant={order.delivery_type === 'delivery' ? 'secondary' : 'outline'}>
                        {order.delivery_type === 'delivery' ? (
                          <><Truck className="h-3 w-3 mr-1" /> Entrega</>
                        ) : (
                          <><StoreIcon className="h-3 w-3 mr-1" /> Retirada</>
                        )}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {/* Customer Info */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{order.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{order.customer_phone}</span>
                    </div>
                    {order.customer_address && (
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{order.customer_address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{formatDate(order.created_at)}</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2 mb-4">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Itens do Pedido</h4>
                    <div className="divide-y divide-border">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex justify-between py-2">
                          <span className="text-foreground">
                            {item.quantity}x {item.product_name}
                          </span>
                          <span className="font-medium text-foreground">{formatPrice(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-bold text-foreground">Total</span>
                      <span className="font-bold text-xl text-primary">{formatPrice(order.total_amount)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                    {order.status === 'pending' && (
                      <>
                        <Button onClick={() => handleConfirmOrder(order.id)} className="gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Confirmar Pedido
                        </Button>
                        <Button variant="destructive" onClick={() => handleCancelOrder(order.id)} className="gap-2">
                          <XCircle className="h-4 w-4" />
                          Cancelar
                        </Button>
                      </>
                    )}
                    {order.status === 'confirmed' && order.delivery_type === 'delivery' && (
                      <Button onClick={() => handleRequestDelivery(order)} className="gap-2" variant="secondary">
                        <Truck className="h-4 w-4" />
                        Solicitar Entregador
                      </Button>
                    )}
                    {order.status === 'confirmed' && order.delivery_type === 'pickup' && (
                      <Button onClick={() => updateOrderStatus(order.id, 'completed')} className="gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Cliente Retirou
                      </Button>
                    )}
                    {order.status === 'awaiting_delivery' && order.delivery_request?.status === 'pending' && (
                      <Badge variant="outline" className="py-2 px-4">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Aguardando entregador aceitar
                      </Badge>
                    )}
                    {order.status === 'awaiting_delivery' && order.delivery_request?.status === 'accepted' && order.delivery_request?.delivery_person && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
                        <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg flex-1">
                          <UserCheck className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {order.delivery_request.delivery_person.name} aceitou a entrega
                            </p>
                            <p className="text-xs text-muted-foreground">Está indo retirar o pedido na loja</p>
                          </div>
                        </div>
                        <Button onClick={() => handleConfirmPickup(order.id)} className="gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Confirmar Retirada
                        </Button>
                      </div>
                    )}
                    {order.status === 'in_delivery' && (
                      <Badge variant="secondary" className="py-2 px-4 bg-blue-500/10 text-blue-600 border-blue-500/30">
                        <Truck className="h-4 w-4 mr-2" />
                        Pedido saiu para entrega
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-muted/30 rounded-2xl">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Nenhum pedido ainda</h2>
            <p className="text-muted-foreground">Quando clientes fizerem pedidos nas suas lojas, eles aparecerão aqui.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MerchantOrders;
