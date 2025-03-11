
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import TopNav from '@/components/TopNav';
import DishCard from '@/components/DishCard';
import OrderEntry from '@/components/OrderEntry';
import { useToast } from '@/components/ui/use-toast';
import { 
  fetchDishesByOrderNumber, 
  submitRating, 
  getRatingsCount, 
  subscribeToRatings 
} from '@/services/dishService';
import { Dish, Rating } from '@/types/dish';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [currentDishIndex, setCurrentDishIndex] = useState(0);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [ratingsCount, setRatingsCount] = useState<Record<string, { likes: number; dislikes: number }>>({});
  const { toast } = useToast();

  // Fetch dishes based on order number
  const { 
    data: dishes, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['dishes', orderNumber],
    queryFn: () => orderNumber ? fetchDishesByOrderNumber(orderNumber) : Promise.resolve([]),
    enabled: !!orderNumber,
  });

  // Fetch initial ratings count for current dish
  useEffect(() => {
    const fetchRatingsCount = async () => {
      if (dishes && dishes.length > 0 && currentDishIndex < dishes.length) {
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

  const handleOrderSubmit = (number: string) => {
    setOrderNumber(number);
    setCurrentDishIndex(0);
  };

  const handleSwipe = async (direction: 'left' | 'right', dishId: string, comment: string = '') => {
    const rating = direction === 'right' ? 'like' : 'dislike';
    const message = direction === 'right' ? 'Loved it! 😋' : 'Maybe next time 👋';
    
    try {
      await submitRating(dishId, rating, comment);
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
    
    // Move to next dish or back to order entry if all dishes rated
    if (dishes && currentDishIndex < dishes.length - 1) {
      setCurrentDishIndex(prev => prev + 1);
    } else {
      // All dishes have been rated
      toast({
        title: 'All dishes rated!',
        description: 'Thank you for your feedback.',
        duration: 3000,
      });
      // Reset to order entry
      setOrderNumber(null);
    }
  };

  // Render order entry if no order number or no dishes
  if (!orderNumber || (dishes && dishes.length === 0 && !isLoading)) {
    return (
      <div className="min-h-screen bg-app-dark">
        <TopNav />
        <main className="pt-20 px-4 flex items-center justify-center h-[calc(100vh-5rem)]">
          {/* Primera fila: Texto y lista de órdenes de prueba */}
          <div className="w-full text-center">
            {/* Quisas mas adelante puedo cambiar esto a un selector para solo el usuario eliga su # de orden */}
            <p>Órdenes de prueba (ocupar estos ejemplos para la captura de orden):</p>
            <ul className="mt-2">
              <li>ORD-20250311-8745</li>
              <li>ORD-20250311-8746</li>
            </ul>
          </div>
          {/* Segunda fila: Entrada de orden y mensaje de error */}
          <div className="w-full flex flex-col items-center">
            <OrderEntry onOrderSubmit={handleOrderSubmit} />
            {orderNumber && dishes?.length === 0 && (
              <div className="mt-4 text-center text-app-muted">
                <p>No dishes found for this order. Try another order number or contact support.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-app-muted">Loading your dishes...</p>
        </div>
      </div>
    );
  }

  if (error || !dishes || dishes.length === 0) {
    return (
      <div className="min-h-screen bg-app-dark flex items-center justify-center">
        <div className="glass-effect p-8 rounded-2xl text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Oops! No dishes found</h2>
          <p className="text-app-muted mb-4">We couldn't find any dishes for your order. Please try again with a different order number.</p>
          <button 
            className="bg-primary px-4 py-2 rounded-md hover:bg-primary/80 transition-colors"
            onClick={() => setOrderNumber(null)}
          >
            Go Back
          </button>
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
        <div className="text-center mb-4">
          <p className="text-app-muted">
            Order #{orderNumber} • Dish {currentDishIndex + 1} of {dishes.length}
          </p>
        </div>
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
