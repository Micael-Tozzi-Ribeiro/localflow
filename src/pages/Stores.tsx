import { useState, useMemo } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { StoreCard } from '@/components/stores/StoreCard';
import { useApp } from '@/contexts/AppContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Stores = () => {
  const { stores, user } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter stores based on user's region
  const regionalStores = user 
    ? stores.filter(s => s.state === user.state && s.neighborhood === user.neighborhood)
    : stores;

  // Get unique categories from regional stores
  const categories = useMemo(() => {
    const cats = [...new Set(regionalStores.map(s => s.category))];
    return cats.sort();
  }, [regionalStores]);

  // Apply search and category filters
  const filteredStores = useMemo(() => {
    return regionalStores.filter(store => {
      const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           store.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           store.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || store.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [regionalStores, searchQuery, selectedCategory]);

  return (
    <Layout>
      {/* Header */}
      <section className="py-12 md:py-16 gradient-primary">
        <div className="container px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary-foreground text-center animate-fade-in">
            Lojas do Bairro
          </h1>
          {user && (
            <p className="mt-3 text-center text-primary-foreground/80 flex items-center justify-center gap-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <MapPin className="h-4 w-4" />
              {user.neighborhood}, {user.state}
            </p>
          )}
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 border-b border-border bg-card sticky top-16 z-40">
        <div className="container px-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, categoria ou endereço..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-56">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Stores Grid */}
      <section className="py-8 md:py-12">
        <div className="container px-4">
          {filteredStores.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                {filteredStores.length} loja{filteredStores.length !== 1 ? 's' : ''} encontrada{filteredStores.length !== 1 ? 's' : ''}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStores.map((store, index) => (
                  <div 
                    key={store.id} 
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <StoreCard store={store} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Nenhuma loja encontrada</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {user 
                  ? 'Não encontramos lojas correspondentes à sua busca no seu bairro. Tente outros filtros.'
                  : 'Faça login para ver as lojas do seu bairro ou explore nossa plataforma.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Stores;
