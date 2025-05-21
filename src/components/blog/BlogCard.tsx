
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon } from 'lucide-react';

interface BlogCardProps {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
  author: string;
  tags?: string[];
}

const BlogCard: React.FC<BlogCardProps> = ({
  id,
  title,
  excerpt,
  image,
  date,
  category,
  author,
  tags = [],
}) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <Link to={`/blog/${id}`}>
        <div className="aspect-video w-full overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      </Link>
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Badge variant="secondary" className="hover:bg-brand-orange/20">{category}</Badge>
          <span className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            {date}
          </span>
        </div>
        <Link to={`/blog/${id}`} className="hover:text-brand-orange">
          <h3 className="text-xl font-semibold line-clamp-2">{title}</h3>
        </Link>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-gray-600 line-clamp-3">{excerpt}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <span className="text-sm text-gray-500">By {author}</span>
        <div className="flex gap-2">
          {tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 2}
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default BlogCard;
