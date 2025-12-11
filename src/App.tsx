import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import Index from "./pages/Index";
import About from "./pages/About";
import Stores from "./pages/Stores";
import StoreProfile from "./pages/StoreProfile";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import Cart from "./pages/Cart";
import Favorites from "./pages/Favorites";
import MyStores from "./pages/MyStores";
import DeliveryPanel from "./pages/DeliveryPanel";
import AIAssistant from "./pages/AIAssistant";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/lojas" element={<Stores />} />
            <Route path="/loja/:id" element={<StoreProfile />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/conta" element={<Account />} />
            <Route path="/carrinho" element={<Cart />} />
            <Route path="/favoritos" element={<Favorites />} />
            <Route path="/minhas-lojas" element={<MyStores />} />
            <Route path="/entregas" element={<DeliveryPanel />} />
            <Route path="/assistente" element={<AIAssistant />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
