
import { supabase } from "@/integrations/supabase/client";
import { Dish, Rating } from "@/types/dish";

export const fetchDishes = async (): Promise<Dish[]> => {
  const { data, error } = await supabase
    .from('dishes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching dishes:', error);
    return [];
  }
  
  return data || [];
};

export const submitRating = async (dish_id: string, rating: 'like' | 'dislike'): Promise<void> => {
  const { error } = await supabase
    .from('ratings')
    .insert({ dish_id, rating });
  
  if (error) {
    console.error('Error submitting rating:', error);
    throw error;
  }
};

export const getDishRatings = async (dish_id: string): Promise<Rating[]> => {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('dish_id', dish_id);
  
  if (error) {
    console.error('Error fetching ratings:', error);
    return [];
  }
  
  // Cast the rating property to ensure it matches the 'like' | 'dislike' type
  return data?.map(item => ({
    ...item,
    rating: item.rating as 'like' | 'dislike'
  })) || [];
};

export const subscribeToRatings = (
  callback: (payload: any) => void
) => {
  const channel = supabase
    .channel('public:ratings')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'ratings' },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
