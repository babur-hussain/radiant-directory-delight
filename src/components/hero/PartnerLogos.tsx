
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Partner {
  name: string;
  logoUrl: string;
  alt: string;
  width: number;
  height: number;
}

interface PartnerLogosProps {
  partners: Partner[];
  className?: string;
}

const PartnerLogos: React.FC<PartnerLogosProps> = ({ partners, className = '' }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 ${className}`}>
      {partners.map((partner) => (
        <div 
          key={partner.name} 
          className="flex flex-col items-center justify-center p-3 md:p-6 bg-white/50 backdrop-blur-sm rounded-lg hover:shadow-md transition-all duration-300"
        >
          <div className="h-16 md:h-20 flex items-center justify-center mb-2 md:mb-4 w-full">
            <img
              src={partner.logoUrl}
              alt={partner.alt}
              className="h-8 md:h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
              style={{ 
                aspectRatio: `${partner.width}/${partner.height}`,
                maxWidth: isMobile ? '80px' : '120px'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://via.placeholder.com/150x50/e2e8f0/475569?text=" + partner.name;
              }}
            />
          </div>
          <p className="text-xs md:text-sm text-gray-500">We have worked with</p>
          <p className="text-sm md:text-lg font-semibold text-gray-800">{partner.name}</p>
        </div>
      ))}
    </div>
  );
};

export default PartnerLogos;
