
import React from 'react';
import { motion } from 'framer-motion';
import PartnerLogos from './hero/PartnerLogos';

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
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Our Partners</h2>
          <div className="w-16 md:w-20 h-1 bg-primary mx-auto mb-4 md:mb-6"></div>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Trusted by leading companies across the globe
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <PartnerLogos partners={partnerLogos} className="mb-12" />
        </div>

        <motion.div 
          className="bg-primary/10 rounded-lg md:rounded-xl p-6 md:p-8 text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Trusted By Businesses</h3>
          <p className="text-3xl md:text-4xl font-bold text-primary mb-2">25,000+</p>
          <p className="text-base md:text-lg text-gray-600">
            Businesses have partnered with us to grow their presence and reach new customers
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PartnersSection;
