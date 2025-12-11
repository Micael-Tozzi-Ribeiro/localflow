import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Phone, Mail, LogOut, Heart, ShoppingCart, Store, Truck } from 'lucide-react';
import { useEffect } from 'react';

const Account = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [isLoading, user, navigate]);

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

  const userTypeLabels = {
    morador: { label: 'Morador', color: 'bg-primary', icon: User },
    comerciante: { label: 'Comerciante', color: 'bg-secondary', icon: Store },
    entregador: { label: 'Entregador', color: 'bg-accent-foreground', icon: Truck },
  };

  const typeInfo = userTypeLabels[profile.user_type];

  return (
    <Layout>
      <div className="container px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
              <User className="h-12 w-12 text-primary-foreground" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{profile.name}</h1>
            <Badge className={`mt-2 ${typeInfo.color}`}>
              <typeInfo.icon className="h-3 w-3 mr-1" />
              {typeInfo.label}
            </Badge>
          </div>

          {/* Info Card */}
          <div className="bg-card rounded-2xl shadow-md p-6 mb-6">
            <h2 className="font-semibold text-lg text-card-foreground mb-4">Informações</h2>
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
