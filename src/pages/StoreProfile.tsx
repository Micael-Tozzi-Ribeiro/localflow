import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Heart, Store as StoreIcon, ImageIcon, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useStores } from '@/hooks/useStores';
import { useFavorites } from '@/hooks/useFavorites';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const StoreProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { stores, getStoreProducts, isLoading } = useStores();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addToCart } = useApp();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const store = stores.find(s => s.id === id);
  const storeProducts = getStoreProducts(id || '');
  const isStoreOwner = profile?.user_id === store?.owner_id;
  const storeFavorite = store ? isFavorite(store.id) : false;

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

  const handleToggleFavorite = async () => {
    if (!user) {
      toast({ title: "Faça login para favoritar", variant: "destructive" });
      return;
    }
    await toggleFavorite(store.id);
    toast({ title: storeFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos!" });
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
        {user && !isStoreOwner && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-4 right-4 bg-background/80 backdrop-blur-sm hover:bg-background",
              storeFavorite && "text-destructive"
            )}
            onClick={handleToggleFavorite}
          >
            <Heart className={cn("h-5 w-5", storeFavorite && "fill-current")} />
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
            
            {profile?.user_type === 'comerciante' && isStoreOwner && (
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
                  <div 
                    className="relative h-40 bg-muted cursor-pointer group"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
                      <span className="text-background opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium bg-foreground/70 px-3 py-1 rounded-full">
                        Ver detalhes
                      </span>
                    </div>
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
                      {user && !isStoreOwner && (
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

      {/* Product Detail Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedProduct?.image_url ? (
              <div className="w-full rounded-lg overflow-hidden bg-muted">
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-full h-auto max-h-[50vh] object-contain"
                />
              </div>
            ) : (
              <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
            
            <div className="space-y-3">
              <p className="text-2xl font-bold text-primary">
                {selectedProduct && Number(selectedProduct.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              
              {selectedProduct?.description && (
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Descrição</h4>
                  <p className="text-muted-foreground">{selectedProduct.description}</p>
                </div>
              )}
              
              {user && !isStoreOwner && (
                <Button 
                  className="w-full mt-4" 
                  onClick={() => {
                    handleAddToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                >
                  Adicionar ao Carrinho
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default StoreProfile;
