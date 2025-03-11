
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

interface OrderEntryProps {
  onOrderSubmit: (orderNumber: string) => void;
}

const OrderEntry = ({ onOrderSubmit }: OrderEntryProps) => {
  const [orderNumber, setOrderNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber.trim()) {
      toast({
        title: 'Please enter an order number',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }
    
    setIsLoading(true);
    
    // Call the parent component's handler
    try {
      onOrderSubmit(orderNumber.trim());
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: 'Error submitting order',
        description: 'Please try again later',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-effect p-8 rounded-2xl max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Enter Your Order Number</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="e.g. ORDER123"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
        />
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full bg-primary hover:bg-primary/80"
        >
          {isLoading ? 'Loading...' : 'View My Dishes'}
        </Button>
      </form>
    </div>
  );
};

export default OrderEntry;
