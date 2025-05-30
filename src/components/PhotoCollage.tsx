
import React from 'react';
import { Camera, Users, Handshake, Building2 } from 'lucide-react';

const PhotoCollage: React.FC = () => {
  const photos = [
    {
      src: '/lovable-uploads/0c2cba8d-5522-4895-938c-2c2e97bd317c.png',
      alt: 'Business visit - Electronics store collaboration'
    },
    {
      src: '/lovable-uploads/d5ff5e0a-6540-407f-86b7-39501ba92ef4.png',
      alt: 'Business meeting - Jewelry store partnership'
    },
    {
      src: '/lovable-uploads/3cfc8fce-7c3d-42c1-b998-391697f8a22b.png',
      alt: 'Business collaboration - Office supplies store'
    },
    {
      src: '/lovable-uploads/b95dd1d1-6f76-42f3-a9cf-8d448b702150.png',
      alt: 'Professional meeting - Business consultation'
    },
    {
      src: '/lovable-uploads/76f9acff-1106-4a0a-8ae3-29972438ab36.png',
      alt: 'Store visit - Jewelry and accessories business'
    },
    {
      src: '/lovable-uploads/4cbcb3a6-c304-440a-b500-c1d16d70b1a1.png',
      alt: 'Business partnership - Gift store collaboration'
    },
    {
      src: '/lovable-uploads/2cd03c84-0059-4e42-942e-6cffdda881b0.png',
      alt: 'Store visit - Books and stationery business'
    },
    {
      src: '/lovable-uploads/9b04922c-cd5c-4fa5-b632-190ceef7f974.png',
      alt: 'Business meeting - Lighting and fixtures store'
    }
  ];

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
            {/* Large featured photo */}
            <div className="col-span-2 row-span-2 relative group overflow-hidden rounded-2xl shadow-lg">
              <img 
                src={photos[0].src} 
                alt={photos[0].alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-sm font-medium">Electronics & Technology</p>
                </div>
              </div>
            </div>
            
            {/* Medium photos */}
            <div className="relative group overflow-hidden rounded-xl shadow-lg">
              <img 
                src={photos[1].src} 
                alt={photos[1].alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-2 left-2 text-white">
                  <p className="text-xs font-medium">Jewelry & Accessories</p>
                </div>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-xl shadow-lg">
              <img 
                src={photos[2].src} 
                alt={photos[2].alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-2 left-2 text-white">
                  <p className="text-xs font-medium">Office Supplies</p>
                </div>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-xl shadow-lg">
              <img 
                src={photos[3].src} 
                alt={photos[3].alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-2 left-2 text-white">
                  <p className="text-xs font-medium">Professional Services</p>
                </div>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-xl shadow-lg">
              <img 
                src={photos[4].src} 
                alt={photos[4].alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-2 left-2 text-white">
                  <p className="text-xs font-medium">Luxury Goods</p>
                </div>
              </div>
            </div>
            
            {/* Bottom row */}
            <div className="relative group overflow-hidden rounded-xl shadow-lg">
              <img 
                src={photos[5].src} 
                alt={photos[5].alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-2 left-2 text-white">
                  <p className="text-xs font-medium">Gift & Party</p>
                </div>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-xl shadow-lg">
              <img 
                src={photos[6].src} 
                alt={photos[6].alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-2 left-2 text-white">
                  <p className="text-xs font-medium">Books & Education</p>
                </div>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-xl shadow-lg">
              <img 
                src={photos[7].src} 
                alt={photos[7].alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-2 left-2 text-white">
                  <p className="text-xs font-medium">Home & Lighting</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Grid Layout */}
          <div className="md:hidden grid grid-cols-2 gap-3">
            {photos.map((photo, index) => (
              <div key={index} className="relative group overflow-hidden rounded-xl shadow-lg aspect-square">
                <img 
                  src={photo.src} 
                  alt={photo.alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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

export default PhotoCollage;
