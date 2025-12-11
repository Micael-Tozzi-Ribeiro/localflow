import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useStores } from '@/hooks/useStores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Store, Plus, Edit, Package, Upload, Truck, ImageIcon } from 'lucide-react';
import { STORE_CATEGORIES } from '@/types';
import { useToast } from '@/hooks/use-toast';

const MyStores = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();
  const { getMyStores, getStoreProducts, createStore, createProduct, isLoading: storesLoading } = useStores();
  const { toast } = useToast();
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const productImageRef = useRef<HTMLInputElement>(null);

  const [storeForm, setStoreForm] = useState({
    name: '',
    category: '',
    phone: '',
    address: '',
    description: '',
    logoFile: null as File | null,
    bannerFile: null as File | null,
    logoPreview: '',
    bannerPreview: '',
  });

  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    imageFile: null as File | null,
    imagePreview: '',
  });

  // Redirect if not authenticated or not a merchant
  if (!authLoading && (!user || profile?.user_type !== 'comerciante')) {
    navigate('/auth');
    return null;
  }

  if (authLoading || storesLoading) {
    return (
      <Layout>
        <div className="container px-4 py-8 flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </Layout>
    );
  }

  const myStores = getMyStores();

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'banner' | 'product'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'logo') {
        setStoreForm(prev => ({ ...prev, logoFile: file, logoPreview: reader.result as string }));
      } else if (type === 'banner') {
        setStoreForm(prev => ({ ...prev, bannerFile: file, bannerPreview: reader.result as string }));
      } else {
        setProductForm(prev => ({ ...prev, imageFile: file, imagePreview: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateStore = async () => {
    if (!storeForm.name || !storeForm.category || !storeForm.phone || !storeForm.address || !storeForm.logoFile || !storeForm.bannerFile) {
      toast({ title: "Preencha todos os campos obrigatórios, incluindo logo e banner", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    
    const { error } = await createStore({
      name: storeForm.name,
      category: storeForm.category,
      phone: storeForm.phone,
      address: storeForm.address,
      description: storeForm.description,
      logoFile: storeForm.logoFile || undefined,
      bannerFile: storeForm.bannerFile || undefined,
    });

    if (error) {
      toast({ title: "Erro ao criar loja", description: String(error), variant: "destructive" });
    } else {
      setIsStoreDialogOpen(false);
      setStoreForm({ name: '', category: '', phone: '', address: '', description: '', logoFile: null, bannerFile: null, logoPreview: '', bannerPreview: '' });
      toast({ title: "Loja criada com sucesso!" });
    }
    
    setIsSubmitting(false);
  };

  const handleCreateProduct = async () => {
    if (!selectedStoreId || !productForm.name || !productForm.price) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    
    const { error } = await createProduct({
      store_id: selectedStoreId,
      name: productForm.name,
      price: parseFloat(productForm.price),
      description: productForm.description,
      imageFile: productForm.imageFile || undefined,
    });

    if (error) {
      toast({ title: "Erro ao adicionar produto", description: String(error), variant: "destructive" });
    } else {
      setIsProductDialogOpen(false);
      setProductForm({ name: '', price: '', description: '', imageFile: null, imagePreview: '' });
      toast({ title: "Produto adicionado com sucesso!" });
    }
    
    setIsSubmitting(false);
  };

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
                  <Label>Nome da Loja *</Label>
                  <Input
                    placeholder="Minha Loja"
                    value={storeForm.name}
                    onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria *</Label>
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
                  <Label>Telefone *</Label>
                  <Input
                    placeholder="(11) 99999-9999"
                    value={storeForm.phone}
                    onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Endereço *</Label>
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
                
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label>Logo da Loja *</Label>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, 'logo')}
                  />
                  <div 
                    onClick={() => logoInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    {storeForm.logoPreview ? (
                      <img src={storeForm.logoPreview} alt="Logo preview" className="w-20 h-20 object-cover rounded-lg mx-auto" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Upload className="h-8 w-8" />
                        <span className="text-sm">Clique para fazer upload do logo</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Banner Upload */}
                <div className="space-y-2">
                  <Label>Banner da Loja *</Label>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, 'banner')}
                  />
                  <div 
                    onClick={() => bannerInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    {storeForm.bannerPreview ? (
                      <img src={storeForm.bannerPreview} alt="Banner preview" className="w-full h-24 object-cover rounded-lg" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ImageIcon className="h-8 w-8" />
                        <span className="text-sm">Clique para fazer upload do banner</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button onClick={handleCreateStore} className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Criando...' : 'Criar Loja'}
                </Button>
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
                  {store.banner_url ? (
                    <img src={store.banner_url} alt={store.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-primary/20 to-secondary/20" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                </div>
                
                <div className="p-6">
                  <div className="flex items-start gap-4 -mt-16 relative">
                    {store.logo_url ? (
                      <img
                        src={store.logo_url}
                        alt={store.name}
                        className="w-20 h-20 rounded-xl border-4 border-background object-cover shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl border-4 border-background bg-primary/10 flex items-center justify-center shadow-lg">
                        <Store className="h-8 w-8 text-primary" />
                      </div>
                    )}
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
                              <Label>Nome do Produto *</Label>
                              <Input
                                placeholder="Produto X"
                                value={productForm.name}
                                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Preço (R$) *</Label>
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
                            
                            {/* Product Image Upload */}
                            <div className="space-y-2">
                              <Label>Foto do Produto</Label>
                              <input
                                ref={productImageRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileSelect(e, 'product')}
                              />
                              <div 
                                onClick={() => productImageRef.current?.click()}
                                className="border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors"
                              >
                                {productForm.imagePreview ? (
                                  <img src={productForm.imagePreview} alt="Product preview" className="w-full h-24 object-cover rounded-lg" />
                                ) : (
                                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <Upload className="h-8 w-8" />
                                    <span className="text-sm">Clique para fazer upload da foto</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <Button onClick={handleCreateProduct} className="w-full" disabled={isSubmitting}>
                              {isSubmitting ? 'Adicionando...' : 'Adicionar Produto'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {getStoreProducts(store.id).length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {getStoreProducts(store.id).map((product) => (
                          <div key={product.id} className="bg-muted/30 rounded-lg p-3">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-20 object-cover rounded-md mb-2"
                              />
                            ) : (
                              <div className="w-full h-20 bg-muted rounded-md mb-2 flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                            <p className="text-sm text-primary font-semibold">
                              {Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
