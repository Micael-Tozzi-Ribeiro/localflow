import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('store_id')
      .eq('user_id', user.id);

    if (!error && data) {
      setFavorites(data.map(f => f.store_id));
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (storeId: string) => {
    if (!user) return;

    const isFavorite = favorites.includes(storeId);

    if (isFavorite) {
      // Remove favorite
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('store_id', storeId);

      if (!error) {
        setFavorites(prev => prev.filter(id => id !== storeId));
      }
    } else {
      // Add favorite
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, store_id: storeId });

      if (!error) {
        setFavorites(prev => [...prev, storeId]);
      }
    }
  };

  const isFavorite = (storeId: string) => favorites.includes(storeId);

  return {
    favorites,
    isLoading,
    toggleFavorite,
    isFavorite,
    refetchFavorites: fetchFavorites,
  };
}
