import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, User, Sparkles, Store, Truck, Users, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistant = () => {
  const { user } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Olá${user ? `, ${user.name.split(' ')[0]}` : ''}! 👋 Sou o assistente virtual do LocalFlow. Estou aqui para ajudar você a:

${user?.userType === 'comerciante' ? `
• Criar descrições automáticas para seus produtos
• Sugerir categorias para produtos
• Orientar sobre como melhorar o perfil da sua loja
• Dar dicas de como atrair mais clientes` : user?.userType === 'entregador' ? `
• Explicar como aceitar entregas
• Mostrar pedidos pendentes da região
• Tirar dúvidas sobre o funcionamento
• Ajudar com suporte técnico` : `
• Encontrar lojas por categoria, nome ou produto
• Sugerir lojas populares da sua região
• Explicar como usar a plataforma
• Navegar pelo site`}

Como posso ajudar você hoje?`,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickActions = user?.userType === 'comerciante' 
    ? [
        { label: 'Criar descrição de produto', prompt: 'Preciso de ajuda para criar uma descrição atrativa para um produto.' },
        { label: 'Melhorar perfil da loja', prompt: 'Como posso melhorar o perfil da minha loja?' },
        { label: 'Dicas de vendas', prompt: 'Quais dicas você tem para aumentar minhas vendas?' },
      ]
    : user?.userType === 'entregador'
    ? [
        { label: 'Como aceitar entregas', prompt: 'Como faço para aceitar uma entrega?' },
        { label: 'Ver pedidos da região', prompt: 'Quais pedidos estão disponíveis na minha região?' },
        { label: 'Dúvidas sobre pagamento', prompt: 'Como funciona o pagamento das entregas?' },
      ]
    : [
        { label: 'Encontrar restaurantes', prompt: 'Quero encontrar restaurantes no meu bairro.' },
        { label: 'Lojas populares', prompt: 'Quais são as lojas mais populares da região?' },
        { label: 'Como favoritar', prompt: 'Como faço para favoritar uma loja?' },
      ];

  const handleSend = async (message?: string) => {
    const text = message || inputValue;
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response - In production, this would call n8n webhook
    setTimeout(() => {
      const responses: Record<string, string> = {
        'restaurante': 'Na sua região, encontrei algumas opções de restaurantes como o Burguer Local! Eles são conhecidos pelos hambúrgueres artesanais. Quer que eu te mostre mais opções?',
        'produto': 'Para criar uma boa descrição de produto, inclua: nome atrativo, principais características, benefícios para o cliente e um chamado para ação. Quer que eu crie uma descrição de exemplo?',
        'entrega': 'Para aceitar uma entrega, vá até o Painel de Entregas. Lá você verá todas as entregas disponíveis na sua região. Clique em "Aceitar Entrega" no pedido desejado.',
        'popular': 'As lojas mais populares da região incluem Padaria do Zé, Hortifruti Vida Saudável e Pet Amigo. Todas têm ótimas avaliações!',
        'favoritar': 'Para favoritar uma loja, basta clicar no ícone de coração que aparece no card da loja ou na página do perfil. Suas lojas favoritas ficam salvas para acesso rápido!',
        'default': 'Entendi! Posso ajudar você com isso. No LocalFlow, conectamos moradores, comerciantes e entregadores do mesmo bairro. Quer saber mais sobre alguma funcionalidade específica?',
      };

      let response = responses.default;
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes('restaurante') || lowerText.includes('comida')) response = responses.restaurante;
      else if (lowerText.includes('descrição') || lowerText.includes('produto')) response = responses.produto;
      else if (lowerText.includes('entrega') || lowerText.includes('aceitar')) response = responses.entrega;
      else if (lowerText.includes('popular') || lowerText.includes('melhor')) response = responses.popular;
      else if (lowerText.includes('favorit')) response = responses.favoritar;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Layout>
      <div className="container px-4 py-8 md:py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <Bot className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Assistente <span className="text-primary">LocalFlow</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Seu guia inteligente para navegar e aproveitar o melhor do bairro
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4 bg-card rounded-xl">
            <Users className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Moradores</p>
          </div>
          <div className="text-center p-4 bg-card rounded-xl">
            <Store className="h-6 w-6 text-secondary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Comerciantes</p>
          </div>
          <div className="text-center p-4 bg-card rounded-xl">
            <Truck className="h-6 w-6 text-accent-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Entregadores</p>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-card rounded-2xl shadow-lg overflow-hidden">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 animate-fade-in",
                  message.role === 'user' && "flex-row-reverse"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  message.role === 'assistant' ? "gradient-primary" : "bg-muted"
                )}>
                  {message.role === 'assistant' ? (
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 whitespace-pre-wrap",
                  message.role === 'assistant' 
                    ? "bg-muted text-foreground rounded-tl-none" 
                    : "gradient-primary text-primary-foreground rounded-tr-none"
                )}>
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-3 border-t border-border">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  className="shrink-0 text-xs gap-1"
                  onClick={() => handleSend(action.prompt)}
                  disabled={isLoading}
                >
                  <Sparkles className="h-3 w-3" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Digite sua mensagem..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* n8n Integration Note */}
        <div className="mt-8 p-4 bg-muted/30 rounded-xl text-center">
          <p className="text-sm text-muted-foreground">
            💡 Este assistente está preparado para integração com <strong>n8n</strong>. 
            Configure seu webhook para respostas personalizadas e automações avançadas.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AIAssistant;
