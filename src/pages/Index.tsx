
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import TopNav from '@/components/TopNav';
import DishCard from '@/components/DishCard';
import { useToast } from '@/components/ui/use-toast';
import { fetchDishes, submitRating, subscribeToRatings } from '@/services/dishService';
import { Dish, Rating } from '@/types/dish';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [currentDishIndex, setCurrentDishIndex] = useState(0);
  const [ratings, setRatings] = useState<Record<string, Rating[]>>({});
  const { toast } = useToast();

  // Fetch dishes from Supabase
  const { data: dishes, isLoading, error } = useQuery({
    queryKey: ['dishes'],
    queryFn: fetchDishes,
  });

  // Set up realtime subscription to ratings
  useEffect(() => {
    const unsubscribe = subscribeToRatings((payload) => {
      const newRating = payload.new as Rating;
      setRatings(prev => {
        const dishRatings = [...(prev[newRating.dish_id] || []), newRating];
        return { ...prev, [newRating.dish_id]: dishRatings };
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Handle swipe action
  const handleSwipe = async (direction: 'left' | 'right', dishId: string) => {
    const rating = direction === 'right' ? 'like' : 'dislike';
    const message = direction === 'right' ? 'Loved it! 😋' : 'Maybe next time 👋';
    
    try {
      await submitRating(dishId, rating);
      toast({
        title: message,
        duration: 1500,
      });
    } catch (error) {
      toast({
        title: 'Failed to submit rating',
        variant: 'destructive',
        duration: 3000,
      });
      console.error('Error submitting rating:', error);
    }
    
    // Move to next dish
    setCurrentDishIndex((prev) => 
      prev < (dishes?.length || 1) - 1 ? prev + 1 : 0
    );
  };

  // Calculate likes and dislikes for the current dish
  const getLikesAndDislikes = (dishId: string) => {
    const dishRatings = ratings[dishId] || [];
    const likes = dishRatings.filter(r => r.rating === 'like').length;
    const dislikes = dishRatings.filter(r => r.rating === 'dislike').length;
    return { likes, dislikes };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-app-muted">Loading tasty dishes...</p>
        </div>
      </div>
    );
  }

  if (error || !dishes || dishes.length === 0) {
    return (
      <div className="min-h-screen bg-app-dark flex items-center justify-center">
        <div className="glass-effect p-8 rounded-2xl text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Oops! No dishes found</h2>
          <p className="text-app-muted">We couldn't find any dishes to show you right now. Please try again later.</p>
        </div>
      </div>
    );
  }

  const currentDish = dishes[currentDishIndex];
  const { likes, dislikes } = getLikesAndDislikes(currentDish.id);

  return (
    <div className="min-h-screen bg-app-dark">
      <TopNav />
      <main className="pt-20 px-4 max-w-lg mx-auto h-[calc(100vh-5rem)]">
        <div className="relative w-full h-full">
          <DishCard
            key={currentDish.id}
            dish={currentDish}
            onSwipe={handleSwipe}
            likesCount={likes}
            dislikesCount={dislikes}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
