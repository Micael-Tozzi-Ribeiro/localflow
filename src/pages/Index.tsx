import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Store, Truck, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { StoreCard } from '@/components/stores/StoreCard';
import { useApp } from '@/contexts/AppContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Store as StoreType } from '@/types';
import heroImage from '@/assets/hero-localflow.jpg';

const Index = () => {
  const { user } = useApp();
  const [featuredStores, setFeaturedStores] = useState<StoreType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedStores = async () => {
      setIsLoading(true);
      try {
        // Build the query to get stores with their favorite counts
        let query = supabase
          .from('stores')
          .select(`
            *,
            favorites:favorites(count)
          `);

        // Filter by user's region if logged in
        if (user) {
          query = query
            .eq('state', user.state)
            .eq('neighborhood', user.neighborhood);
        }

        const { data: storesData, error } = await query;

        if (error) {
          console.error('Error fetching stores:', error);
          setFeaturedStores([]);
          return;
        }

        // Sort by favorite count and take top 4
        const sortedStores = (storesData || [])
          .map(store => ({
            ...store,
            favoriteCount: store.favorites?.[0]?.count || 0
          }))
          .sort((a, b) => b.favoriteCount - a.favoriteCount)
          .slice(0, 4)
          .map(store => ({
            id: store.id,
            name: store.name,
            category: store.category,
            address: store.address,
            phone: store.phone,
            description: store.description || undefined,
            logo: store.logo_url || '',
            banner: store.banner_url || '',
            ownerId: store.owner_id,
            state: store.state,
            neighborhood: store.neighborhood,
          }));

        setFeaturedStores(sortedStores);
      } catch (error) {
        console.error('Error:', error);
        setFeaturedStores([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedStores();
  }, [user]);

  const features = [
    {
      icon: Users,
      title: 'Para Moradores',
      description: 'Descubra lojas do seu bairro, encontre produtos locais e apoie a comunidade.',
    },
    {
      icon: Store,
      title: 'Para Comerciantes',
      description: 'Cadastre sua loja, alcance mais clientes e gerencie seus produtos facilmente.',
    },
    {
      icon: Truck,
      title: 'Para Entregadores',
      description: 'Receba notificações de pedidos próximos e aumente sua renda.',
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Comunidade LocalFlow" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 gradient-hero opacity-90" />
        </div>
        
        <div className="relative container px-4 py-20 md:py-32">
          <div className="max-w-2xl text-background">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight animate-fade-in">
              Seu bairro, mais <span className="text-secondary">conectado</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl opacity-90 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              O LocalFlow conecta moradores, comerciantes e entregadores para fortalecer 
              a economia do seu bairro. Descubra o melhor da sua vizinhança!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Link to="/lojas">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto gap-2 font-semibold shadow-turquoise">
                  Explorar Lojas
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto bg-background/20 backdrop-blur-sm border border-background/30 text-background hover:bg-background/30">
                  Cadastre-se Grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Como funciona o <span className="text-primary">LocalFlow</span>?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Uma plataforma feita para todos do bairro se conectarem e prosperarem juntos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="bg-card p-8 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stores Preview Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Lojas em Destaque
              </h2>
              <p className="mt-2 text-muted-foreground">
                {user ? 'Lojas do seu bairro' : 'Descubra lojas incríveis perto de você'}
              </p>
            </div>
            <Link to="/lojas">
              <Button variant="outline" className="gap-2">
                Ver Todas
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-card rounded-2xl overflow-hidden shadow-md animate-pulse">
                  <div className="h-32 bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredStores.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredStores.map((store, index) => (
                <div key={store.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <StoreCard store={store} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-2xl">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {user ? 'Nenhuma loja na sua região ainda' : 'Faça login para ver lojas da sua região'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {user ? 'Seja o primeiro a cadastrar sua loja!' : 'Cadastre-se para descobrir lojas do seu bairro'}
              </p>
              <Link to="/auth">
                <Button>{user ? 'Cadastrar Loja' : 'Entrar / Cadastrar'}</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 gradient-primary">
        <div className="container px-4 text-center">
          <Sparkles className="h-12 w-12 text-secondary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground max-w-2xl mx-auto">
            Pronto para transformar seu bairro?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-xl mx-auto">
            Junte-se a milhares de pessoas que já estão fortalecendo sua comunidade local.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="mt-8 font-semibold">
              Começar Agora - É Grátis!
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
