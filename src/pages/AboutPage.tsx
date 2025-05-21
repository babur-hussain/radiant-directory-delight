
import React from 'react';
import { Separator } from '@/components/ui/separator';
import Testimonial from '@/components/Testimonial';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const AboutPage = () => {
  const teamMembers = [
    {
      name: 'Prakash Verma',
      role: 'Founder & CEO',
      bio: 'With over 15 years of experience in digital marketing and business growth, Prakash founded Grow Bharat Vyapaar to help Indian businesses reach their full potential through innovative marketing strategies.',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop'
    },
    {
      name: 'Anjali Sharma',
      role: 'Head of Influencer Relations',
      bio: 'Anjali brings 10+ years of experience in talent management and influencer marketing, having previously worked with some of India\'s top content creators and brands on groundbreaking campaigns.',
      image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=400&fit=crop'
    },
    {
      name: 'Rajiv Mehta',
      role: 'Marketing Director',
      bio: 'A digital marketing veteran with expertise in growth strategies, Rajiv helps brands develop comprehensive marketing approaches that integrate influencer partnerships with broader business objectives.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
    },
    {
      name: 'Priya Patel',
      role: 'Content Strategy Manager',
      bio: 'Priya specializes in developing engaging content strategies that resonate with target audiences. She works closely with brands and influencers to craft authentic stories that drive results.',
      image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop'
    },
    {
      name: 'Arjun Singh',
      role: 'Business Development Lead',
      bio: 'Arjun focuses on identifying growth opportunities for both the platform and its partners, building strategic relationships that create value for all stakeholders in the ecosystem.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'
    },
    {
      name: 'Nisha Joshi',
      role: 'Data Analytics Specialist',
      bio: 'With a background in data science, Nisha helps brands and influencers make informed decisions by providing actionable insights from campaign performance and market trends.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop'
    }
  ];

  const testimonials = [
    {
      name: "Rajan Patel",
      role: "Marketing Director",
      company: "GreenLeaf Organics",
      testimonial: "Grow Bharat Vyapaar transformed our digital presence. Their team's deep understanding of the Indian market helped us connect with our audience in authentic ways.",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop",
      rating: 5
    },
    {
      name: "Aisha Khan",
      role: "Founder",
      company: "StyleMe Boutique",
      testimonial: "As a small business owner, I was hesitant about influencer marketing, but the team at GBV made the process simple and effective. My ROI has been incredible.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">About <span className="text-brand-orange">Grow Bharat Vyapaar</span></h1>
            <p className="text-gray-600 text-lg mb-8">
              Connecting brands and influencers to create meaningful partnerships that drive growth and innovation in the Indian marketplace.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1552581234-26160f608093?w=800&h=600&fit=crop" 
                alt="Mission and Vision" 
                className="rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission & Vision</h2>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Mission</h3>
                <p className="text-gray-600">
                  To empower Indian businesses and content creators through strategic partnerships that drive mutual growth, foster innovation, and create authentic connections with audiences.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">Vision</h3>
                <p className="text-gray-600">
                  To become the leading platform for brand-influencer collaborations in India, fueling the growth of businesses across the country and contributing to a vibrant digital economy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Our Story</h2>
            
            <div className="space-y-6 text-gray-600">
              <p>
                Grow Bharat Vyapaar was founded in 2020 with a simple yet powerful vision: to help Indian businesses leverage the digital revolution to reach new heights. Our founder, Prakash Verma, recognized that while large corporations had resources to capitalize on emerging digital marketing trends, small and medium businesses across India were being left behind.
              </p>
              
              <p>
                What began as a consultancy helping local businesses establish their online presence quickly evolved into a comprehensive platform connecting brands with influencers. We recognized the immense potential of authentic storytelling through trusted voices to build brand credibility and drive growth.
              </p>
              
              <p>
                Over the years, we've helped hundreds of businesses across various sectors—from traditional artisans and local manufacturers to emerging D2C brands and established regional players—find their voice in the digital landscape through strategic influencer partnerships.
              </p>
              
              <p>
                Today, Grow Bharat Vyapaar stands as a testament to the power of digital transformation and authentic marketing in driving business growth. Our team continues to innovate and expand our services, always with the core mission of empowering Indian businesses to thrive in an increasingly connected world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Team */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our <span className="text-brand-orange">Team</span></h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-64 object-cover object-center"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-brand-orange font-medium mb-4">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-brand-blue text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-4">Deep Local Expertise</h3>
              <p className="text-white/80">
                Our team understands the unique nuances of the Indian market, from regional preferences to cultural sensitivities, ensuring your campaigns resonate authentically.
              </p>
            </div>
            
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-4">Data-Driven Approach</h3>
              <p className="text-white/80">
                We combine human insight with robust analytics to guide your strategy, optimize performance, and maximize ROI on every campaign.
              </p>
            </div>
            
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-4">End-to-End Solutions</h3>
              <p className="text-white/80">
                From strategy development to execution and measurement, we provide comprehensive support for all your influencer marketing needs.
              </p>
            </div>
            
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-4">Curated Influencer Network</h3>
              <p className="text-white/80">
                Access our carefully vetted network of influencers across niches, ensuring authentic partnerships with creators who genuinely connect with your brand.
              </p>
            </div>
            
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-4">Transparent Reporting</h3>
              <p className="text-white/80">
                We believe in complete transparency, providing clear, comprehensive reporting that demonstrates the real impact of your marketing investments.
              </p>
            </div>
            
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-4">Personalized Strategy</h3>
              <p className="text-white/80">
                No cookie-cutter approaches here. We develop customized strategies tailored to your specific business objectives, target audience, and budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Core Values</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-brand-orange" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl">Authenticity</h3>
                    <p className="text-gray-600">We believe in fostering genuine connections between brands and influencers that resonate with audiences.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-brand-orange" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl">Innovation</h3>
                    <p className="text-gray-600">We continuously explore new approaches, technologies, and platforms to keep our clients ahead of the curve.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-brand-orange" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl">Integrity</h3>
                    <p className="text-gray-600">We operate with transparency, honesty, and ethical standards in all our partnerships and business practices.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-brand-orange" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl">Growth Mindset</h3>
                    <p className="text-gray-600">We are committed to continuous learning and development for ourselves, our clients, and our partners.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <img 
                src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=800&h=600&fit=crop" 
                alt="Our Values" 
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our <span className="text-brand-orange">Clients</span> Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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

      {/* CTA Section */}
      <section className="py-16 bg-brand-orange text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="max-w-2xl mx-auto mb-8 text-white/90">
            Connect with our team to learn how we can help you achieve your marketing goals through strategic influencer partnerships.
          </p>
          <Button size="lg" className="bg-white text-brand-orange hover:bg-white/90">
            Contact Us Today
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
