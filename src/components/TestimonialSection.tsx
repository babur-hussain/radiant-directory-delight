
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Restaurant Owner',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&auto=format&fit=crop',
    content: "DirectSpot has been instrumental in growing my restaurant. The exposure and customer engagement we've gained through their platform is remarkable. Our bookings have increased by 45% in just three months!",
    rating: 5
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Hotel Manager',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&auto=format&fit=crop',
    content: "As a hotel manager, I've tried various directory services, but none compare to DirectSpot. The quality of leads and the platform's intuitive interface have made it our go-to for marketing our establishment.",
    rating: 5
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Small Business Owner',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=128&h=128&auto=format&fit=crop',
    content: "I started my boutique during the pandemic, and DirectSpot helped me get discovered by local customers. Their platform is incredibly user-friendly and the customer support is outstanding.",
    rating: 4
  },
  {
    id: 4,
    name: 'David Williams',
    role: 'Healthcare Provider',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&auto=format&fit=crop',
    content: "DirectSpot has revolutionized how patients find our practice. The detailed profile options allow us to showcase our specialties and services, resulting in better matched patient inquiries.",
    rating: 5
  },
  {
    id: 5,
    name: 'Jessica Thompson',
    role: 'Yoga Studio Owner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&auto=format&fit=crop',
    content: "My yoga studio has flourished since joining DirectSpot. Their category-specific features help us target the right audience, and the review system has built credibility for our business.",
    rating: 5
  }
];

const TestimonialSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setActiveIndex((current) => 
          current === testimonials.length - 1 ? 0 : current + 1
        );
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isPaused]);

  const goToPrevious = () => {
    setActiveIndex((current) => 
      current === 0 ? testimonials.length - 1 : current - 1
    );
  };

  const goToNext = () => {
    setActiveIndex((current) => 
      current === testimonials.length - 1 ? 0 : current + 1
    );
  };

  return (
    <section className="py-20 bg-white">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Hear from businesses that have grown with our platform.
          </p>
        </div>
        
        <div 
          className="relative max-w-4xl mx-auto" 
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Testimonial Carousel */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id}
                  className="w-full flex-shrink-0 px-4"
                >
                  <div className="bg-gray-50 rounded-2xl p-8 relative shadow-sm">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-sm">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    </div>
                    
                    <div className="flex justify-center mt-8 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i}
                          className={cn(
                            "h-5 w-5",
                            i < testimonial.rating 
                              ? "text-yellow-400 fill-yellow-400" 
                              : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                    
                    <blockquote className="text-center mb-6">
                      <p className="text-lg text-gray-700 italic">"{testimonial.content}"</p>
                    </blockquote>
                    
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <button
            onClick={goToPrevious}
            className="absolute top-1/2 left-0 -translate-y-1/2 -ml-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute top-1/2 right-0 -translate-y-1/2 -mr-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-6 w-6 text-gray-600" />
          </button>
          
          {/* Indicator Dots */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-300",
                  activeIndex === index 
                    ? "bg-primary w-6" 
                    : "bg-gray-300 hover:bg-gray-400"
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
