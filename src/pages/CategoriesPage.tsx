
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AllCategories from '@/components/AllCategories';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

const CategoriesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-20">
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
                />
              </div>
              
              {/* Popular Tags */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                <Badge className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-800 border-0">Popular</Badge>
                <Badge className="cursor-pointer bg-green-100 hover:bg-green-200 text-green-800 border-0">Trending</Badge>
                <Badge className="cursor-pointer bg-purple-100 hover:bg-purple-200 text-purple-800 border-0">Services</Badge>
                <Badge className="cursor-pointer bg-amber-100 hover:bg-amber-200 text-amber-800 border-0">Shopping</Badge>
                <Badge className="cursor-pointer bg-pink-100 hover:bg-pink-200 text-pink-800 border-0">Food</Badge>
                <Badge className="cursor-pointer bg-cyan-100 hover:bg-cyan-200 text-cyan-800 border-0">Health</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <AllCategories searchTerm={searchTerm} />
      </main>
      <Footer />
    </div>
  );
};

export default CategoriesPage;
