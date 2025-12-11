import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserType, BRAZILIAN_STATES } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { User, Store, Truck } from 'lucide-react';
import logo from '@/assets/logo-localflow.png';

const Auth = () => {
  const navigate = useNavigate();
  const { setUser } = useApp();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    neighborhood: '',
    userType: 'usuario' as UserType,
    password: '',
    confirmPassword: '',
  });

  const userTypeOptions = [
    { value: 'usuario', label: 'Morador', icon: User, color: 'bg-primary' },
    { value: 'comerciante', label: 'Comerciante', icon: Store, color: 'bg-secondary' },
    { value: 'entregador', label: 'Entregador', icon: Truck, color: 'bg-accent-foreground' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login - in production this would call an API
    setTimeout(() => {
      setUser({
        id: Date.now().toString(),
        name: 'Usuário Demo',
        email: loginEmail,
        phone: '(11) 99999-9999',
        state: 'SP',
        neighborhood: 'Centro',
        userType: 'usuario',
        favorites: [],
      });
      toast({ title: "Login realizado com sucesso!" });
      navigate('/');
      setIsLoading(false);
    }, 1000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({ title: "As senhas não coincidem", variant: "destructive" });
      return;
    }
    
    if (!registerData.state || !registerData.neighborhood) {
      toast({ title: "Preencha seu estado e bairro", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    
    // Simulate registration - in production this would call an API
    setTimeout(() => {
      setUser({
        id: Date.now().toString(),
        name: registerData.name,
        email: registerData.email,
        phone: registerData.phone,
        state: registerData.state,
        neighborhood: registerData.neighborhood,
        userType: registerData.userType,
        favorites: [],
      });
      toast({ title: "Cadastro realizado com sucesso!" });
      
      if (registerData.userType === 'comerciante') {
        navigate('/minhas-lojas');
      } else if (registerData.userType === 'entregador') {
        navigate('/entregas');
      } else {
        navigate('/lojas');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src={logo} alt="LocalFlow" className="h-12 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground">Bem-vindo ao LocalFlow</h1>
            <p className="text-muted-foreground mt-2">Conecte-se com seu bairro</p>
          </div>

          <div className="bg-card rounded-2xl shadow-xl p-6 md:p-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Cadastrar</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* User Type Selection */}
                  <div className="space-y-2">
                    <Label>Tipo de Conta</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {userTypeOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setRegisterData({ ...registerData, userType: option.value as UserType })}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                            registerData.userType === option.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full ${option.color} flex items-center justify-center`}>
                            <option.icon className="h-5 w-5 text-primary-foreground" />
                          </div>
                          <span className="text-xs font-medium">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      placeholder="João Silva"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Select
                        value={registerData.state}
                        onValueChange={(value) => setRegisterData({ ...registerData, state: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          {BRAZILIAN_STATES.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input
                        id="neighborhood"
                        placeholder="Centro"
                        value={registerData.neighborhood}
                        onChange={(e) => setRegisterData({ ...registerData, neighborhood: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Senha</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Cadastrando...' : 'Criar Conta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
