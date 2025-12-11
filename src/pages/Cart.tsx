import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

const Cart = () => {
  const { cart, updateCartQuantity, removeFromCart, clearCart, user } = useApp();

  const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (!user) {
    return (
      <Layout>
        <div className="container px-4 py-16 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Faça login para ver seu carrinho</h2>
          <Link to="/auth">
            <Button>Entrar</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-4 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Carrinho</h1>

        {cart.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-card rounded-xl p-4 shadow-sm flex gap-4 animate-fade-in"
                >
                  <img
                    src={item.product.photo}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-card-foreground">{item.product.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.store.name}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <span className="font-bold text-primary">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" onClick={clearCart} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Carrinho
              </Button>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl p-6 shadow-md sticky top-24">
                <h2 className="font-semibold text-lg text-card-foreground mb-4">Resumo</h2>
                <div className="space-y-3 pb-4 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Entrega</span>
                    <span className="text-secondary">A calcular</span>
                  </div>
                </div>
                <div className="flex justify-between py-4">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-xl text-primary">{formatPrice(total)}</span>
                </div>
                <Button className="w-full gap-2">
                  Finalizar Pedido
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Seu carrinho está vazio</h2>
            <p className="text-muted-foreground mb-6">Explore as lojas e adicione produtos!</p>
            <Link to="/lojas">
              <Button>Ver Lojas</Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
