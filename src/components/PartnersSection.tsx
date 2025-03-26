
import React from 'react';
import { motion } from 'framer-motion';
import PartnerLogos from './hero/PartnerLogos';

const partnerLogos = [
  {
    name: 'Google',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
    alt: 'Google logo',
    width: 24,
    height: 24
  },
  {
    name: 'Microsoft',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
    alt: 'Microsoft logo',
    width: 512,
    height: 109
  },
  {
    name: 'Meta',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
    alt: 'Meta logo',
    width: 948,
    height: 191
  },
  {
    name: 'Amazon',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    alt: 'Amazon logo',
    width: 603,
    height: 182
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
    <section className="py-12 md:py-16 bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Our Partners</h2>
          <div className="w-16 md:w-20 h-1 bg-primary mx-auto mb-4 md:mb-6"></div>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Trusted by leading companies across the globe
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <PartnerLogos partners={partnerLogos} className="mb-10 md:mb-12" />
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
