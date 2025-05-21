import React from 'react';
import ServiceCard from '@/components/services/ServiceCard';
import Testimonial from '@/components/Testimonial';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Users, BarChart3, Link, Star, TrendingUp, MessageSquare } from 'lucide-react';

const ServicesPage = () => {
  const services = [
    {
      title: 'Influencer Marketing',
      description: 'Connect with the right influencers to amplify your brand message and reach new audiences.',
      icon: Users,
      bulletPoints: [
        'Influencer identification and vetting',
        'Campaign strategy and planning',
        'Performance measurement and optimization',
        'Competitor analysis and benchmarking',
        'ROI tracking and enhancement'
      ],
      details: 'Our influencer marketing service helps brands identify, vet, and partner with the perfect influencers to meet their marketing objectives. We handle everything from influencer discovery to campaign execution and performance analysis.'
    },
    {
      title: 'Brand Campaign Management',
      description: 'End-to-end management of your influencer marketing campaigns for maximum impact.',
      icon: BarChart3,
      bulletPoints: [
        'Content creation guidance',
        'Campaign execution oversight',
        'Results tracking and reporting',
        'Budget optimization',
        'Cross-platform strategy development'
      ],
      details: 'Let us manage your influencer campaigns from conception to completion. Our team handles content guidelines, influencer relationships, timeline management, and comprehensive performance reporting.'
    },
    {
      title: 'Affiliate Programs',
      description: 'Develop performance-based marketing programs that drive conversions and sales.',
      icon: Link,
      bulletPoints: [
        'Custom affiliate program setup',
        'Influencer onboarding and training',
        'Commission structure optimization',
        'Tracking and attribution implementation',
        'Payment processing and management'
      ],
      details: 'Our affiliate program services help you create and manage performance-based partnerships with influencers. We handle program structure, tracking setup, influencer recruitment, and ongoing optimization.'
    },
    {
      title: 'Event Promotions',
      description: 'Leverage influencer partnerships to boost attendance and engagement at your events.',
      icon: Star,
      bulletPoints: [
        'Pre-event buzz generation',
        'Live coverage coordination',
        'Post-event content amplification',
        'Influencer attendance coordination',
        'Engagement strategy development'
      ],
      details: 'Maximize the impact of your events with strategic influencer partnerships. We coordinate pre-event promotion, live coverage, and post-event content to extend your reach and engagement.'
    },
    {
      title: 'Sales Growth Marketing',
      description: 'Strategic marketing initiatives designed to directly impact your bottom line.',
      icon: TrendingUp,
      bulletPoints: [
        'Sales funnel optimization',
        'Conversion rate improvement',
        'Customer retention strategies',
        'Upselling and cross-selling tactics',
        'Performance tracking and analysis'
      ],
      details: 'Our sales growth marketing services focus on driving measurable business results. We develop and implement strategies to optimize your sales funnel, improve conversion rates, and enhance customer retention.'
    },
    {
      title: 'Testimonials & PR Outreach',
      description: 'Build credibility and trust through strategic testimonials and public relations.',
      icon: MessageSquare,
      bulletPoints: [
        'Testimonial collection and curation',
        'Media outreach and relationship building',
        'Crisis management preparation',
        'Press release development',
        'Thought leadership positioning'
      ],
      details: 'Enhance your brand reputation with our testimonial and PR services. We help gather and leverage authentic testimonials, build media relationships, and position your brand as an industry leader.'
    },
  ];
  
  const faqs = [
    {
      question: 'How do you select the right influencers for my brand?',
      answer: 'We use a comprehensive vetting process that evaluates influencers based on audience demographics, engagement metrics, content quality, brand alignment, and past performance. We\'ll work with you to understand your brand values and target audience before making any recommendations.'
    },
    {
      question: 'What platforms do you specialize in for influencer marketing?',
      answer: 'We have expertise across all major social platforms including Instagram, YouTube, TikTok, LinkedIn, Facebook, and Twitter. Our team stays current with emerging platforms to ensure we\'re leveraging the most effective channels for your target audience.'
    },
    {
      question: 'How do you measure the success of influencer campaigns?',
      answer: 'We establish clear KPIs aligned with your business objectives. These might include engagement metrics, reach, website traffic, lead generation, conversions, or sales. We provide detailed reporting that tracks these metrics and offers insights for optimization.'
    },
    {
      question: 'What budget do I need for an effective influencer campaign?',
      answer: 'Effective campaigns can be executed across various budget ranges. We work with you to develop a strategy that maximizes your ROI within your available budget, whether you\'re working with nano-influencers or celebrity partners.'
    },
    {
      question: 'How long does it take to see results from influencer marketing?',
      answer: 'While some metrics like reach and engagement can be measured immediately, others like brand awareness or sales impact may take longer to evaluate. Typically, we recommend allowing 3-6 months for a comprehensive assessment of campaign performance.'
    },
    {
      question: 'Do you handle influencer contracts and payments?',
      answer: 'Yes, we can manage the entire contracting and payment process. This includes negotiating terms, creating agreements that protect your interests, and ensuring timely payments to maintain positive influencer relationships.'
    }
  ];

  const testimonials = [
    {
      name: "Rajan Patel",
      role: "Marketing Director",
      company: "GreenLeaf Organics",
      testimonial: "Grow Bharat Vyapaar transformed our influencer strategy. They found the perfect partners who genuinely connected with our brand, resulting in a 3x increase in engagement and a significant boost in sales.",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop",
      rating: 5
    },
    {
      name: "Aisha Khan",
      role: "Founder",
      company: "StyleMe Boutique",
      testimonial: "Their attention to detail and understanding of our brand voice made all the difference. The influencer campaigns they managed delivered exceptional ROI and helped us reach new customer segments we couldn't access before.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      rating: 5
    },
    {
      name: "Vikram Singh",
      role: "CEO",
      company: "FitLife Supplements",
      testimonial: "The team at Grow Bharat Vyapaar doesn't just connect you with influencers - they create true partnerships that drive real business results. Their strategic approach and meticulous execution exceeded our expectations.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      rating: 4
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">Comprehensive <span className="text-brand-orange">Services</span> for Brands & Influencers</h1>
            <p className="text-gray-600 text-lg mb-8">
              From strategic planning to execution and measurement, we provide end-to-end solutions to create successful brand-influencer partnerships.
            </p>
            <Button size="lg" className="bg-brand-orange text-white">
              Get Started Today
            </Button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Our <span className="text-brand-orange">Service</span> Offerings</h2>
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

      {/* Detailed Services */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How We <span className="text-brand-orange">Deliver</span></h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Learn more about our approach and methodology for each service offering.
            </p>
          </div>
          
          <div className="space-y-8 max-w-4xl mx-auto">
            {services.map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-orange-yellow rounded-full p-3 flex-shrink-0">
                    <service.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                    <p className="text-gray-600 mb-4">{service.details}</p>
                    
                    <h4 className="font-semibold mb-2">What's included:</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {service.bulletPoints.map((point, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="text-brand-orange">✓</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">What Our <span className="text-brand-orange">Clients</span> Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from brands who have achieved exceptional results with our services.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Testimonial
                key={index}
                name={testimonial.name}
                role={testimonial.role}
                company={testimonial.company}
                testimonial={testimonial.testimonial}
                image={testimonial.image}
                rating={testimonial.rating}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Frequently Asked <span className="text-brand-orange">Questions</span></h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about our services and approach.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-medium text-lg">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-brand-blue text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Marketing Strategy?</h2>
          <p className="max-w-2xl mx-auto mb-8 text-white/80">
            Let's discuss how our services can help you achieve your business objectives through strategic influencer partnerships.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-brand-orange hover:bg-brand-orange/90">
              Schedule a Consultation
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              View Our Portfolio
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
