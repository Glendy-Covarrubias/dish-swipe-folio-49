
export interface Dish {
  id: string;
  name: string;
  restaurant: string;
  price: string;
  image_url: string;
  tags: string[];
  created_at?: string;
  order_number?: string;
}

export interface Rating {
  id: string;
  dish_id: string;
  rating: 'like' | 'dislike';
  comment: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  created_at: string;
}

export interface DishOrder {
  id: string;
  dish_id: string;
  order_id: string;
  created_at: string;
}
