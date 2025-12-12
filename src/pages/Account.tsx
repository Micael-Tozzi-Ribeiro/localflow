import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, MapPin, Phone, Mail, LogOut, Heart, ShoppingCart, Store, Truck, Edit, Camera, Loader2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Account = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading, signOut, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editForm, setEditForm] = useState({
    state: '',
    neighborhood: '',
    phone: '',
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [isLoading, user, navigate]);

  useEffect(() => {
    if (profile) {
      setEditForm({
        state: profile.state || '',
        neighborhood: profile.neighborhood || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container px-4 py-8 flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </Layout>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleSaveProfile = async () => {
    if (!editForm.state.trim() || !editForm.neighborhood.trim()) {
      toast.error('Estado e região são obrigatórios');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          state: editForm.state.trim(),
          neighborhood: editForm.neighborhood.trim(),
          phone: editForm.phone.trim() || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Delete old avatar if exists
      await supabase.storage.from('avatars').remove([fileName]);

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast.success('Foto de perfil atualizada!');
      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error('Erro ao fazer upload da foto');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const userTypeLabels: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    morador: { label: 'Morador', color: 'bg-primary', icon: User },
    comerciante: { label: 'Comerciante', color: 'bg-secondary', icon: Store },
    entregador: { label: 'Entregador', color: 'bg-accent-foreground', icon: Truck },
  };

  const typeInfo = userTypeLabels[profile.user_type] || userTypeLabels.morador;

  return (
    <Layout>
      <div className="container px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full overflow-hidden gradient-primary flex items-center justify-center mx-auto mb-4 relative">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Foto de perfil" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-primary-foreground" />
                )}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-3 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{profile.name}</h1>
            <Badge className={`mt-2 ${typeInfo.color}`}>
              <typeInfo.icon className="h-3 w-3 mr-1" />
              {typeInfo.label}
            </Badge>
          </div>

          {/* Info Card */}
          <div className="bg-card rounded-2xl shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg text-card-foreground">Informações</h2>
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Perfil</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={editForm.state}
                        onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                        placeholder="Ex: São Paulo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">Bairro / Região</Label>
                      <Input
                        id="neighborhood"
                        value={editForm.neighborhood}
                        onChange={(e) => setEditForm({ ...editForm, neighborhood: e.target.value })}
                        placeholder="Ex: Centro"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder="Ex: (11) 99999-9999"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="flex-1"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          'Salvar'
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground">{profile.email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <span className="text-foreground">{profile.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground">{profile.neighborhood}, {profile.state}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-2xl shadow-md p-6 mb-6">
            <h2 className="font-semibold text-lg text-card-foreground mb-4">Ações Rápidas</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/favoritos">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Heart className="h-4 w-4" />
                  Favoritos
                </Button>
              </Link>
              <Link to="/carrinho">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Carrinho
                </Button>
              </Link>
              {profile.user_type === 'comerciante' && (
                <Link to="/minhas-lojas" className="col-span-2">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Store className="h-4 w-4" />
                    Minhas Lojas
                  </Button>
                </Link>
              )}
              {profile.user_type === 'entregador' && (
                <Link to="/entregas" className="col-span-2">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Truck className="h-4 w-4" />
                    Painel de Entregas
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Logout */}
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair da Conta
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Account;