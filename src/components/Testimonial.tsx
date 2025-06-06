
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

interface TestimonialProps {
  name: string;
  role: string;
  company?: string;
  testimonial: string;
  image?: string;
  rating?: number;
  className?: string;
}

const Testimonial: React.FC<TestimonialProps> = ({
  name,
  role,
  company,
  testimonial,
  image,
  rating = 5,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-semibold text-lg">{name}</h4>
          <p className="text-sm text-gray-600">
            {role}{company ? `, ${company}` : ''}
          </p>
          <div className="flex mt-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i}
                className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <p className="text-gray-700">{testimonial}</p>
        </div>
      </div>
    </div>
  );
};

export default Testimonial;
