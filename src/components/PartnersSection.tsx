
import React from 'react';
import { motion } from 'framer-motion';

const partnerLogos = [
  {
    name: 'Google',
    logo: '/assets/logos/google.svg',
    alt: 'Google logo',
  },
  {
    name: 'Microsoft',
    logo: '/assets/logos/microsoft.svg',
    alt: 'Microsoft logo',
  },
  {
    name: 'Meta',
    logo: '/assets/logos/meta.svg',
    alt: 'Meta logo',
  },
  {
    name: 'Amazon',
    logo: '/assets/logos/amazon.svg',
    alt: 'Amazon logo',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

const PartnersSection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Partners</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Trusted by leading companies across the globe
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {partnerLogos.map((partner) => (
            <motion.div
              key={partner.name}
              className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              variants={itemVariants}
            >
              <div className="h-20 flex items-center justify-center mb-4">
                <img
                  src={partner.logo}
                  alt={partner.alt}
                  className="h-12 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://via.placeholder.com/150x50/e2e8f0/475569?text=" + partner.name;
                  }}
                />
              </div>
              <p className="text-sm text-gray-500">We have worked with</p>
              <p className="text-xl font-semibold text-gray-800">{partner.name}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="bg-primary/10 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Trusted By Businesses</h3>
          <p className="text-4xl font-bold text-primary mb-2">25,000+</p>
          <p className="text-lg text-gray-600">
            Businesses have partnered with us to grow their presence and reach new customers
          </p>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
