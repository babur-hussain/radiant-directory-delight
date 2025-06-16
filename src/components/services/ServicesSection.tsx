import React from 'react';
import ServiceCard from './ServiceCard';
import { Users, BarChart3, Link, Star, TrendingUp, MessageSquare } from 'lucide-react';

const ServicesSection = () => {
  const services = [
    {
      title: 'Influencer Marketing',
      description: 'Connect with the right influencers to amplify your brand message and reach new audiences.',
      icon: Users,
      bulletPoints: [
        'Influencer identification and vetting',
        'Campaign strategy and planning',
        'Performance measurement and optimization'
      ]
    },
    {
      title: 'Brand Campaign Management',
      description: 'End-to-end management of your influencer marketing campaigns for maximum impact.',
      icon: BarChart3,
      bulletPoints: [
        'Content creation guidance',
        'Campaign execution oversight',
        'Results tracking and reporting'
      ]
    },
    /*
    {
      title: 'Affiliate Programs',
      description: 'Develop performance-based marketing programs that drive conversions and sales.',
      icon: Link,
      bulletPoints: [
        'Custom affiliate program setup',
        'Influencer onboarding and training',
        'Commission structure optimization'
      ]
    },
    */
    {
      title: 'Event Promotions',
      description: 'Leverage influencer partnerships to boost attendance and engagement at your events.',
      icon: Star,
      bulletPoints: [
        'Pre-event buzz generation',
        'Live coverage coordination',
        'Post-event content amplification'
      ]
    },
    {
      title: 'Sales Growth Marketing',
      description: 'Strategic marketing initiatives designed to directly impact your bottom line.',
      icon: TrendingUp,
      bulletPoints: [
        'Sales funnel optimization',
        'Conversion rate improvement',
        'Customer retention strategies'
      ]
    },
    {
      title: 'Testimonials & PR Outreach',
      description: 'Build credibility and trust through strategic testimonials and public relations.',
      icon: MessageSquare,
      bulletPoints: [
        'Testimonial collection and curation',
        'Media outreach and relationship building',
        'Crisis management preparation'
      ]
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-brand-light/60">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-3">Our <span className="text-gradient-purple">Services</span></h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive solutions to help brands and influencers create impactful partnerships and achieve their marketing goals.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              description={service.description}
              icon={service.icon}
              bulletPoints={service.bulletPoints}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
