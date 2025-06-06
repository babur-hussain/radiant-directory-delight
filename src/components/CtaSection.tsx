
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, ArrowRight, Star, Building, HandCoins } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const CtaSection = () => {
  const [hoveredInfluencer, setHoveredInfluencer] = useState(false);
  const [hoveredBusiness, setHoveredBusiness] = useState(false);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const pulse = {
    scale: [1, 1.02, 1],
    transition: { duration: 1.5, repeat: Infinity }
  };

  return (
    <section className="py-24 overflow-hidden bg-gradient-to-b from-white to-gray-50">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            Choose Your Path to Success
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Whether you're an influencer looking to monetize your audience or a business wanting to expand your reach, we have the perfect solution for you.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Influencer Card */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ delay: 0.3, duration: 0.6 }}
            animate={hoveredInfluencer ? pulse : {}}
          >
            <Card 
              className={`h-full p-8 ${hoveredInfluencer ? 'shadow-lg border-primary' : 'shadow-md'} transition-all duration-300 relative overflow-hidden`}
              onMouseEnter={() => setHoveredInfluencer(true)}
              onMouseLeave={() => setHoveredInfluencer(false)}
            >
              {/* Background Patterns */}
              <div className="absolute -right-16 -top-16 w-32 h-32 bg-primary/5 rounded-full"></div>
              <div className="absolute right-20 bottom-12 w-16 h-16 bg-blue-400/10 rounded-full"></div>

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <HandCoins className="w-8 h-8 text-primary" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Earn as an Influencer</h3>
                
                <p className="text-gray-600 mb-8">
                  Monetize your audience, collaborate with top brands, and turn your passion into a profitable career with our influencer programs.
                </p>
                
                <ul className="space-y-3 mb-8">
                  {[
                    { icon: Star, text: "Access exclusive brand partnerships" },
                    { icon: Users, text: "Grow your audience with our tools" },
                    { icon: TrendingUp, text: "Maximize your earning potential" }
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <item.icon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
                
                <Link to="/influencer">
                  <Button 
                    className={`w-full group ${hoveredInfluencer ? 'bg-primary/90' : ''}`}
                    size="lg"
                  >
                    Earn as Influencer
                    <ArrowRight className={`ml-2 w-4 h-4 ${hoveredInfluencer ? 'animate-pulse' : ''} group-hover:translate-x-1 transition-transform`} />
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>

          {/* Business Card */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ delay: 0.4, duration: 0.6 }}
            animate={hoveredBusiness ? pulse : {}}
          >
            <Card 
              className={`h-full p-8 ${hoveredBusiness ? 'shadow-lg border-primary' : 'shadow-md'} transition-all duration-300 relative overflow-hidden`}
              onMouseEnter={() => setHoveredBusiness(true)}
              onMouseLeave={() => setHoveredBusiness(false)}
            >
              {/* Background Patterns */}
              <div className="absolute -left-16 -top-16 w-32 h-32 bg-blue-400/5 rounded-full"></div>
              <div className="absolute left-20 bottom-12 w-16 h-16 bg-primary/10 rounded-full"></div>

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-blue-400/10 flex items-center justify-center mb-6">
                  <Building className="w-8 h-8 text-blue-500" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Grow Your Business</h3>
                
                <p className="text-gray-600 mb-8">
                  Leverage our network of influencers to expand your reach, build brand awareness, and drive conversions for your business.
                </p>
                
                <ul className="space-y-3 mb-8">
                  {[
                    { icon: Users, text: "Reach new target audiences" },
                    { icon: TrendingUp, text: "Boost brand visibility and engagement" },
                    { icon: Star, text: "Create authentic marketing campaigns" }
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <item.icon className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
                
                <Link to="/business">
                  <Button 
                    className={`w-full bg-blue-500 hover:bg-blue-600 group ${hoveredBusiness ? 'bg-blue-600' : ''}`}
                    size="lg"
                  >
                    Grow as Business
                    <ArrowRight className={`ml-2 w-4 h-4 ${hoveredBusiness ? 'animate-pulse' : ''} group-hover:translate-x-1 transition-transform`} />
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
