import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface DbStore {
  id: string;
  owner_id: string;
  name: string;
  category: string;
  description: string | null;
  phone: string;
  address: string;
  state: string;
  neighborhood: string;
  logo_url: string | null;
  banner_url: string | null;
  created_at: string;
}

export interface DbProduct {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  created_at: string;
}

export function useStores() {
  const { profile } = useAuth();
  const [stores, setStores] = useState<DbStore[]>([]);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStores();
    fetchProducts();
  }, []);

  const fetchStores = async () => {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data && !error) {
      setStores(data as DbStore[]);
    }
    setIsLoading(false);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data && !error) {
      setProducts(data as DbProduct[]);
    }
  };

  const getStoresByRegion = () => {
    if (!profile) return stores;
    return stores.filter(
      s => s.state === profile.state && s.neighborhood.toLowerCase() === profile.neighborhood.toLowerCase()
    );
  };

  const getMyStores = () => {
    if (!profile) return [];
    return stores.filter(s => s.owner_id === profile.user_id);
  };

  const getStoreProducts = (storeId: string) => {
    return products.filter(p => p.store_id === storeId);
  };

  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from('store-images')
      .upload(path, file, { upsert: true });
    
    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: publicUrl } = supabase.storage
      .from('store-images')
      .getPublicUrl(data.path);
    
    return publicUrl.publicUrl;
  };

  const createStore = async (storeData: {
    name: string;
    category: string;
    description?: string;
    phone: string;
    address: string;
    logoFile?: File;
    bannerFile?: File;
  }) => {
    if (!profile) return { error: 'Usuário não autenticado' };

    let logo_url = null;
    let banner_url = null;

    // Upload logo if provided
    if (storeData.logoFile) {
      const logoPath = `${profile.user_id}/logo-${Date.now()}`;
      logo_url = await uploadImage(storeData.logoFile, logoPath);
    }

    // Upload banner if provided
    if (storeData.bannerFile) {
      const bannerPath = `${profile.user_id}/banner-${Date.now()}`;
      banner_url = await uploadImage(storeData.bannerFile, bannerPath);
    }

    const { data, error } = await supabase
      .from('stores')
      .insert({
        owner_id: profile.user_id,
        name: storeData.name,
        category: storeData.category,
        description: storeData.description || null,
        phone: storeData.phone,
        address: storeData.address,
        state: profile.state,
        neighborhood: profile.neighborhood,
        logo_url,
        banner_url,
      })
      .select()
      .single();

    if (!error && data) {
      setStores(prev => [data as DbStore, ...prev]);
    }

    return { data, error };
  };

  const createProduct = async (productData: {
    store_id: string;
    name: string;
    price: number;
    description?: string;
    imageFile?: File;
  }) => {
    if (!profile) return { error: 'Usuário não autenticado' };

    let image_url = null;

    if (productData.imageFile) {
      const imagePath = `${profile.user_id}/product-${Date.now()}`;
      image_url = await uploadImage(productData.imageFile, imagePath);
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        store_id: productData.store_id,
        name: productData.name,
        price: productData.price,
        description: productData.description || null,
        image_url,
      })
      .select()
      .single();

    if (!error && data) {
      setProducts(prev => [data as DbProduct, ...prev]);
    }

    return { data, error };
  };

  const updateStore = async (
    storeId: string,
    storeData: {
      name?: string;
      category?: string;
      description?: string;
      phone?: string;
      address?: string;
      logoFile?: File;
      bannerFile?: File;
    }
  ) => {
    if (!profile) return { error: 'Usuário não autenticado' };

    const updateData: Record<string, unknown> = {};

    if (storeData.name) updateData.name = storeData.name;
    if (storeData.category) updateData.category = storeData.category;
    if (storeData.description !== undefined) updateData.description = storeData.description || null;
    if (storeData.phone) updateData.phone = storeData.phone;
    if (storeData.address) updateData.address = storeData.address;

    // Upload new logo if provided
    if (storeData.logoFile) {
      const logoPath = `${profile.user_id}/logo-${Date.now()}`;
      const logo_url = await uploadImage(storeData.logoFile, logoPath);
      if (logo_url) updateData.logo_url = logo_url;
    }

    // Upload new banner if provided
    if (storeData.bannerFile) {
      const bannerPath = `${profile.user_id}/banner-${Date.now()}`;
      const banner_url = await uploadImage(storeData.bannerFile, bannerPath);
      if (banner_url) updateData.banner_url = banner_url;
    }

    const { data, error } = await supabase
      .from('stores')
      .update(updateData)
      .eq('id', storeId)
      .select()
      .single();

    if (!error && data) {
      setStores(prev => prev.map(s => s.id === storeId ? data as DbStore : s));
    }

    return { data, error };
  };

  const deleteStore = async (storeId: string) => {
    if (!profile) return { error: 'Usuário não autenticado' };

    // First delete all products of the store
    await supabase.from('products').delete().eq('store_id', storeId);

    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', storeId);

    if (!error) {
      setStores(prev => prev.filter(s => s.id !== storeId));
      setProducts(prev => prev.filter(p => p.store_id !== storeId));
    }

    return { error };
  };

  return {
    stores,
    products,
    isLoading,
    getStoresByRegion,
    getMyStores,
    getStoreProducts,
    createStore,
    createProduct,
    updateStore,
    deleteStore,
    refetchStores: fetchStores,
    refetchProducts: fetchProducts,
  };
}
