export type UserType = 'usuario' | 'comerciante' | 'entregador';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  neighborhood: string;
  userType: UserType;
  favorites: string[];
}

export interface Store {
  id: string;
  ownerId: string;
  logo: string;
  banner: string;
  name: string;
  category: string;
  phone: string;
  address: string;
  description?: string;
  state: string;
  neighborhood: string;
}

export interface Product {
  id: string;
  storeId: string;
  photo: string;
  name: string;
  price: number;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  store: Store;
}

export interface DeliveryRequest {
  id: string;
  storeId: string;
  storeName: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed';
  deliveryPersonId?: string;
  createdAt: Date;
}

export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export const STORE_CATEGORIES = [
  'Restaurante',
  'Padaria',
  'Mercado',
  'Farmácia',
  'Pet Shop',
  'Açougue',
  'Hortifruti',
  'Conveniência',
  'Bebidas',
  'Doces e Confeitaria',
  'Moda',
  'Eletrônicos',
  'Casa e Decoração',
  'Serviços',
  'Outros'
];
