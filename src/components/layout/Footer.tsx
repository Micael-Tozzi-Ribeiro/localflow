import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, MapPinned, Link2, Home, Info, Store, User, Bot, Headphones, Share2 } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1 - Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPinned className="h-8 w-8 text-secondary" />
              <span className="text-2xl font-bold">LocalFlow</span>
            </div>
            <p className="text-sm text-muted opacity-80">
              Conectando moradores, comerciantes e entregadores do seu bairro. 
              Fortaleça a economia local e incentive o fluxo regional.
            </p>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Link2 className="h-5 w-5 text-secondary" />
              Links Rápidos
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="flex items-center gap-2 text-sm text-muted hover:text-secondary transition-colors">
                  <Home className="h-4 w-4 text-secondary" />
                  Início
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="flex items-center gap-2 text-sm text-muted hover:text-secondary transition-colors">
                  <Info className="h-4 w-4 text-secondary" />
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/lojas" className="flex items-center gap-2 text-sm text-muted hover:text-secondary transition-colors">
                  <Store className="h-4 w-4 text-secondary" />
                  Lojas
                </Link>
              </li>
              <li>
                <Link to="/conta" className="flex items-center gap-2 text-sm text-muted hover:text-secondary transition-colors">
                  <User className="h-4 w-4 text-secondary" />
                  Minha Conta
                </Link>
              </li>
              <li>
                <Link to="/assistente" className="flex items-center gap-2 text-sm text-muted hover:text-secondary transition-colors">
                  <Bot className="h-4 w-4 text-secondary" />
                  Assistente IA
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Social */}
          <div>
            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Share2 className="h-5 w-5 text-secondary" />
              Redes Sociais
            </h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Column 4 - Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Headphones className="h-5 w-5 text-secondary" />
              Suporte
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted">
                <Mail className="h-4 w-4 text-secondary" />
                suporte@localflow.com.br
              </li>
              <li className="flex items-center gap-2 text-sm text-muted">
                <Phone className="h-4 w-4 text-secondary" />
                (11) 99999-0000
              </li>
              <li className="flex items-center gap-2 text-sm text-muted">
                <MapPin className="h-4 w-4 text-secondary" />
                São Paulo, SP - Brasil
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-muted/20 mt-8 pt-8 text-center">
          <p className="text-sm text-muted">
            © {currentYear} LocalFlow. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
