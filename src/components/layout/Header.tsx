import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Heart, Store, Truck, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import logo from '@/assets/logo-localflow.png';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, cart, notifications } = useApp();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Início', href: '/' },
    { label: 'Sobre', href: '/sobre' },
    { label: 'Lojas', href: '/lojas' },
    { label: 'Assistente IA', href: '/assistente', icon: Bot },
  ];

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="LocalFlow" className="h-10 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1"
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user && (
            <>
              <Link to="/favoritos" className="relative">
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/carrinho" className="relative">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {cartItemsCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              {user.userType === 'comerciante' && (
                <Link to="/minhas-lojas">
                  <Button variant="ghost" size="icon">
                    <Store className="h-5 w-5" />
                  </Button>
                </Link>
              )}
              {user.userType === 'entregador' && (
                <Link to="/entregas" className="relative">
                  <Button variant="ghost" size="icon">
                    <Truck className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {notifications.length}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )}
            </>
          )}
          {user ? (
            <Link to="/conta">
              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="max-w-24 truncate">{user.name.split(' ')[0]}</span>
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button size="sm">Entrar</Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <nav className="container flex flex-col gap-2 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </Link>
            ))}
            <div className="border-t border-border my-2" />
            {user && (
              <>
                <Link
                  to="/favoritos"
                  className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="h-4 w-4" />
                  Favoritos
                </Link>
                <Link
                  to="/carrinho"
                  className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Carrinho
                  {cartItemsCount > 0 && (
                    <Badge className="ml-auto">{cartItemsCount}</Badge>
                  )}
                </Link>
                {user.userType === 'comerciante' && (
                  <Link
                    to="/minhas-lojas"
                    className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Store className="h-4 w-4" />
                    Minhas Lojas
                  </Link>
                )}
                {user.userType === 'entregador' && (
                  <Link
                    to="/entregas"
                    className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Truck className="h-4 w-4" />
                    Entregas
                    {notifications.length > 0 && (
                      <Badge variant="destructive" className="ml-auto">{notifications.length}</Badge>
                    )}
                  </Link>
                )}
              </>
            )}
            {user ? (
              <Link
                to="/conta"
                className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                Minha Conta
              </Link>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsMenuOpen(false)}
              >
                <Button className="w-full">Entrar</Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
