import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Users, Handshake, Building2 } from 'lucide-react';

interface StorageImage {
  name: string;
  url: string;
  alt: string;
}

const CollageFromStorage: React.FC = () => {
  const [images, setImages] = useState<StorageImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchImagesFromStorage();
  }, []);

  const fetchImagesFromStorage = async () => {
    try {
      console.log('Fetching images from collage-photos bucket...');
      setError(null);
      
      // List all files in the collage-photos bucket
      const { data: files, error } = await supabase.storage
        .from('collage-photos')
        .list('', {
          limit: 20,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        console.error('Error fetching images:', error);
        setError(`Error fetching images: ${error.message}`);
        setLoading(false);
        return;
      }

      console.log('Found files:', files);

      if (files && files.length > 0) {
        // Filter for actual files (not folders) and get public URLs
        const imageFiles = files.filter(file => {
          // Skip folders and system files
          if (!file.name || file.name.startsWith('.') || !file.id) return false;
          return true; // Accept all files since the bucket is specifically for images
        });

        console.log('Filtered image files:', imageFiles);

        if (imageFiles.length > 0) {
          const imagePromises = imageFiles.map(async (file) => {
            const { data } = supabase.storage
              .from('collage-photos')
              .getPublicUrl(file.name);
            
            console.log('Public URL for', file.name, ':', data.publicUrl);
            
            return {
              name: file.name,
              url: data.publicUrl,
              alt: `Business collaboration - ${file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ')}`
            };
          });

          const imageUrls = await Promise.all(imagePromises);
          console.log('Final image URLs:', imageUrls);
          setImages(imageUrls);
        } else {
          console.log('No valid files found in bucket');
          setImages([]);
        }
      } else {
        console.log('No files found in bucket');
        setImages([]);
      }
    } catch (error) {
      console.error('Error fetching images from storage:', error);
      setError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800">
              Real Connections, Real Results
            </h2>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show error if there's an issue
  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800">
              Real Connections, Real Results
            </h2>
            <p className="text-lg text-red-600 mb-8 max-w-3xl mx-auto">
              {error}
            </p>
            <p className="text-gray-600">
              Please upload images to the "collage-photos" bucket to see them displayed here.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Show default message when no images are available
  if (images.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800">
              Real Connections, Real Results
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              See how GROW BHARAT VYAPAAR brings businesses and influencers together across India. 
              Upload images to the "collage-photos" bucket to see our successful collaborations and partnerships in action.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">500+ Businesses</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">1000+ Influencers</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <Handshake className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">2500+ Collaborations</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <Camera className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium">Live Partnerships</span>
              </div>
            </div>
            
            {/* Placeholder grid when no images */}
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[400px] md:h-[600px]">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div 
                    key={index} 
                    className={`bg-gray-200 rounded-xl shadow-lg flex items-center justify-center ${
                      index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                    }`}
                  >
                    <Camera className="h-12 w-12 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800">
            Real Connections, Real Results
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            See how GROW BHARAT VYAPAAR brings businesses and influencers together across India. 
            These photos showcase our successful collaborations and partnerships in action.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">500+ Businesses</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <Users className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">1000+ Influencers</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <Handshake className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">2500+ Collaborations</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <Camera className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium">Live Partnerships</span>
            </div>
          </div>
        </div>
        
        {/* Photo Collage Grid */}
        <div className="max-w-6xl mx-auto">
          {/* Desktop Grid Layout */}
          <div className="hidden md:grid grid-cols-4 grid-rows-3 gap-4 h-[600px]">
            {images.slice(0, 8).map((image, index) => {
              // First image takes 2x2 space
              if (index === 0) {
                return (
                  <div key={image.name} className="col-span-2 row-span-2 relative group overflow-hidden rounded-2xl shadow-lg">
                    <img 
                      src={image.url} 
                      alt={image.alt}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        console.error('Failed to load image:', image.url);
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log('Successfully loaded image:', image.url);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 text-white">
                        <p className="text-sm font-medium">Featured Partnership</p>
                      </div>
                    </div>
                  </div>
                );
              }
              
              // Other images take regular 1x1 space
              return (
                <div key={image.name} className="relative group overflow-hidden rounded-xl shadow-lg">
                  <img 
                    src={image.url} 
                    alt={image.alt}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      console.error('Failed to load image:', image.url);
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('Successfully loaded image:', image.url);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-2 left-2 text-white">
                      <p className="text-xs font-medium">Business Visit</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Mobile Grid Layout */}
          <div className="md:hidden grid grid-cols-2 gap-3">
            {images.slice(0, 8).map((image, index) => (
              <div key={image.name} className="relative group overflow-hidden rounded-xl shadow-lg aspect-square">
                <img 
                  src={image.url} 
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    console.error('Failed to load image:', image.url);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('Successfully loaded image:', image.url);
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-2 left-2 text-white">
                    <p className="text-xs font-medium">Business Visit</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600 text-sm max-w-2xl mx-auto">
            Join thousands of businesses and influencers who trust GROW BHARAT VYAPAAR 
            for authentic partnerships and meaningful collaborations across India.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CollageFromStorage;
