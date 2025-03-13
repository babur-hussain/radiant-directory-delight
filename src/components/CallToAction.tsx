
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Building, Users, TrendingUp } from 'lucide-react';

const stats = [
  { 
    icon: Building, 
    value: '15,000+', 
    label: 'Businesses',
    color: 'text-blue-500'
  },
  { 
    icon: Users, 
    value: '2M+', 
    label: 'Active Users',
    color: 'text-green-500' 
  },
  { 
    icon: ShieldCheck, 
    value: '99.9%', 
    label: 'Satisfaction',
    color: 'text-purple-500' 
  },
  { 
    icon: TrendingUp, 
    value: '45%', 
    label: 'Growth Rate',
    color: 'text-amber-500' 
  }
];

const CallToAction = () => {
  const [email, setEmail] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Subscribing email:', email);
    // Handle subscription logic here
  };

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-400/5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-50"></div>
      
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Business Directory</h2>
          <p className="text-lg text-gray-600">
            List your business on DirectSpot and reach thousands of potential customers searching for services like yours.
          </p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center bg-white p-6 rounded-xl shadow-sm"
            >
              <div className={`mb-3 ${stat.color}`}>
                <stat.icon className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
        
        {/* Newsletter */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 animate-scale-in">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-2/3 mb-8 md:mb-0 md:pr-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Subscribe to Our Newsletter
              </h3>
              <p className="text-gray-600 mb-6">
                Get updates on new businesses, exclusive offers, and tips for growing your business.
              </p>
              
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-grow px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-smooth"
                />
                <Button type="submit" className="rounded-lg transition-smooth">
                  Subscribe
                </Button>
              </form>
            </div>
            
            <div className="w-full md:w-1/3 md:pl-8 md:border-l border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center md:text-left">
                Add Your Business
              </h3>
              <p className="text-gray-600 mb-6 text-center md:text-left">
                Ready to grow your customer base? List your business in our directory today.
              </p>
              <Button 
                variant="outline" 
                className="w-full justify-center rounded-lg border-primary/20 text-primary hover:text-primary-foreground transition-smooth"
              >
                Get Listed Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
