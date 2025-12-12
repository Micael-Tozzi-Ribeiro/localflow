import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useStores, DbStore } from '@/hooks/useStores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Store, Plus, Edit, Package, Upload, ImageIcon, Trash2, MapPin, Phone, Eye } from 'lucide-react';
import { STORE_CATEGORIES } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface DbProduct {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  created_at: string;
}

const MyStores = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();
  const { getMyStores, getStoreProducts, createStore, createProduct, updateStore, deleteStore, updateProduct, deleteProduct, isLoading: storesLoading } = useStores();
  const { toast } = useToast();
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState(false);
  const [isDeleteProductDialogOpen, setIsDeleteProductDialogOpen] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [storeToEdit, setStoreToEdit] = useState<DbStore | null>(null);
  const [storeToDelete, setStoreToDelete] = useState<DbStore | null>(null);
  const [productToEdit, setProductToEdit] = useState<DbProduct | null>(null);
  const [productToDelete, setProductToDelete] = useState<DbProduct | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const productImageRef = useRef<HTMLInputElement>(null);
  const editLogoInputRef = useRef<HTMLInputElement>(null);
  const editBannerInputRef = useRef<HTMLInputElement>(null);
  const editProductImageRef = useRef<HTMLInputElement>(null);

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

  const [editForm, setEditForm] = useState({
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

  const [editProductForm, setEditProductForm] = useState({
    name: '',
    price: '',
    description: '',
    imageFile: null as File | null,
    imagePreview: '',
  });

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'banner' | 'product' | 'edit-logo' | 'edit-banner' | 'edit-product'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'logo') {
        setStoreForm(prev => ({ ...prev, logoFile: file, logoPreview: reader.result as string }));
      } else if (type === 'banner') {
        setStoreForm(prev => ({ ...prev, bannerFile: file, bannerPreview: reader.result as string }));
      } else if (type === 'edit-logo') {
        setEditForm(prev => ({ ...prev, logoFile: file, logoPreview: reader.result as string }));
      } else if (type === 'edit-banner') {
        setEditForm(prev => ({ ...prev, bannerFile: file, bannerPreview: reader.result as string }));
      } else if (type === 'edit-product') {
        setEditProductForm(prev => ({ ...prev, imageFile: file, imagePreview: reader.result as string }));
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

  const openEditDialog = (store: DbStore) => {
    setStoreToEdit(store);
    setEditForm({
      name: store.name,
      category: store.category,
      phone: store.phone,
      address: store.address,
      description: store.description || '',
      logoFile: null,
      bannerFile: null,
      logoPreview: store.logo_url || '',
      bannerPreview: store.banner_url || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateStore = async () => {
    if (!storeToEdit) return;

    setIsSubmitting(true);
    
    const { error } = await updateStore(storeToEdit.id, {
      name: editForm.name,
      category: editForm.category,
      phone: editForm.phone,
      address: editForm.address,
      description: editForm.description,
      logoFile: editForm.logoFile || undefined,
      bannerFile: editForm.bannerFile || undefined,
    });

    if (error) {
      toast({ title: "Erro ao atualizar loja", description: String(error), variant: "destructive" });
    } else {
      setIsEditDialogOpen(false);
      setStoreToEdit(null);
      toast({ title: "Loja atualizada com sucesso!" });
    }
    
    setIsSubmitting(false);
  };

  const openDeleteDialog = (store: DbStore) => {
    setStoreToDelete(store);
    setDeleteConfirmName('');
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteStore = async () => {
    if (!storeToDelete || deleteConfirmName !== storeToDelete.name) {
      toast({ title: "Digite o nome da loja corretamente para confirmar", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    
    const { error } = await deleteStore(storeToDelete.id);

    if (error) {
      toast({ title: "Erro ao excluir loja", description: String(error), variant: "destructive" });
    } else {
      setIsDeleteDialogOpen(false);
      setStoreToDelete(null);
      toast({ title: "Loja excluída com sucesso!" });
    }
    
    setIsSubmitting(false);
  };

  const openEditProductDialog = (product: DbProduct) => {
    setProductToEdit(product);
    setEditProductForm({
      name: product.name,
      price: String(product.price),
      description: product.description || '',
      imageFile: null,
      imagePreview: product.image_url || '',
    });
    setIsEditProductDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!productToEdit) return;

    setIsSubmitting(true);
    
    const { error } = await updateProduct(productToEdit.id, {
      name: editProductForm.name,
      price: parseFloat(editProductForm.price),
      description: editProductForm.description,
      imageFile: editProductForm.imageFile || undefined,
    });

    if (error) {
      toast({ title: "Erro ao atualizar produto", description: String(error), variant: "destructive" });
    } else {
      setIsEditProductDialogOpen(false);
      setProductToEdit(null);
      toast({ title: "Produto atualizado com sucesso!" });
    }
    
    setIsSubmitting(false);
  };

  const openDeleteProductDialog = (product: DbProduct) => {
    setProductToDelete(product);
    setIsDeleteProductDialogOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    setIsSubmitting(true);
    
    const { error } = await deleteProduct(productToDelete.id);

    if (error) {
      toast({ title: "Erro ao excluir produto", description: String(error), variant: "destructive" });
    } else {
      setIsDeleteProductDialogOpen(false);
      setProductToDelete(null);
      toast({ title: "Produto excluído com sucesso!" });
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
          <div className="space-y-8">
            {myStores.map((store) => (
              <div key={store.id} className="bg-card rounded-2xl shadow-md overflow-hidden animate-fade-in">
                {/* Store Card Header - Same style as StoreCard */}
                <div className="relative h-36 overflow-hidden">
                  {store.banner_url ? (
                    <img 
                      src={store.banner_url} 
                      alt={store.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-primary/20 to-secondary/20" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                </div>
                
                {/* Store Info Section */}
                <div className="relative px-4 sm:px-6 pb-6">
                  {/* Logo */}
                  <div className="absolute -top-8 left-4 sm:left-6">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border-4 border-background shadow-lg">
                      {store.logo_url ? (
                        <img
                          src={store.logo_url}
                          alt={`Logo ${store.name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <Store className="h-6 w-6 text-primary" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Store Details */}
                  <div className="pt-10">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-xl font-bold text-card-foreground">{store.name}</h2>
                          <Badge variant="secondary" className="shrink-0">
                            {store.category}
                          </Badge>
                        </div>
                        
                        <div className="mt-3 space-y-1.5">
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-secondary shrink-0" />
                            {store.address}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Phone className="h-4 w-4 text-secondary shrink-0" />
                            {store.phone}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <Link to={`/loja/${store.id}`}>
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <Eye className="h-4 w-4" />
                            Ver Loja
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1.5"
                          onClick={() => openEditDialog(store)}
                        >
                          <Edit className="h-4 w-4" />
                          Editar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="gap-1.5"
                          onClick={() => openDeleteDialog(store)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Excluir
                        </Button>
                      </div>
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
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {getStoreProducts(store.id).map((product) => (
                          <div key={product.id} className="bg-muted/30 rounded-xl p-3 hover:bg-muted/50 transition-colors group relative">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-24 object-cover rounded-lg mb-2"
                              />
                            ) : (
                              <div className="w-full h-24 bg-muted rounded-lg mb-2 flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                            <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                            <p className="text-sm text-primary font-semibold">
                              {Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                            <div className="flex gap-1 mt-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 h-7 text-xs gap-1"
                                onClick={() => openEditProductDialog(product)}
                              >
                                <Edit className="h-3 w-3" />
                                Editar
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="h-7 text-xs px-2"
                                onClick={() => openDeleteProductDialog(product)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-6 bg-muted/20 rounded-xl">
                        Nenhum produto cadastrado
                      </p>
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

        {/* Edit Store Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Loja</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome da Loja *</Label>
                <Input
                  placeholder="Minha Loja"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select
                  value={editForm.category}
                  onValueChange={(value) => setEditForm({ ...editForm, category: value })}
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
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Endereço *</Label>
                <Input
                  placeholder="Rua das Flores, 123"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Textarea
                  placeholder="Conte um pouco sobre sua loja..."
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>
              
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Logo da Loja</Label>
                <input
                  ref={editLogoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'edit-logo')}
                />
                <div 
                  onClick={() => editLogoInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors"
                >
                  {editForm.logoPreview ? (
                    <img src={editForm.logoPreview} alt="Logo preview" className="w-20 h-20 object-cover rounded-lg mx-auto" />
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
                <Label>Banner da Loja</Label>
                <input
                  ref={editBannerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'edit-banner')}
                />
                <div 
                  onClick={() => editBannerInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors"
                >
                  {editForm.bannerPreview ? (
                    <img src={editForm.bannerPreview} alt="Banner preview" className="w-full h-24 object-cover rounded-lg" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-sm">Clique para fazer upload do banner</span>
                    </div>
                  )}
                </div>
              </div>

              <Button onClick={handleUpdateStore} className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Store Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive">Excluir Loja</DialogTitle>
              <DialogDescription>
                Esta ação não pode ser desfeita. Todos os produtos desta loja também serão excluídos.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Para confirmar a exclusão, digite o nome da loja: <strong className="text-foreground">{storeToDelete?.name}</strong>
              </p>
              <Input
                placeholder="Digite o nome da loja"
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteStore}
                disabled={isSubmitting || deleteConfirmName !== storeToDelete?.name}
              >
                {isSubmitting ? 'Excluindo...' : 'Excluir Loja'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={isEditProductDialogOpen} onOpenChange={setIsEditProductDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Produto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Produto *</Label>
                <Input
                  placeholder="Produto X"
                  value={editProductForm.name}
                  onChange={(e) => setEditProductForm({ ...editProductForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Preço (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="29.90"
                  value={editProductForm.price}
                  onChange={(e) => setEditProductForm({ ...editProductForm, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  placeholder="Descrição do produto..."
                  value={editProductForm.description}
                  onChange={(e) => setEditProductForm({ ...editProductForm, description: e.target.value })}
                />
              </div>
              
              {/* Product Image Upload */}
              <div className="space-y-2">
                <Label>Foto do Produto</Label>
                <input
                  ref={editProductImageRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'edit-product')}
                />
                <div 
                  onClick={() => editProductImageRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors"
                >
                  {editProductForm.imagePreview ? (
                    <img src={editProductForm.imagePreview} alt="Product preview" className="w-full h-24 object-cover rounded-lg" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="h-8 w-8" />
                      <span className="text-sm">Clique para fazer upload da foto</span>
                    </div>
                  )}
                </div>
              </div>

              <Button onClick={handleUpdateProduct} className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Product Dialog */}
        <Dialog open={isDeleteProductDialogOpen} onOpenChange={setIsDeleteProductDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive">Excluir Produto</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir o produto "{productToDelete?.name}"? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteProductDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteProduct}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Excluindo...' : 'Excluir Produto'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default MyStores;
