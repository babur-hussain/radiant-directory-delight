import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { 
  Utensils, Hotel, ShoppingBag, Stethoscope, 
  GraduationCap, Car, Briefcase, HomeIcon, 
  Scissors, Wrench, Theater, Dumbbell,
  Heart, Coffee, Baby, Music, 
  Gamepad2, PawPrint, Plane, ShoppingCart, 
  Shirt, Phone, Monitor, Leaf,
  Camera, LayoutGrid, BookOpen, ChefHat
} from 'lucide-react';

// Main categories with icons and colors
const mainCategories = [
  { name: 'Restaurants', icon: Utensils, color: 'bg-red-50 text-red-500' },
  { name: 'Hotels', icon: Hotel, color: 'bg-blue-50 text-blue-500' },
  { name: 'Shopping', icon: ShoppingBag, color: 'bg-purple-50 text-purple-500' },
  // { name: 'Healthcare', icon: Stethoscope, color: 'bg-green-50 text-green-500' },
  { name: 'Education', icon: GraduationCap, color: 'bg-yellow-50 text-yellow-500' },
  { name: 'Automotive', icon: Car, color: 'bg-gray-50 text-gray-500' },
  { name: 'Professional', icon: Briefcase, color: 'bg-indigo-50 text-indigo-500' },
  // { name: 'Real Estate', icon: HomeIcon, color: 'bg-amber-50 text-amber-500' },
  { name: 'Beauty', icon: Scissors, color: 'bg-pink-50 text-pink-500' },
  { name: 'Repair', icon: Wrench, color: 'bg-teal-50 text-teal-500' },
  { name: 'Entertainment', icon: Theater, color: 'bg-cyan-50 text-cyan-500' },
  { name: 'Fitness', icon: Dumbbell, color: 'bg-lime-50 text-lime-500' },
];

// Additional categories with icons and colors
const additionalCategories = [
  { name: 'Cafes', icon: Coffee, color: 'bg-amber-50 text-amber-500' },
  { name: 'Childcare', icon: Baby, color: 'bg-pink-50 text-pink-500' },
  { name: 'Music', icon: Music, color: 'bg-indigo-50 text-indigo-500' },
  { name: 'Gaming', icon: Gamepad2, color: 'bg-purple-50 text-purple-500' },
  { name: 'Pet Services', icon: PawPrint, color: 'bg-orange-50 text-orange-500' },
  { name: 'Travel', icon: Plane, color: 'bg-sky-50 text-sky-500' },
  { name: 'Groceries', icon: ShoppingCart, color: 'bg-green-50 text-green-500' },
  { name: 'Fashion', icon: Shirt, color: 'bg-rose-50 text-rose-500' },
  { name: 'Electronics', icon: Phone, color: 'bg-blue-50 text-blue-500' },
  { name: 'Computers', icon: Monitor, color: 'bg-gray-50 text-gray-500' },
  { name: 'Garden', icon: Leaf, color: 'bg-emerald-50 text-emerald-500' },
  { name: 'Photography', icon: Camera, color: 'bg-violet-50 text-violet-500' },
  { name: 'Art Galleries', icon: LayoutGrid, color: 'bg-fuchsia-50 text-fuchsia-500' },
  { name: 'Bookstores', icon: BookOpen, color: 'bg-amber-50 text-amber-500' },
  { name: 'Bakeries', icon: ChefHat, color: 'bg-orange-50 text-orange-500' },
  { name: 'Wedding', icon: Heart, color: 'bg-red-50 text-red-500' },
];

// Subcategories grouped by main category
const subcategories = {
  'Restaurants': ['Fine Dining', 'Fast Food', 'Cafes', 'Buffet', 'Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese', 'Vegetarian'],
  'Hotels': ['5-Star Luxury', 'Budget Hotels', 'Resorts', 'Boutique Hotels', 'Bed & Breakfast', 'Hostels', 'Vacation Rentals'],
  'Shopping': ['Malls', 'Clothing', 'Electronics', 'Jewelry', 'Books', 'Home Decor', 'Grocery', 'Toys', 'Sports', 'Gifts'],
  'Healthcare': ['Hospitals', 'Clinics', 'Dentists', 'Pharmacies', 'Specialists', 'Mental Health', 'Alternative Medicine', 'Optometrists'],
  'Education': ['Schools', 'Colleges', 'Universities', 'Tutoring', 'Language Learning', 'Professional Training', 'Art Classes', 'Online Courses'],
  'Automotive': ['Car Dealers', 'Auto Repair', 'Car Wash', 'Auto Parts', 'Car Rental', 'Motorcycles', 'Service Stations', 'Tires', 'Body Shops'],
  'Professional': ['Lawyers', 'Accountants', 'Consultants', 'Financial Advisors', 'Insurance', 'Marketing', 'Web Design', 'Translation'],
  'Real Estate': ['For Sale', 'For Rent', 'Agents', 'Developers', 'Mortgage Brokers', 'Property Management', 'Commercial', 'Luxury'],
  'Beauty': ['Hair Salons', 'Nail Salons', 'Spas', 'Barbershops', 'Skin Care', 'Makeup Artists', 'Waxing', 'Massage'],
  'Repair': ['Phone Repair', 'Computer Repair', 'Appliance Repair', 'Home Repair', 'Shoe Repair', 'Watch Repair', 'Furniture Repair'],
  'Entertainment': ['Movie Theaters', 'Theme Parks', 'Arcades', 'Bowling', 'Karaoke', 'Comedy Clubs', 'Nightclubs', 'Live Music'],
  'Fitness': ['Gyms', 'Yoga Studios', 'Pilates', 'CrossFit', 'Swimming Pools', 'Sports Centers', 'Personal Trainers', 'Dance Studios'],
};

type AllCategoriesProps = {
  searchTerm: string;
};

const AllCategories = ({ searchTerm }: AllCategoriesProps) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  // Filter categories based on search term using useMemo for performance
  const filteredCategories = useMemo(() => {
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    
    if (!normalizedSearchTerm) {
      return { 
        main: mainCategories,
        additional: additionalCategories
      };
    }
    
    // Filter main categories
    const filteredMain = mainCategories.filter(category => 
      category.name.toLowerCase().includes(normalizedSearchTerm) ||
      // Also check subcategories
      (subcategories[category.name as keyof typeof subcategories]?.some(
        sub => sub.toLowerCase().includes(normalizedSearchTerm)
      ))
    );
    
    // Filter additional categories
    const filteredAdditional = additionalCategories.filter(category => 
      category.name.toLowerCase().includes(normalizedSearchTerm)
    );
    
    return { 
      main: filteredMain,
      additional: filteredAdditional
    };
  }, [searchTerm]);
  
  // Handle category expansion
  const toggleCategory = (categoryName: string) => {
    if (expandedCategory === categoryName) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryName);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        {/* Featured Categories Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Featured Categories</h2>
            <a 
              href="#all-categories" 
              className="text-sm font-medium text-primary hover:text-primary/90 transition-smooth"
            >
              View All Categories
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {filteredCategories.main.length > 0 ? (
              filteredCategories.main.map((category) => (
                <button 
                  key={category.name}
                  className="group text-left focus:outline-none"
                  onClick={() => toggleCategory(category.name)}
                  aria-expanded={expandedCategory === category.name}
                  aria-controls={`subcategories-${category.name}`}
                >
                  <div className="flex flex-col items-center p-6 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-smooth">
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
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No categories found matching "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Expanded Category View */}
        {expandedCategory && subcategories[expandedCategory as keyof typeof subcategories] && (
          <div className="mb-16 animate-fade-in" id={`subcategories-${expandedCategory}`}>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                {mainCategories.find(c => c.name === expandedCategory)?.icon && (
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    mainCategories.find(c => c.name === expandedCategory)?.color
                  )}>
                    {React.createElement(
                      mainCategories.find(c => c.name === expandedCategory)?.icon as React.ElementType,
                      { className: "h-5 w-5" }
                    )}
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900">{expandedCategory} Subcategories</h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {subcategories[expandedCategory as keyof typeof subcategories].map((subcat) => (
                  <Link 
                    key={subcat} 
                    to={`/category/${expandedCategory.toLowerCase()}`}
                    className="px-3 py-2 text-sm hover:bg-white rounded-lg hover:shadow-sm transition-all duration-200 text-gray-700 hover:text-primary"
                  >
                    {subcat}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All Categories Section */}
        <div id="all-categories">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">All Categories</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {[...filteredCategories.main, ...filteredCategories.additional].length > 0 ? (
              [...filteredCategories.main, ...filteredCategories.additional].map((category) => (
                <Link
                  key={category.name}
                  to={`/category/${category.name.toLowerCase()}`}
                  className="group flex flex-col items-center p-6 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-smooth"
                  aria-label={`Browse ${category.name} category`}
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
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No categories found matching "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AllCategories;
