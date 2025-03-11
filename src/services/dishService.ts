
import { supabase } from "@/integrations/supabase/client";
import { Dish, Rating, Order, DishOrder } from "@/types/dish";

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

export const fetchDishesByOrderNumber = async (orderNumber: string): Promise<Dish[]> => {
  // First, find the order ID for the given order number
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('id')
    .eq('order_number', orderNumber)
    .single();

  if (orderError) {
    if (orderError.code === 'PGRST116') {
      // Order not found, create a new one
      const { data: newOrder, error: createError } = await supabase
        .from('orders')
        .insert({ order_number: orderNumber })
        .select('id')
        .single();
      
      if (createError) {
        console.error('Error creating order:', createError);
        return [];
      }
      
      return []; // No dishes associated with this new order yet
    }
    
    console.error('Error fetching order:', orderError);
    return [];
  }
  
  // Then fetch all dishes associated with this order
  const { data: dishOrdersData, error: dishOrdersError } = await supabase
    .from('dishes_orders')
    .select('dish_id')
    .eq('order_id', orderData.id);
  
  if (dishOrdersError) {
    console.error('Error fetching dish-order associations:', dishOrdersError);
    return [];
  }
  
  if (!dishOrdersData || dishOrdersData.length === 0) {
    return []; // No dishes associated with this order
  }
  
  // Get the dish IDs
  const dishIds = dishOrdersData.map(item => item.dish_id);
  
  // Fetch the actual dishes
  const { data: dishesData, error: dishesError } = await supabase
    .from('dishes')
    .select('*')
    .in('id', dishIds);
  
  if (dishesError) {
    console.error('Error fetching dishes by IDs:', dishesError);
    return [];
  }
  
  return dishesData || [];
};

export const submitRating = async (dish_id: string, rating: 'like' | 'dislike', comment: string = ''): Promise<void> => {
  const { error } = await supabase
    .from('ratings')
    .insert({ dish_id, rating, comment });
  
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

export const getRatingsCount = async (dish_id: string): Promise<{ likes: number; dislikes: number }> => {
  const { data, error } = await supabase
    .from('ratings')
    .select('rating')
    .eq('dish_id', dish_id);

  if (error) {
    console.error('Error fetching ratings count:', error);
    return { likes: 0, dislikes: 0 };
  }

  return {
    likes: data?.filter(r => r.rating === 'like').length || 0,
    dislikes: data?.filter(r => r.rating === 'dislike').length || 0
  };
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

export const associateDishWithOrder = async (dishId: string, orderNumber: string): Promise<boolean> => {
  // First, get or create the order
  let orderId: string;
  
  const { data: existingOrder, error: findError } = await supabase
    .from('orders')
    .select('id')
    .eq('order_number', orderNumber)
    .single();
  
  if (findError) {
    if (findError.code === 'PGRST116') {
      // Order not found, create a new one
      const { data: newOrder, error: createError } = await supabase
        .from('orders')
        .insert({ order_number: orderNumber })
        .select('id')
        .single();
      
      if (createError) {
        console.error('Error creating order:', createError);
        return false;
      }
      
      orderId = newOrder.id;
    } else {
      console.error('Error finding order:', findError);
      return false;
    }
  } else {
    orderId = existingOrder.id;
  }
  
  // Create the dish-order association
  const { error: associateError } = await supabase
    .from('dishes_orders')
    .insert({ dish_id: dishId, order_id: orderId });
  
  if (associateError) {
    if (associateError.code === '23505') {
      // This is a unique constraint violation, which means the association already exists
      return true;
    }
    console.error('Error associating dish with order:', associateError);
    return false;
  }
  
  return true;
};
