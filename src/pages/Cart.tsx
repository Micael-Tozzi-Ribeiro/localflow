import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Store, Truck, MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StoreDeliveryChoice {
  [storeId: string]: 'pickup' | 'delivery';
}

const Cart = () => {
  const { cart, updateCartQuantity, removeFromCart, clearCart } = useApp();
  const { user, profile } = useAuth();
  const { createOrder } = useOrders();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [deliveryChoices, setDeliveryChoices] = useState<StoreDeliveryChoice>({});
  const [customerAddress, setCustomerAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Group items by store
  const itemsByStore = cart.reduce((acc, item) => {
    const storeId = item.store.id;
    if (!acc[storeId]) {
      acc[storeId] = {
        store: item.store,
        items: []
      };
    }
    acc[storeId].items.push(item);
    return acc;
  }, {} as Record<string, { store: typeof cart[0]['store']; items: typeof cart }>);

  const storeIds = Object.keys(itemsByStore);

  // Calculate totals
  const storeTotals = storeIds.reduce((acc, storeId) => {
    acc[storeId] = itemsByStore[storeId].items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    return acc;
  }, {} as Record<string, number>);

  const grandTotal = Object.values(storeTotals).reduce((sum, total) => sum + total, 0);

  // Check if any store needs delivery
  const needsAddress = Object.values(deliveryChoices).some(choice => choice === 'delivery');

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleDeliveryChoice = (storeId: string, choice: 'pickup' | 'delivery') => {
    setDeliveryChoices(prev => ({ ...prev, [storeId]: choice }));
  };

  const handleFinishOrder = async () => {
    if (!user || !profile) {
      toast({ title: "Erro", description: "Faça login para finalizar o pedido", variant: "destructive" });
      navigate('/auth');
      return;
    }

    // Validate all stores have delivery choice
    const missingChoices = storeIds.filter(id => !deliveryChoices[id]);
    if (missingChoices.length > 0) {
      toast({ 
        title: "Escolha a forma de recebimento", 
        description: "Selecione retirar ou entregar para todas as lojas",
        variant: "destructive"
      });
      return;
    }

    // Validate address if any delivery
    if (needsAddress && !customerAddress.trim()) {
      toast({ 
        title: "Endereço necessário", 
        description: "Informe seu endereço para entrega",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create one order per store
      for (const storeId of storeIds) {
        const storeData = itemsByStore[storeId];
        const items = storeData.items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          productPrice: item.product.price,
          quantity: item.quantity
        }));

        const { error } = await createOrder(
          storeId,
          items,
          deliveryChoices[storeId],
          profile.name,
          profile.phone || '',
          deliveryChoices[storeId] === 'delivery' ? customerAddress : undefined
        );

        if (error) {
          throw new Error(error);
        }
      }

      clearCart();
      toast({ 
        title: "Pedidos enviados!", 
        description: `${storeIds.length} pedido(s) criado(s) com sucesso`
      });
      navigate('/conta');
    } catch (error: any) {
      toast({ 
        title: "Erro ao finalizar pedido", 
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
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
            {/* Items grouped by store */}
            <div className="lg:col-span-2 space-y-6">
              {storeIds.map((storeId) => {
                const { store, items } = itemsByStore[storeId];
                const storeTotal = storeTotals[storeId];
                const deliveryChoice = deliveryChoices[storeId] || '';

                return (
                  <div key={storeId} className="bg-card rounded-2xl shadow-sm overflow-hidden">
                    {/* Store Header */}
                    <div className="bg-muted/30 p-4 border-b border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Store className="h-5 w-5 text-primary" />
                          <h2 className="font-semibold text-card-foreground">{store.name}</h2>
                        </div>
                        <span className="font-bold text-primary">{formatPrice(storeTotal)}</span>
                      </div>
                    </div>

                    {/* Store Items */}
                    <div className="p-4 space-y-4">
                      {items.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex gap-4 animate-fade-in"
                        >
                          <img
                            src={item.product.photo}
                            alt={item.product.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-medium text-card-foreground text-sm">{item.product.name}</h3>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => removeFromCart(item.product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <span className="font-semibold text-primary text-sm">
                                {formatPrice(item.product.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Choice */}
                    <div className="p-4 border-t border-border bg-muted/20">
                      <Label className="text-sm font-medium text-foreground mb-3 block">
                        Como deseja receber desta loja?
                      </Label>
                      <RadioGroup
                        value={deliveryChoice}
                        onValueChange={(value) => handleDeliveryChoice(storeId, value as 'pickup' | 'delivery')}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pickup" id={`pickup-${storeId}`} />
                          <Label htmlFor={`pickup-${storeId}`} className="flex items-center gap-2 cursor-pointer">
                            <Store className="h-4 w-4 text-muted-foreground" />
                            Retirar na loja
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="delivery" id={`delivery-${storeId}`} />
                          <Label htmlFor={`delivery-${storeId}`} className="flex items-center gap-2 cursor-pointer">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            Quero que entregue
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                );
              })}

              {/* Address input if any delivery */}
              {needsAddress && (
                <div className="bg-card rounded-2xl p-4 shadow-sm animate-fade-in">
                  <Label className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Endereço para entrega
                  </Label>
                  <Input
                    placeholder="Rua, número, complemento, bairro..."
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="mt-2"
                  />
                </div>
              )}
              
              <Button variant="outline" onClick={clearCart} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Carrinho
              </Button>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl p-6 shadow-md sticky top-24">
                <h2 className="font-semibold text-lg text-card-foreground mb-4">Resumo do Pedido</h2>
                
                {/* Per-store totals */}
                <div className="space-y-3 pb-4 border-b border-border">
                  {storeIds.map((storeId) => (
                    <div key={storeId} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate max-w-[60%]">
                        {itemsByStore[storeId].store.name}
                      </span>
                      <span className="text-foreground font-medium">{formatPrice(storeTotals[storeId])}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between py-4">
                  <span className="font-semibold text-foreground">Total Geral</span>
                  <span className="font-bold text-xl text-primary">{formatPrice(grandTotal)}</span>
                </div>

                <Button 
                  className="w-full gap-2" 
                  onClick={handleFinishOrder}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      Finalizar Pedido
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                {storeIds.length > 1 && (
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Serão criados {storeIds.length} pedidos separados, um para cada loja.
                  </p>
                )}
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
