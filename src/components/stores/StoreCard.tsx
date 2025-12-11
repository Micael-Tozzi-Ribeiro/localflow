import { Link } from 'react-router-dom';
import { Heart, MapPin, Phone } from 'lucide-react';
import { Store } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StoreCardProps {
  store: Store;
}

export function StoreCard({ store }: StoreCardProps) {
  const { user, toggleFavorite } = useApp();
  const isFavorite = user?.favorites.includes(store.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      toggleFavorite(store.id);
    }
  };

  return (
    <Link to={`/loja/${store.id}`} className="group block">
      <div className="relative bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {/* Banner */}
        <div className="relative h-36 overflow-hidden">
          <img
            src={store.banner}
            alt={`Banner ${store.name}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
          
          {/* Favorite Button */}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute top-3 right-3 h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background",
                isFavorite && "text-destructive"
              )}
              onClick={handleFavoriteClick}
            >
              <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
            </Button>
          )}
        </div>

        {/* Logo + Info */}
        <div className="relative px-4 pb-4">
          {/* Logo */}
          <div className="absolute -top-8 left-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden border-4 border-background shadow-lg">
              <img
                src={store.logo}
                alt={`Logo ${store.name}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="pt-10">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-lg text-card-foreground group-hover:text-primary transition-colors">
                {store.name}
              </h3>
              <Badge variant="secondary" className="shrink-0">
                {store.category}
              </Badge>
            </div>
            
            <div className="mt-2 space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-secondary" />
                {store.address}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
