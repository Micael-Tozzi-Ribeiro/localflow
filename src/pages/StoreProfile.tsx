import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Heart, Truck } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/stores/ProductCard';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const StoreProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { stores, products, user, toggleFavorite, addDeliveryRequest } = useApp();
  const { toast } = useToast();

  const store = stores.find(s => s.id === id);
  const storeProducts = products.filter(p => p.storeId === id);
  const isFavorite = user?.favorites.includes(id || '');
  const isOwner = user?.id === store?.ownerId;

  if (!store) {
    return (
      <Layout>
        <div className="container px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Loja não encontrada</h2>
          <Link to="/lojas">
            <Button>Voltar para Lojas</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleRequestDelivery = () => {
    addDeliveryRequest({
      id: Date.now().toString(),
      storeId: store.id,
      storeName: store.name,
      status: 'pending',
      createdAt: new Date(),
    });
    toast({
      title: "Entregador solicitado!",
      description: "Entregadores da região foram notificados.",
    });
  };

  return (
    <Layout>
      {/* Banner */}
      <div className="relative h-48 md:h-64">
        <img
          src={store.banner}
          alt={`Banner ${store.name}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
        
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Favorite Button */}
        {user && !isOwner && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-4 right-4 bg-background/80 backdrop-blur-sm hover:bg-background",
              isFavorite && "text-destructive"
            )}
            onClick={() => toggleFavorite(store.id)}
          >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
          </Button>
        )}
      </div>

      {/* Store Info */}
      <div className="container px-4">
        <div className="relative -mt-12 md:-mt-16 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Logo */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-background shadow-xl">
              <img
                src={store.logo}
                alt={`Logo ${store.name}`}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Info */}
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
                  {store.name}
                </h1>
                <Badge variant="secondary" className="text-sm">{store.category}</Badge>
              </div>
              {store.description && (
                <p className="mt-2 text-muted-foreground">{store.description}</p>
              )}
            </div>
          </div>

          {/* Contact & Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-secondary" />
                {store.address} - {store.neighborhood}, {store.state}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4 text-secondary" />
                {store.phone}
              </p>
            </div>
            
            {user?.userType === 'comerciante' && isOwner && (
              <Button onClick={handleRequestDelivery} className="gap-2">
                <Truck className="h-4 w-4" />
                Solicitar Entregador
              </Button>
            )}
          </div>
        </div>

        {/* Products */}
        <section className="py-8 border-t border-border">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
            Produtos
          </h2>
          
          {storeProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {storeProducts.map((product, index) => (
                <div 
                  key={product.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ProductCard product={product} store={store} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-2xl">
              <p className="text-muted-foreground">Esta loja ainda não possui produtos cadastrados.</p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default StoreProfile;
