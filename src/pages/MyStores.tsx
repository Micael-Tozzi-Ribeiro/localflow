import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Store, Plus, Edit, Package, Image, Truck } from 'lucide-react';
import { STORE_CATEGORIES, Product } from '@/types';
import { useToast } from '@/hooks/use-toast';

const MyStores = () => {
  const navigate = useNavigate();
  const { user, stores, setStores, products, setProducts, addDeliveryRequest } = useApp();
  const { toast } = useToast();
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const [storeForm, setStoreForm] = useState({
    name: '',
    category: '',
    phone: '',
    address: '',
    description: '',
    logo: '',
    banner: '',
  });

  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    photo: '',
  });

  if (!user || user.userType !== 'comerciante') {
    navigate('/auth');
    return null;
  }

  const myStores = stores.filter(s => s.ownerId === user.id);

  const handleCreateStore = () => {
    const newStore = {
      id: Date.now().toString(),
      ownerId: user.id,
      name: storeForm.name,
      category: storeForm.category,
      phone: storeForm.phone,
      address: storeForm.address,
      description: storeForm.description,
      logo: storeForm.logo || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100&h=100&fit=crop',
      banner: storeForm.banner || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=300&fit=crop',
      state: user.state,
      neighborhood: user.neighborhood,
    };
    
    setStores(prev => [...prev, newStore]);
    setIsStoreDialogOpen(false);
    setStoreForm({ name: '', category: '', phone: '', address: '', description: '', logo: '', banner: '' });
    toast({ title: "Loja criada com sucesso!" });
  };

  const handleCreateProduct = () => {
    if (!selectedStoreId) return;
    
    const newProduct: Product = {
      id: Date.now().toString(),
      storeId: selectedStoreId,
      name: productForm.name,
      price: parseFloat(productForm.price),
      description: productForm.description,
      photo: productForm.photo || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop',
    };
    
    setProducts(prev => [...prev, newProduct]);
    setIsProductDialogOpen(false);
    setProductForm({ name: '', price: '', description: '', photo: '' });
    toast({ title: "Produto adicionado com sucesso!" });
  };

  const handleRequestDelivery = (storeId: string, storeName: string) => {
    addDeliveryRequest({
      id: Date.now().toString(),
      storeId,
      storeName,
      status: 'pending',
      createdAt: new Date(),
    });
    toast({
      title: "Entregador solicitado!",
      description: "Entregadores da região foram notificados.",
    });
  };

  const getStoreProducts = (storeId: string) => products.filter(p => p.storeId === storeId);

  return (
    <Layout>
      <div className="container px-4 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Minhas Lojas</h1>
            <p className="text-muted-foreground mt-1">Gerencie suas lojas e produtos</p>
          </div>
          
          <Dialog open={isStoreDialogOpen} onOpenChange={setIsStoreDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Cadastrar Loja
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Loja</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome da Loja</Label>
                  <Input
                    placeholder="Minha Loja"
                    value={storeForm.name}
                    onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={storeForm.category}
                    onValueChange={(value) => setStoreForm({ ...storeForm, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {STORE_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    placeholder="(11) 99999-9999"
                    value={storeForm.phone}
                    onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <Input
                    placeholder="Rua das Flores, 123"
                    value={storeForm.address}
                    onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição (opcional)</Label>
                  <Textarea
                    placeholder="Conte um pouco sobre sua loja..."
                    value={storeForm.description}
                    onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL do Logo (opcional)</Label>
                  <Input
                    placeholder="https://..."
                    value={storeForm.logo}
                    onChange={(e) => setStoreForm({ ...storeForm, logo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL do Banner (opcional)</Label>
                  <Input
                    placeholder="https://..."
                    value={storeForm.banner}
                    onChange={(e) => setStoreForm({ ...storeForm, banner: e.target.value })}
                  />
                </div>
                <Button onClick={handleCreateStore} className="w-full">Criar Loja</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {myStores.length > 0 ? (
          <div className="space-y-6">
            {myStores.map((store) => (
              <div key={store.id} className="bg-card rounded-2xl shadow-md overflow-hidden animate-fade-in">
                {/* Store Header */}
                <div className="relative h-32">
                  <img src={store.banner} alt={store.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                </div>
                
                <div className="p-6">
                  <div className="flex items-start gap-4 -mt-16 relative">
                    <img
                      src={store.logo}
                      alt={store.name}
                      className="w-20 h-20 rounded-xl border-4 border-background object-cover shadow-lg"
                    />
                    <div className="pt-10 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h2 className="text-xl font-bold text-card-foreground">{store.name}</h2>
                        <div className="flex gap-2">
                          <Link to={`/loja/${store.id}`}>
                            <Button variant="outline" size="sm" className="gap-1">
                              <Edit className="h-4 w-4" />
                              Ver Loja
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleRequestDelivery(store.id, store.name)}
                          >
                            <Truck className="h-4 w-4" />
                            Entregador
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{store.category} • {store.address}</p>
                    </div>
                  </div>

                  {/* Products Section */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-card-foreground flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Produtos ({getStoreProducts(store.id).length})
                      </h3>
                      <Dialog open={isProductDialogOpen && selectedStoreId === store.id} onOpenChange={(open) => {
                        setIsProductDialogOpen(open);
                        if (open) setSelectedStoreId(store.id);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="secondary" size="sm" className="gap-1">
                            <Plus className="h-4 w-4" />
                            Produto
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Novo Produto</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Nome do Produto</Label>
                              <Input
                                placeholder="Produto X"
                                value={productForm.name}
                                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Preço (R$)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="29.90"
                                value={productForm.price}
                                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Descrição</Label>
                              <Textarea
                                placeholder="Descrição do produto..."
                                value={productForm.description}
                                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>URL da Foto (opcional)</Label>
                              <Input
                                placeholder="https://..."
                                value={productForm.photo}
                                onChange={(e) => setProductForm({ ...productForm, photo: e.target.value })}
                              />
                            </div>
                            <Button onClick={handleCreateProduct} className="w-full">Adicionar Produto</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {getStoreProducts(store.id).length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {getStoreProducts(store.id).map((product) => (
                          <div key={product.id} className="bg-muted/30 rounded-lg p-3">
                            <img
                              src={product.photo}
                              alt={product.name}
                              className="w-full h-20 object-cover rounded-md mb-2"
                            />
                            <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                            <p className="text-sm text-primary font-semibold">
                              {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">Nenhum produto cadastrado</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-muted/30 rounded-2xl">
            <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Você ainda não tem lojas</h2>
            <p className="text-muted-foreground mb-6">Cadastre sua primeira loja e comece a vender!</p>
            <Button onClick={() => setIsStoreDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Loja
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyStores;
