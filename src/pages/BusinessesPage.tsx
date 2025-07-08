
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TablePagination from "@/components/admin/table/TablePagination";
import BusinessesHeader from "@/components/businesses/BusinessesPage/BusinessesHeader";
import ActiveFiltersDisplay from "@/components/businesses/BusinessesPage/ActiveFiltersDisplay";
import BusinessesSorting from "@/components/businesses/BusinessesPage/BusinessesSorting";
import BusinessesGrid from "@/components/businesses/BusinessesPage/BusinessesGrid";
import { useBusinessPageData } from "@/hooks/useBusinessPageData";
import { BusinessPageLoading } from "@/components/businesses/BusinessPageLoading";
import { useBusinessSearchFilter } from "@/hooks/useBusinessSearchFilter";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const BusinessesPage = () => {
  const [openFilters, setOpenFilters] = useState(false);
  const location = useLocation();
  const [isSearching, setIsSearching] = useState(false);
  const [businessDialogOpen, setBusinessDialogOpen] = useState(false);
  const [businessForm, setBusinessForm] = useState({ business_name: '', contact: '', location: '', category: '' });
  const [businessFormStatus, setBusinessFormStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Get search param from URL if present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }
  }, [location.search]);

  const {
    loading,
    businesses: currentBusinesses,
    filteredBusinesses,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedRating,
    setSelectedRating,
    selectedLocation,
    setSelectedLocation,
    currentPage,
    setCurrentPage,
    featuredOnly,
    setFeaturedOnly,
    sortBy,
    setSortBy,
    activeTags,
    toggleTag,
    locations,
    allTags,
    clearAllFilters,
    activeFilterCount,
    totalPages
  } = useBusinessPageData();
  
  // Handle search state
  useEffect(() => {
    if (searchQuery) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  const handleBusinessFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusinessForm({ ...businessForm, [e.target.name]: e.target.value });
  };

  const handleSubmitBusinessForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusinessFormStatus(null);
    try {
      const { error } = await supabase.from('business_applications').insert([{
        business_name: businessForm.business_name,
        contact: businessForm.contact,
        location: businessForm.location,
        category: businessForm.category,
        created_at: new Date().toISOString(),
      }]);
      if (error) throw error;
      setBusinessFormStatus({ success: true, message: 'Your business application has been submitted successfully.' });
      setBusinessForm({ business_name: '', contact: '', location: '', category: '' });
      setTimeout(() => {
        setBusinessDialogOpen(false);
        setBusinessFormStatus(null);
      }, 4000);
    } catch (err) {
      setBusinessFormStatus({ success: false, message: 'Submission failed. Please try again.' });
    }
  };
  
  if (loading) {
    return <BusinessPageLoading />;
  }
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Business Application Section */}
      <section className="relative py-12 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden mb-8 rounded-2xl shadow-md">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-pink-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-2 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">Register Your Business & get Connected with Lakhs of Influencers</h2>
          <p className="text-lg text-gray-600 mb-6 text-center max-w-2xl">Join our platform and connect with India's largest influencer network. Submit your business details to get started!</p>
          <Dialog open={businessDialogOpen} onOpenChange={setBusinessDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="w-full max-w-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg font-semibold py-3 rounded-xl shadow-lg mb-4"
                onClick={() => setBusinessDialogOpen(true)}
              >
                Register Your Business
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg w-full p-0 bg-transparent border-0 shadow-none">
              <div className="relative bg-white rounded-2xl shadow-2xl border-0 overflow-hidden max-h-[90vh] w-full flex flex-col" style={{ boxShadow: '0 8px 32px 0 rgba(99,102,241,0.15)' }}>
                {/* Gradient Accent Bar */}
                <div className="h-2 w-full bg-gradient-to-r from-purple-500 via-blue-400 to-pink-400" />
                <div className="p-8 overflow-y-auto flex-1">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Business Listing Form</DialogTitle>
                    <DialogDescription>Fill out your business details to join our platform.</DialogDescription>
                  </DialogHeader>
                  <form className="space-y-5 mt-2" onSubmit={handleSubmitBusinessForm}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Business Name</label>
                      <input type="text" name="business_name" value={businessForm.business_name} onChange={handleBusinessFormChange} required placeholder="e.g. Sharma Fashion House" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number or Email</label>
                      <input type="text" name="contact" value={businessForm.contact} onChange={handleBusinessFormChange} required placeholder="e.g. 9876543210 or info@yourbusiness.com" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City & State</label>
                      <input type="text" name="location" value={businessForm.location} onChange={handleBusinessFormChange} required placeholder="e.g. Mumbai, Maharashtra" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Category (e.g. Fashion, Tech, Food)</label>
                      <input type="text" name="category" value={businessForm.category} onChange={handleBusinessFormChange} required placeholder="e.g. Fashion, Tech, Food" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 bg-white" />
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg font-semibold py-2 rounded-lg">Submit</Button>
                    </DialogFooter>
                    {businessFormStatus && (
                      <div className={`flex items-center justify-center gap-2 text-center text-sm mt-2 ${businessFormStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                        {businessFormStatus.success ? <span>✅</span> : <span>⚠️</span>}
                        {businessFormStatus.message}
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Discover Local Businesses</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find the best businesses in your area. Use the search and filters to narrow down your options.
        </p>
      </div>
      
      <BusinessesHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeFilterCount={activeFilterCount}
        setOpenFilters={setOpenFilters}
        openFilters={openFilters}
        featuredOnly={featuredOnly}
        setFeaturedOnly={setFeaturedOnly}
        clearAllFilters={clearAllFilters}
        allTags={allTags}
        activeTags={activeTags}
        toggleTag={toggleTag}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        locations={locations}
        selectedRating={selectedRating}
        setSelectedRating={setSelectedRating}
      />
      
      <BusinessesSorting 
        sortBy={sortBy}
        setSortBy={setSortBy}
        filteredCount={currentBusinesses.length}
        totalCount={filteredBusinesses.length}
      />
      
      <ActiveFiltersDisplay 
        selectedCategory={selectedCategory}
        selectedLocation={selectedLocation}
        selectedRating={selectedRating}
        featuredOnly={featuredOnly}
        activeTags={activeTags}
        setSelectedCategory={setSelectedCategory}
        setSelectedLocation={setSelectedLocation}
        setSelectedRating={setSelectedRating}
        setFeaturedOnly={setFeaturedOnly}
        toggleTag={toggleTag}
        clearAllFilters={clearAllFilters}
        activeFilterCount={activeFilterCount}
      />
      
      <BusinessesGrid 
        businesses={currentBusinesses}
        clearAllFilters={clearAllFilters}
        isSearching={isSearching}
      />
      
      {totalPages > 1 && (
        <div className="flex justify-center my-8">
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default BusinessesPage;
