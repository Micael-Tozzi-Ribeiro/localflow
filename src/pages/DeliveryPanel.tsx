import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, Package, Check, Clock, MapPin, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DeliveryPanel = () => {
  const navigate = useNavigate();
  const { user, deliveryRequests, acceptDelivery, notifications, clearNotifications } = useApp();
  const { toast } = useToast();

  if (!user || user.userType !== 'entregador') {
    navigate('/auth');
    return null;
  }

  const pendingDeliveries = deliveryRequests.filter(d => d.status === 'pending');
  const myDeliveries = deliveryRequests.filter(d => d.deliveryPersonId === user.id);

  const handleAcceptDelivery = (requestId: string) => {
    acceptDelivery(requestId, user.id);
    toast({ title: "Entrega aceita!", description: "Boa sorte na entrega!" });
  };

  const statusLabels = {
    pending: { label: 'Pendente', color: 'bg-yellow-500' },
    accepted: { label: 'Aceita', color: 'bg-blue-500' },
    in_progress: { label: 'Em Andamento', color: 'bg-secondary' },
    completed: { label: 'Concluída', color: 'bg-green-500' },
  };

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
              {user.neighborhood}, {user.state}
            </p>
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="bg-secondary/10 border border-secondary rounded-2xl p-4 mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Bell className="h-5 w-5 text-secondary" />
                Notificações ({notifications.length})
              </h3>
              <Button variant="ghost" size="sm" onClick={clearNotifications}>
                Limpar
              </Button>
            </div>
            <div className="space-y-2">
              {notifications.map((notif, index) => (
                <div key={index} className="bg-card p-3 rounded-lg text-sm text-foreground">
                  {notif}
                </div>
              ))}
            </div>
          </div>
        )}

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
                  <div
                    key={delivery.id}
                    className="bg-card rounded-xl p-4 shadow-sm border border-border animate-fade-in"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-card-foreground">{delivery.storeName}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {new Date(delivery.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <Badge className={statusLabels[delivery.status].color}>
                        {statusLabels[delivery.status].label}
                      </Badge>
                    </div>
                    <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                      <p className="text-sm text-foreground">
                        A loja <strong>{delivery.storeName}</strong> tem um pedido disponível. Aceitar entrega?
                      </p>
                    </div>
                    <Button
                      className="w-full mt-4 gap-2"
                      onClick={() => handleAcceptDelivery(delivery.id)}
                    >
                      <Check className="h-4 w-4" />
                      Aceitar Entrega
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-2xl">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhuma entrega disponível no momento</p>
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
                  <div
                    key={delivery.id}
                    className="bg-card rounded-xl p-4 shadow-sm border border-border animate-fade-in"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-card-foreground">{delivery.storeName}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {new Date(delivery.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <Badge className={statusLabels[delivery.status].color}>
                        {statusLabels[delivery.status].label}
                      </Badge>
                    </div>
                  </div>
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
