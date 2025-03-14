
import { useState } from 'react';
import AllCategories from '@/components/AllCategories';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

const CategoriesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const handleTagClick = (tag: string) => {
    if (activeTag === tag) {
      // Clear the tag if clicking the active one
      setActiveTag(null);
      setSearchTerm('');
    } else {
      // Set the new active tag and update search
      setActiveTag(tag);
      setSearchTerm(tag);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-8 hero-section">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Browse All Categories
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mb-8">
                Discover and explore businesses across various categories to find exactly what you need.
              </p>
              
              {/* Search Bar */}
              <div className="relative w-full max-w-2xl mb-8">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search categories"
                />
                {searchTerm && (
                  <button 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => {
                      setSearchTerm('');
                      setActiveTag(null);
                    }}
                    aria-label="Clear search"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Popular Tags */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                <Badge 
                  className={`cursor-pointer ${activeTag === 'Popular' ? 'bg-blue-300' : 'bg-blue-100'} hover:bg-blue-200 text-blue-800 border-0`}
                  onClick={() => handleTagClick('Popular')}
                >
                  Popular
                </Badge>
                <Badge 
                  className={`cursor-pointer ${activeTag === 'Trending' ? 'bg-green-300' : 'bg-green-100'} hover:bg-green-200 text-green-800 border-0`}
                  onClick={() => handleTagClick('Trending')}
                >
                  Trending
                </Badge>
                <Badge 
                  className={`cursor-pointer ${activeTag === 'Services' ? 'bg-purple-300' : 'bg-purple-100'} hover:bg-purple-200 text-purple-800 border-0`}
                  onClick={() => handleTagClick('Services')}
                >
                  Services
                </Badge>
                <Badge 
                  className={`cursor-pointer ${activeTag === 'Shopping' ? 'bg-amber-300' : 'bg-amber-100'} hover:bg-amber-200 text-amber-800 border-0`}
                  onClick={() => handleTagClick('Shopping')}
                >
                  Shopping
                </Badge>
                <Badge 
                  className={`cursor-pointer ${activeTag === 'Food' ? 'bg-pink-300' : 'bg-pink-100'} hover:bg-pink-200 text-pink-800 border-0`}
                  onClick={() => handleTagClick('Food')}
                >
                  Food
                </Badge>
                <Badge 
                  className={`cursor-pointer ${activeTag === 'Health' ? 'bg-cyan-300' : 'bg-cyan-100'} hover:bg-cyan-200 text-cyan-800 border-0`}
                  onClick={() => handleTagClick('Health')}
                >
                  Health
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <AllCategories searchTerm={searchTerm} />
      </main>
    </div>
  );
};

export default CategoriesPage;
