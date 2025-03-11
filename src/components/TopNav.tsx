
import { Bell, Settings } from 'lucide-react';

const TopNav = () => {
  return (
    <nav className="fixed top-0 w-full z-50 px-4 py-3 glass-effect">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary-DEFAULT">DishSwipe</h1>
        <div className="flex gap-4">
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <Bell className="w-6 h-6" />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
