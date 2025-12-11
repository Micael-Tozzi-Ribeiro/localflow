import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useDeliveryRequests } from '@/hooks/useDeliveryRequests';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Truck, 
  Package, 
  Check, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  Store as StoreIcon,
  CheckCircle,
  XCircle,
  Loader2,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DeliveryPanel = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();
  const { deliveryRequests, isLoading, acceptDelivery, updateDeliveryStatus } = useDeliveryRequests();
  const { toast } = useToast();

  if (!authLoading && (!user || profile?.user_type !== 'entregador')) {
    navigate('/auth');
    return null;
  }

  const pendingDeliveries = deliveryRequests.filter(d => d.status === 'pending');
  const myDeliveries = deliveryRequests.filter(d => 
    d.delivery_person_id === user?.id && d.status !== 'pending'
  );

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAcceptDelivery = async (requestId: string) => {
    const { error } = await acceptDelivery(requestId);
    if (error) {
      toast({ title: "Erro", description: error, variant: "destructive" });
    } else {
      toast({ title: "Entrega aceita!", description: "Boa sorte na entrega!" });
    }
  };

  const handleCompleteDelivery = async (requestId: string) => {
    const { error } = await updateDeliveryStatus(requestId, 'completed');
    if (error) {
      toast({ title: "Erro", description: error, variant: "destructive" });
    } else {
      toast({ title: "Entrega concluída!" });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pendente', className: 'bg-yellow-500 text-white' },
      accepted: { label: 'Aceita', className: 'bg-blue-500 text-white' },
      in_progress: { label: 'Em Andamento', className: 'bg-secondary text-secondary-foreground' },
      completed: { label: 'Concluída', className: 'bg-green-500 text-white' }
    };

    const config = statusConfig[status] || { label: status, className: 'bg-muted' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="container px-4 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-4">Carregando entregas...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-4 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <Truck className="h-8 w-8 text-primary" />
              Painel de Entregas
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {profile?.neighborhood}, {profile?.state}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Available Deliveries */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-secondary" />
              Entregas Disponíveis
            </h2>
            {pendingDeliveries.length > 0 ? (
              <div className="space-y-4">
                {pendingDeliveries.map((delivery) => (
                  <Card key={delivery.id} className="animate-fade-in">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <StoreIcon className="h-5 w-5 text-primary" />
                          <CardTitle className="text-base">{delivery.store?.name}</CardTitle>
                        </div>
                        {getStatusBadge(delivery.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {formatDate(delivery.created_at)}
                        </div>
                        {delivery.order?.total_amount && (
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-foreground">
                              Valor: {formatPrice(delivery.order.total_amount)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {delivery.customer_address}
                        </div>
                      </div>

                      <div className="p-3 bg-primary/5 rounded-lg mb-4">
                        <p className="text-sm text-foreground">
                          A loja <strong>{delivery.store?.name}</strong> solicitou uma entrega
                          {delivery.order?.total_amount && (
                            <> no valor de <strong>{formatPrice(delivery.order.total_amount)}</strong></>
                          )}. Aceitar?
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1 gap-2"
                          onClick={() => handleAcceptDelivery(delivery.id)}
                        >
                          <Check className="h-4 w-4" />
                          Aceitar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-2xl">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhuma entrega disponível no momento</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Entregas da região {profile?.neighborhood} aparecerão aqui
                </p>
              </div>
            )}
          </div>

          {/* My Deliveries */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Minhas Entregas
            </h2>
            {myDeliveries.length > 0 ? (
              <div className="space-y-4">
                {myDeliveries.map((delivery) => (
                  <Card key={delivery.id} className="animate-fade-in">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <StoreIcon className="h-5 w-5 text-primary" />
                          <CardTitle className="text-base">{delivery.store?.name}</CardTitle>
                        </div>
                        {getStatusBadge(delivery.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">{delivery.customer_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">{delivery.customer_phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">{delivery.customer_address}</span>
                        </div>
                        {delivery.order?.total_amount && (
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-foreground">
                              {formatPrice(delivery.order.total_amount)}
                            </span>
                          </div>
                        )}
                      </div>

                      {delivery.status === 'accepted' && (
                        <Button
                          className="w-full gap-2"
                          onClick={() => handleCompleteDelivery(delivery.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Marcar como Entregue
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-2xl">
                <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Você ainda não aceitou nenhuma entrega</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DeliveryPanel;
