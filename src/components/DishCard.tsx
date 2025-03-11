
import { useState } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { Star, X, Heart, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dish } from '@/types/dish';

interface DishCardProps {
  dish: Dish;
  onSwipe: (direction: 'left' | 'right', dishId: string, comment: string) => void;
  likesCount: number;
  dislikesCount: number;
}

const DishCard = ({ dish, onSwipe, likesCount, dislikesCount }: DishCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);
  const controls = useAnimation();

  const handleDragEnd = async (event: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (Math.abs(velocity) >= 500 || Math.abs(offset) > 100) {
      const direction = offset > 0 ? 'right' : 'left';
      await controls.start({
        x: direction === 'right' ? 1000 : -1000,
        opacity: 0,
        transition: { duration: 0.3 }
      });
      onSwipe(direction, dish.id, comment);
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
    setIsDragging(false);
  };

  const toggleComment = () => {
    setShowComment(!showComment);
  };

  return (
    <motion.div
      className="swipe-card glass-effect rounded-3xl overflow-hidden card-shadow"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      animate={controls}
      whileTap={{ scale: 1.05 }}
    >
      <div className="relative h-[70vh] w-full">
        <img
          src={dish.image_url}
          alt={dish.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
          <h2 className="text-2xl font-bold mb-2">{dish.name}</h2>
          <p className="text-app-muted mb-3">{dish.restaurant}</p>
          <div className="flex gap-2 flex-wrap mb-4">
            {dish.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="glass-effect">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xl font-semibold">{dish.price}</p>
            <div className="flex gap-3 items-center">
              <div className="flex items-center">
                <Heart className="w-5 h-5 text-green-500 mr-1" />
                <span>{likesCount}</span>
              </div>
              <div className="flex items-center">
                <X className="w-5 h-5 text-red-500 mr-1" />
                <span>{dislikesCount}</span>
              </div>
            </div>
          </div>
          
          {showComment && (
            <div className="mt-4">
              <Textarea
                placeholder="Add your comment about this dish..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
                rows={3}
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-8 p-4">
        <button
          className="p-4 rounded-full bg-gray-500/20 hover:bg-gray-500/30 transition-colors"
          onClick={toggleComment}
        >
          <MessageCircle className="w-8 h-8 text-white" />
        </button>
        <button
          className="p-4 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors"
          onClick={() => onSwipe('left', dish.id, comment)}
        >
          <X className="w-8 h-8 text-red-500" />
        </button>
        <button
          className="p-4 rounded-full bg-green-500/20 hover:bg-green-500/30 transition-colors"
          onClick={() => onSwipe('right', dish.id, comment)}
        >
          <Heart className="w-8 h-8 text-green-500" />
        </button>
      </div>
    </motion.div>
  );
};

export default DishCard;
