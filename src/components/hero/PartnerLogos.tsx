
import React from 'react';

interface Partner {
  name: string;
  logo: string;
  alt: string;
}

interface PartnerLogosProps {
  partners: Partner[];
  className?: string;
}

const PartnerLogos: React.FC<PartnerLogosProps> = ({ partners, className = '' }) => {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-6 md:gap-8 ${className}`}>
      {partners.map((partner) => (
        <div key={partner.name} className="flex flex-col items-center">
          <img
            src={partner.logo}
            alt={partner.alt}
            className="h-8 md:h-10 object-contain grayscale hover:grayscale-0 transition-all duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://via.placeholder.com/150x50/e2e8f0/475569?text=" + partner.name;
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default PartnerLogos;
