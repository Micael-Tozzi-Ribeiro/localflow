import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Heart, Truck, Store as StoreIcon, ImageIcon } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useStores } from '@/hooks/useStores';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const StoreProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { stores, getStoreProducts, isLoading } = useStores();
  const { toggleFavorite, addToCart } = useApp();
  const { toast } = useToast();

  const store = stores.find(s => s.id === id);
  const storeProducts = getStoreProducts(id || '');
  const isFavorite = false; // TODO: Implement from database
  const isOwner = profile?.user_id === store?.owner_id;

  if (isLoading) {
    return (
      <Layout>
        <div className="container px-4 py-16 text-center">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </Layout>
    );
  }

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

  const handleAddToCart = (product: any) => {
    const legacyStore = {
      id: store.id,
      ownerId: store.owner_id,
      name: store.name,
      category: store.category,
      description: store.description || '',
      phone: store.phone,
      address: store.address,
      state: store.state,
      neighborhood: store.neighborhood,
      logo: store.logo_url || '',
      banner: store.banner_url || '',
    };

    const legacyProduct = {
      id: product.id,
      storeId: product.store_id,
      name: product.name,
      price: Number(product.price),
      description: product.description || '',
      photo: product.image_url || '',
    };

    addToCart(legacyProduct, legacyStore);
    toast({ title: "Produto adicionado ao carrinho!" });
  };

  return (
    <Layout>
      {/* Banner */}
      <div className="relative h-48 md:h-64">
        {store.banner_url ? (
          <img
            src={store.banner_url}
            alt={`Banner ${store.name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-secondary/20" />
        )}
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
              {store.logo_url ? (
                <img
                  src={store.logo_url}
                  alt={`Logo ${store.name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <StoreIcon className="h-10 w-10 text-primary" />
                </div>
              )}
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
            
            {profile?.user_type === 'comerciante' && isOwner && (
              <Link to="/minhas-lojas">
                <Button className="gap-2">
                  <StoreIcon className="h-4 w-4" />
                  Gerenciar Loja
                </Button>
              </Link>
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
                  className="animate-fade-in-up bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative h-40 bg-muted">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-card-foreground">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-primary">
                        {Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                      {user && !isOwner && (
                        <Button size="sm" onClick={() => handleAddToCart(product)}>
                          Adicionar
                        </Button>
                      )}
                    </div>
                  </div>
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
