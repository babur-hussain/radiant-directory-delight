
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';

const OnboardingGuide: React.FC = () => {
  const steps = [
    {
      title: 'Create Your Profile',
      description: 'Sign up and build your influencer profile with details about your niche, audience demographics, and content style.',
      benefits: [
        'Showcase your unique strengths and abilities',
        'Highlight your past brand collaborations',
        'Display your social media metrics and engagement rates'
      ]
    },
    {
      title: 'Connect Your Social Accounts',
      description: 'Link your social media accounts to verify your follower count and engagement metrics.',
      benefits: [
        'Automatic metric updates save you time',
        'Verified profiles get 3x more brand interest',
        'Access detailed analytics about your audience'
      ]
    },
    {
      title: 'Set Your Collaboration Terms',
      description: 'Define your collaboration preferences, rates, and the types of brands you want to work with.',
      benefits: [
        'Receive only relevant collaboration opportunities',
        'Transparent pricing helps brands make faster decisions',
        'Define content deliverables that match your strengths'
      ]
    },
    {
      title: 'Get Discovered by Brands',
      description: 'Once your profile is complete, brands can find you through our search and matching system.',
      benefits: [
        'Our algorithm matches you with compatible brands',
        'Get notified about relevant opportunities',
        'Showcase your profile in our influencer directory'
      ]
    }
  ];

  const benefits = [
    'Access to exclusive brand partnerships and campaigns',
    'Negotiation support and contract management',
    'Professional development resources and workshops',
    'Analytics and insights to grow your influence',
    'Networking opportunities with other creators',
    'Timely payments and transparent processes'
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Influencer <span className="text-brand-orange">Onboarding</span> Guide</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join our platform in four simple steps and start connecting with brands that align with your content and values.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => (
            <Card key={index} className={`relative ${index === steps.length - 1 ? '' : 'step-card'}`}>
              <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold">
                {index + 1}
              </span>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600 mb-4">{step.description}</p>
                
                <h4 className="text-sm font-medium mb-2">Benefits:</h4>
                <ul className="space-y-2">
                  {step.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-brand-orange mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-2xl font-bold mb-6 text-center">Why Join Our Influencer Network?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-brand-orange mr-2 mt-0.5 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button size="lg" className="bg-brand-orange hover:bg-brand-orange/90">
              Apply to Join Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Applications are reviewed within 48 hours
            </p>
          </div>
        </div>
      </div>
      
      <style>
        {`
        .step-card::after {
          content: '';
          position: absolute;
          top: 50%;
          right: -32px;
          width: 32px;
          height: 2px;
          background-color: #e5e7eb;
          display: none;
        }
        
        @media (min-width: 1024px) {
          .step-card::after {
            display: block;
          }
        }
        `}
      </style>
    </section>
  );
};

export default OnboardingGuide;
