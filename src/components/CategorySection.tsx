
import { Link } from 'react-router-dom';
import { 
  Utensils, Hotel, ShoppingBag, Stethoscope, 
  GraduationCap, Car, Briefcase, HomeIcon, 
  Scissors, Wrench, Theater, Dumbbell 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
  { name: 'Restaurants', icon: Utensils, color: 'bg-red-50 text-red-500' },
  { name: 'Hotels', icon: Hotel, color: 'bg-blue-50 text-blue-500' },
  { name: 'Shopping', icon: ShoppingBag, color: 'bg-purple-50 text-purple-500' },
  { name: 'Healthcare', icon: Stethoscope, color: 'bg-green-50 text-green-500' },
  { name: 'Education', icon: GraduationCap, color: 'bg-yellow-50 text-yellow-500' },
  { name: 'Automotive', icon: Car, color: 'bg-gray-50 text-gray-500' },
  { name: 'Professional', icon: Briefcase, color: 'bg-indigo-50 text-indigo-500' },
  { name: 'Real Estate', icon: HomeIcon, color: 'bg-amber-50 text-amber-500' },
  { name: 'Beauty', icon: Scissors, color: 'bg-pink-50 text-pink-500' },
  { name: 'Repair', icon: Wrench, color: 'bg-teal-50 text-teal-500' },
  { name: 'Entertainment', icon: Theater, color: 'bg-cyan-50 text-cyan-500' },
  { name: 'Fitness', icon: Dumbbell, color: 'bg-lime-50 text-lime-500' },
];

const CategorySection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse Categories</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Explore businesses across various categories to find exactly what you need.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/category/${category.name.toLowerCase()}`}
              className="group flex flex-col items-center p-6 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-smooth"
            >
              <div
                className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110",
                  category.color
                )}
              >
                <category.icon className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 text-center group-hover:text-primary transition-smooth">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link 
            to="/categories"
            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/90 transition-smooth"
          >
            View All Categories
            <svg 
              className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
