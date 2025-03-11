
import { useState } from 'react';
import TopNav from '@/components/TopNav';
import DishCard from '@/components/DishCard';
import { useToast } from '@/components/ui/use-toast';

// Sample data - in a real app this would come from an API
const sampleDishes = [
  {
    id: '1',
    name: 'Truffle Pasta',
    restaurant: 'La Pasta House',
    price: '$24.99',
    image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601',
    tags: ['Italian', 'Pasta', 'Vegetarian']
  },
  {
    id: '2',
    name: 'Wagyu Burger',
    restaurant: 'Gourmet Burgers',
    price: '$32.99',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
    tags: ['American', 'Burger', 'Premium']
  },
  // Add more dishes here
];

const Index = () => {
  const [currentDishIndex, setCurrentDishIndex] = useState(0);
  const { toast } = useToast();

  const handleSwipe = (direction: 'left' | 'right') => {
    const message = direction === 'right' ? 'Loved it! 😋' : 'Maybe next time 👋';
    toast({
      title: message,
      duration: 1500,
    });
    
    // Move to next dish
    setCurrentDishIndex((prev) => 
      prev < sampleDishes.length - 1 ? prev + 1 : 0
    );
  };

  return (
    <div className="min-h-screen bg-app-dark">
      <TopNav />
      <main className="pt-20 px-4 max-w-lg mx-auto h-[calc(100vh-5rem)]">
        <div className="relative w-full h-full">
          <DishCard
            key={sampleDishes[currentDishIndex].id}
            dish={sampleDishes[currentDishIndex]}
            onSwipe={handleSwipe}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
