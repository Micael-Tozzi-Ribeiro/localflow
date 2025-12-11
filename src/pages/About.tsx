import { Heart, MapPin, Target, Users, Zap } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: 'Comunidade',
      description: 'Acreditamos que bairros fortes são construídos por pessoas que se apoiam.',
    },
    {
      icon: MapPin,
      title: 'Localidade',
      description: 'Priorizamos negócios locais para manter o dinheiro circulando na região.',
    },
    {
      icon: Zap,
      title: 'Praticidade',
      description: 'Facilitamos a conexão entre quem precisa e quem oferece produtos e serviços.',
    },
    {
      icon: Users,
      title: 'Inclusão',
      description: 'Todos têm espaço no LocalFlow: moradores, comerciantes e entregadores.',
    },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 md:py-28 gradient-primary">
        <div className="container px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary-foreground animate-fade-in">
            Sobre o LocalFlow
          </h1>
          <p className="mt-6 text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Uma plataforma que nasceu da vontade de fortalecer a economia local e 
            conectar pessoas que compartilham o mesmo bairro.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary font-medium text-sm mb-6">
                <Target className="h-4 w-4" />
                Nossa Missão
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Conectar para <span className="text-primary">transformar</span>
              </h2>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                O LocalFlow foi criado com a missão de fortalecer comunidades através 
                da conexão entre moradores, comerciantes e entregadores. Acreditamos 
                que quando compramos local, todos ganham: o comércio cresce, os 
                entregadores têm mais oportunidades e a vizinhança se torna mais unida.
              </p>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                Nossa plataforma é mais do que um marketplace - é uma ferramenta de 
                transformação social que incentiva o fluxo econômico regional e 
                fortalece os laços comunitários.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=600&fit=crop" 
                  alt="Comunidade local" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 gradient-secondary rounded-2xl opacity-50" />
              <div className="absolute -top-6 -right-6 w-24 h-24 gradient-primary rounded-xl opacity-30" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Nossos Valores
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Princípios que guiam cada decisão que tomamos no LocalFlow.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={value.title}
                className="bg-card p-6 rounded-2xl shadow-sm hover:shadow-md transition-all animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-card-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Lojas Cadastradas' },
              { value: '10k+', label: 'Usuários Ativos' },
              { value: '50+', label: 'Bairros Conectados' },
              { value: '200+', label: 'Entregadores' },
            ].map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl md:text-5xl font-extrabold text-primary">{stat.value}</div>
                <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
