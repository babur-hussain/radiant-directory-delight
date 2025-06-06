
import { 
  Utensils, Hotel, ShoppingBag, Stethoscope, 
  GraduationCap, Car, Briefcase, HomeIcon, 
  Scissors, Wrench, Theater, Dumbbell,
  Coffee, Baby, Music, Gamepad2, PawPrint, 
  Plane, ShoppingCart, Shirt, Phone, Monitor, 
  Leaf, Camera, LayoutGrid, BookOpen, ChefHat,
  Heart, Building2, LucideIcon
} from 'lucide-react';

export const getCategoryIcon = (categoryName: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    'Restaurants': Utensils,
    'Hotels': Hotel,
    'Shopping': ShoppingBag,
    'Healthcare': Stethoscope,
    'Education': GraduationCap,
    'Automotive': Car,
    'Professional': Briefcase,
    'Real Estate': HomeIcon,
    'Beauty': Scissors,
    'Repair': Wrench,
    'Entertainment': Theater,
    'Fitness': Dumbbell,
    'Cafes': Coffee,
    'Childcare': Baby,
    'Music': Music,
    'Gaming': Gamepad2,
    'Pet Services': PawPrint,
    'Travel': Plane,
    'Groceries': ShoppingCart,
    'Fashion': Shirt,
    'Electronics': Phone,
    'Computers': Monitor,
    'Garden': Leaf,
    'Photography': Camera,
    'Art Galleries': LayoutGrid,
    'Bookstores': BookOpen,
    'Bakeries': ChefHat,
    'Wedding': Heart,
    'Technology': Monitor,
    'Food & Dining': Utensils,
    'Handicrafts': Scissors,
    'Marketing': Building2
  };

  // Return the matching icon or Briefcase as default
  return iconMap[categoryName] || Briefcase;
};

export const getCategoryColor = (categoryName: string): string => {
  const colorMap: Record<string, string> = {
    'Restaurants': 'bg-red-50 text-red-500',
    'Hotels': 'bg-blue-50 text-blue-500',
    'Shopping': 'bg-purple-50 text-purple-500',
    'Healthcare': 'bg-green-50 text-green-500',
    'Education': 'bg-yellow-50 text-yellow-500',
    'Automotive': 'bg-gray-50 text-gray-500',
    'Professional': 'bg-indigo-50 text-indigo-500',
    'Real Estate': 'bg-amber-50 text-amber-500',
    'Beauty': 'bg-pink-50 text-pink-500',
    'Repair': 'bg-teal-50 text-teal-500',
    'Entertainment': 'bg-cyan-50 text-cyan-500',
    'Fitness': 'bg-lime-50 text-lime-500',
    'Cafes': 'bg-amber-50 text-amber-500',
    'Childcare': 'bg-pink-50 text-pink-500',
    'Music': 'bg-indigo-50 text-indigo-500',
    'Gaming': 'bg-purple-50 text-purple-500',
    'Pet Services': 'bg-orange-50 text-orange-500',
    'Travel': 'bg-sky-50 text-sky-500',
    'Groceries': 'bg-green-50 text-green-500',
    'Fashion': 'bg-rose-50 text-rose-500',
    'Electronics': 'bg-blue-50 text-blue-500',
    'Computers': 'bg-gray-50 text-gray-500',
    'Garden': 'bg-emerald-50 text-emerald-500',
    'Photography': 'bg-violet-50 text-violet-500',
    'Art Galleries': 'bg-fuchsia-50 text-fuchsia-500',
    'Bookstores': 'bg-amber-50 text-amber-500',
    'Bakeries': 'bg-orange-50 text-orange-500',
    'Wedding': 'bg-red-50 text-red-500',
    'Technology': 'bg-blue-50 text-blue-500',
    'Food & Dining': 'bg-red-50 text-red-500',
    'Handicrafts': 'bg-amber-50 text-amber-500',
    'Marketing': 'bg-indigo-50 text-indigo-500'
  };

  // Return the matching color or a default color
  return colorMap[categoryName] || 'bg-gray-50 text-gray-500';
};
