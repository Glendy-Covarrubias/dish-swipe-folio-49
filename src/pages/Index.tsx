
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import TopNav from '@/components/TopNav';
import DishCard from '@/components/DishCard';
import { useToast } from '@/components/ui/use-toast';
import { fetchDishes, submitRating, getRatingsCount, subscribeToRatings } from '@/services/dishService';
import { Dish, Rating } from '@/types/dish';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [currentDishIndex, setCurrentDishIndex] = useState(0);
  const [ratingsCount, setRatingsCount] = useState<Record<string, { likes: number; dislikes: number }>>({});
  const { toast } = useToast();

  const { data: dishes, isLoading, error } = useQuery({
    queryKey: ['dishes'],
    queryFn: fetchDishes,
  });

  // Fetch initial ratings count for current dish
  useEffect(() => {
    const fetchRatingsCount = async () => {
      if (dishes && dishes[currentDishIndex]) {
        const dishId = dishes[currentDishIndex].id;
        const counts = await getRatingsCount(dishId);
        setRatingsCount(prev => ({ ...prev, [dishId]: counts }));
      }
    };
    fetchRatingsCount();
  }, [currentDishIndex, dishes]);

  // Set up realtime subscription to ratings
  useEffect(() => {
    const unsubscribe = subscribeToRatings(async (payload) => {
      const newRating = payload.new as Rating;
      const dishId = newRating.dish_id;
      const counts = await getRatingsCount(dishId);
      setRatingsCount(prev => ({ ...prev, [dishId]: counts }));
    });

    return () => {
      unsubscribe();
    };
  }, []);

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
    
    setCurrentDishIndex((prev) => 
      prev < (dishes?.length || 1) - 1 ? prev + 1 : 0
    );
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
  const currentRatings = ratingsCount[currentDish.id] || { likes: 0, dislikes: 0 };

  return (
    <div className="min-h-screen bg-app-dark">
      <TopNav />
      <main className="pt-20 px-4 max-w-lg mx-auto h-[calc(100vh-5rem)]">
        <div className="relative w-full h-full">
          <DishCard
            key={currentDish.id}
            dish={currentDish}
            onSwipe={handleSwipe}
            likesCount={currentRatings.likes}
            dislikesCount={currentRatings.dislikes}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
