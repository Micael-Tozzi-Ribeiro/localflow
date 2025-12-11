import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Store, Product, CartItem, DeliveryRequest } from '@/types';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  stores: Store[];
  setStores: React.Dispatch<React.SetStateAction<Store[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  cart: CartItem[];
  addToCart: (product: Product, store: Store) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleFavorite: (storeId: string) => void;
  deliveryRequests: DeliveryRequest[];
  addDeliveryRequest: (request: DeliveryRequest) => void;
  acceptDelivery: (requestId: string, deliveryPersonId: string) => void;
  notifications: string[];
  addNotification: (message: string) => void;
  clearNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock data for demonstration
const mockStores: Store[] = [
  {
    id: '1',
    ownerId: 'owner1',
    logo: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=100&h=100&fit=crop',
    banner: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=300&fit=crop',
    name: 'Padaria do Zé',
    category: 'Padaria',
    phone: '(11) 99999-1111',
    address: 'Rua das Flores, 123',
    description: 'Os melhores pães fresquinhos do bairro!',
    state: 'SP',
    neighborhood: 'Centro',
  },
  {
    id: '2',
    ownerId: 'owner2',
    logo: 'https://images.unsplash.com/photo-1553531384-411a247ccd73?w=100&h=100&fit=crop',
    banner: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&h=300&fit=crop',
    name: 'Hortifruti Vida Saudável',
    category: 'Hortifruti',
    phone: '(11) 99999-2222',
    address: 'Av. Principal, 456',
    description: 'Frutas e verduras fresquinhas direto do produtor.',
    state: 'SP',
    neighborhood: 'Centro',
  },
  {
    id: '3',
    ownerId: 'owner3',
    logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop',
    banner: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=300&fit=crop',
    name: 'Burguer Local',
    category: 'Restaurante',
    phone: '(11) 99999-3333',
    address: 'Rua do Sabor, 789',
    description: 'Hambúrgueres artesanais feitos com muito amor.',
    state: 'SP',
    neighborhood: 'Centro',
  },
  {
    id: '4',
    ownerId: 'owner4',
    logo: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=100&h=100&fit=crop',
    banner: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&h=300&fit=crop',
    name: 'Farmácia Popular',
    category: 'Farmácia',
    phone: '(11) 99999-4444',
    address: 'Av. da Saúde, 101',
    description: 'Medicamentos e produtos de higiene com os melhores preços.',
    state: 'SP',
    neighborhood: 'Centro',
  },
  {
    id: '5',
    ownerId: 'owner5',
    logo: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=100&h=100&fit=crop',
    banner: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&h=300&fit=crop',
    name: 'Pet Amigo',
    category: 'Pet Shop',
    phone: '(11) 99999-5555',
    address: 'Rua dos Bichinhos, 202',
    description: 'Tudo para o seu pet com carinho e dedicação.',
    state: 'SP',
    neighborhood: 'Centro',
  },
];

const mockProducts: Product[] = [
  { id: 'p1', storeId: '1', photo: 'https://images.unsplash.com/photo-1549931319-a545753d62ce?w=300&h=200&fit=crop', name: 'Pão Francês (unid)', price: 0.80, description: 'Pão francês crocante por fora e macio por dentro' },
  { id: 'p2', storeId: '1', photo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop', name: 'Croissant', price: 5.50, description: 'Croissant folhado tradicional' },
  { id: 'p3', storeId: '1', photo: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&h=200&fit=crop', name: 'Bolo de Chocolate', price: 35.00, description: 'Bolo de chocolate com cobertura' },
  { id: 'p4', storeId: '2', photo: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=300&h=200&fit=crop', name: 'Cesta de Frutas', price: 45.00, description: 'Cesta com frutas variadas da estação' },
  { id: 'p5', storeId: '2', photo: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&h=200&fit=crop', name: 'Salada Verde', price: 12.00, description: 'Mix de folhas frescas' },
  { id: 'p6', storeId: '3', photo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop', name: 'Hambúrguer Clássico', price: 28.00, description: 'Pão, carne, queijo, alface e tomate' },
  { id: 'p7', storeId: '3', photo: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=300&h=200&fit=crop', name: 'Batata Frita', price: 15.00, description: 'Porção de batata frita crocante' },
  { id: 'p8', storeId: '4', photo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop', name: 'Vitamina C', price: 22.00, description: 'Suplemento de Vitamina C 1000mg' },
  { id: 'p9', storeId: '5', photo: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300&h=200&fit=crop', name: 'Ração Premium', price: 89.00, description: 'Ração premium para cães adultos 15kg' },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('localflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [stores, setStores] = useState<Store[]>(mockStores);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryRequest[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('localflow_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('localflow_user');
    }
  }, [user]);

  const addToCart = (product: Product, store: Store) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, store }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const toggleFavorite = (storeId: string) => {
    if (!user) return;
    setUser({
      ...user,
      favorites: user.favorites.includes(storeId)
        ? user.favorites.filter(id => id !== storeId)
        : [...user.favorites, storeId],
    });
  };

  const addDeliveryRequest = (request: DeliveryRequest) => {
    setDeliveryRequests(prev => [...prev, request]);
    // Notify delivery persons in the same area
    if (user?.userType === 'entregador' && user.neighborhood === request.storeName) {
      addNotification(`Nova entrega disponível: ${request.storeName}`);
    }
  };

  const acceptDelivery = (requestId: string, deliveryPersonId: string) => {
    setDeliveryRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? { ...req, status: 'in_progress', deliveryPersonId }
          : req
      )
    );
  };

  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
  };

  const clearNotifications = () => setNotifications([]);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        stores,
        setStores,
        products,
        setProducts,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleFavorite,
        deliveryRequests,
        addDeliveryRequest,
        acceptDelivery,
        notifications,
        addNotification,
        clearNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
