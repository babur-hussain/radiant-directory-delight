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

  useEffect(() => {
    fetchImagesFromStorage();
  }, []);

  const fetchImagesFromStorage = async () => {
    try {
      // List all files in the collageimages bucket
      const { data: files, error } = await supabase.storage
        .from('collageimages')
        .list('', {
          limit: 20,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        console.error('Error fetching images:', error);
        setLoading(false);
        return;
      }

      if (files) {
        // Get public URLs for each image
        const imagePromises = files
          .filter(file => file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/))
          .map(async (file) => {
            const { data } = supabase.storage
              .from('collageimages')
              .getPublicUrl(file.name);
            
            return {
              name: file.name,
              url: data.publicUrl,
              alt: `Business collaboration - ${file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ')}`
            };
          });

        const imageUrls = await Promise.all(imagePromises);
        setImages(imageUrls);
      }
    } catch (error) {
      console.error('Error fetching images from storage:', error);
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

  if (images.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800">
              Real Connections, Real Results
            </h2>
            <p className="text-lg text-gray-600">
              Upload images to the collageimages bucket to see them displayed here.
            </p>
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
