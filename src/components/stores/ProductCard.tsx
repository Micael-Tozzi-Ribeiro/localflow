import { Plus, ShoppingCart } from 'lucide-react';
import { Product, Store } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
  store: Store;
}

export function ProductCard({ product, store }: ProductCardProps) {
  const { user, addToCart } = useApp();
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para adicionar ao carrinho.",
        variant: "destructive",
      });
      return;
    }
    addToCart(product, store);
    toast({
      title: "Adicionado!",
      description: `${product.name} foi adicionado ao carrinho.`,
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border">
      <div className="relative h-40 overflow-hidden">
        <img
          src={product.photo}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-card-foreground">{product.name}</h4>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-4">
          <span className="font-bold text-lg text-primary">
            {formatPrice(product.price)}
          </span>
          <Button size="sm" onClick={handleAddToCart} className="gap-1">
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  );
}
