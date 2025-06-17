import React from 'react';
import ServiceCard from './ServiceCard';
import { Users, BarChart3, Link, Star, TrendingUp, MessageSquare } from 'lucide-react';

const ServicesSection = () => {
  const services = [
    {
      title: 'Influencer Marketing',
      description: 'Connect with the right influencers to amplify your brand message and reach new audiences.',
      fullDescription: 'Our Influencer Marketing service helps you connect with top influencers across various niches. We handle everything from identifying the best-fit influencers for your brand to developing compelling campaign strategies and meticulously measuring performance to ensure maximum ROI. Our goal is to amplify your brand message, engage new audiences, and drive measurable results through authentic collaborations.',
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
      fullDescription: 'Take the hassle out of influencer marketing with our Brand Campaign Management. We provide end-to-end solutions, including guiding content creation, overseeing campaign execution, and robustly tracking results and reporting. Our expertise ensures your campaigns run smoothly, adhere to brand guidelines, and achieve your marketing objectives with unparalleled efficiency.',
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
      fullDescription: 'Our Affiliate Programs service focuses on developing performance-based marketing initiatives designed to significantly boost your conversions and sales. We assist with custom affiliate program setup, provide comprehensive influencer onboarding and training, and optimize commission structures to ensure profitability and sustained growth. This creates a win-win for both your brand and your affiliates.',
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
      fullDescription: 'Maximize your event's reach and impact with our Event Promotions service. We leverage powerful influencer partnerships to generate pre-event buzz, coordinate engaging live coverage during the event, and ensure extensive post-event content amplification. This strategy significantly boosts attendance, enhances engagement, and creates lasting impressions for your events.',
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
      fullDescription: 'Our Sales Growth Marketing service offers strategic initiatives meticulously designed to directly impact your bottom line. We focus on optimizing your sales funnel, improving conversion rates through targeted strategies, and implementing effective customer retention programs. Our data-driven approach ensures sustainable growth and maximizes your revenue streams.',
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
      fullDescription: 'Enhance your brand's credibility and build lasting trust with our Testimonials & PR Outreach service. We specialize in effective testimonial collection and curation, strategic media outreach to build strong relationships with key publications, and proactive crisis management preparation. This ensures your brand's narrative is consistently positive and resilient.',
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
              fullDescription={service.fullDescription}
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
