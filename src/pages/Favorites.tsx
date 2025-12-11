import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { StoreCard } from '@/components/stores/StoreCard';
import { useAuth } from '@/hooks/useAuth';
import { useStores } from '@/hooks/useStores';
import { useFavorites } from '@/hooks/useFavorites';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

const Favorites = () => {
  const { user } = useAuth();
  const { stores, isLoading: storesLoading } = useStores();
  const { favorites, isLoading: favoritesLoading } = useFavorites();
  
  const favoriteStores = stores.filter(s => favorites.includes(s.id));
  const isLoading = storesLoading || favoritesLoading;

  if (!user) {
    return (
      <Layout>
        <div className="container px-4 py-16 text-center">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Faça login para ver seus favoritos</h2>
          <Link to="/auth">
            <Button>Entrar</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container px-4 py-16 text-center">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-4 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
          <Heart className="h-8 w-8 inline-block mr-2 text-destructive" />
          Lojas Favoritas
        </h1>

        {favoriteStores.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteStores.map((store, index) => (
              <div 
                key={store.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <StoreCard store={{
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
                }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Nenhuma loja favorita</h2>
            <p className="text-muted-foreground mb-6">Explore as lojas e adicione aos favoritos!</p>
            <Link to="/lojas">
              <Button>Ver Lojas</Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Favorites;
