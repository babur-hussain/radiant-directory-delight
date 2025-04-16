
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/types/auth';
import { getAllInfluencers } from '@/services/influencerService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { InstagramIcon, FacebookIcon, Users2, DollarSign, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const InfluencersPage = () => {
  const [influencers, setInfluencers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        const data = await getAllInfluencers();
        setInfluencers(data);
      } catch (error) {
        console.error('Error fetching influencers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInfluencers();
  }, []);
  
  const getInitials = (name: string | null): string => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };
  
  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <div className="animate-pulse space-y-8 w-full max-w-3xl">
          {[1, 2, 3].map((index) => (
            <div key={index} className="bg-gray-100 p-6 rounded-lg h-40"></div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-3">Our Top Influencers</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Meet our top performers who are making a difference with their referrals
            and helping us grow our community.
          </p>
        </div>
        
        {influencers.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-500">No influencers found</h2>
            <p className="mt-2 text-gray-400">
              Be the first to become an influencer on our platform!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {influencers.map((influencer) => (
              <Card key={influencer.id} className="overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/3 bg-primary/5 p-6 flex flex-col items-center justify-center">
                    <Avatar className="h-24 w-24 mb-3">
                      {influencer.photoURL ? (
                        <AvatarImage src={influencer.photoURL} alt={influencer.name || ""} />
                      ) : (
                        <AvatarFallback className="text-2xl">
                          {getInitials(influencer.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <h3 className="text-xl font-semibold text-center">{influencer.name}</h3>
                    
                    {influencer.niche && (
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm mt-2">
                        {influencer.niche}
                      </span>
                    )}
                    
                    <div className="flex gap-2 mt-4">
                      {influencer.instagramHandle && (
                        <a 
                          href={`https://instagram.com/${influencer.instagramHandle}`}
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="rounded-full p-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <InstagramIcon className="h-4 w-4" />
                        </a>
                      )}
                      {influencer.facebookHandle && (
                        <a 
                          href={`https://facebook.com/${influencer.facebookHandle}`}
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="rounded-full p-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <FacebookIcon className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="md:w-2/3 p-6">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <Users2 className="text-primary" />
                        </div>
                        <p className="text-2xl font-bold">{influencer.referralCount || 0}</p>
                        <p className="text-sm text-gray-500">Referrals</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <DollarSign className="text-green-600" />
                        </div>
                        <p className="text-2xl font-bold">₹{influencer.referralEarnings || 0}</p>
                        <p className="text-sm text-gray-500">Earnings</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <Award className="text-amber-500" />
                        </div>
                        <p className="text-2xl font-bold">{influencer.followersCount || '-'}</p>
                        <p className="text-sm text-gray-500">Followers</p>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div>
                      <p className="text-gray-600 line-clamp-3 mb-4">
                        {influencer.bio || "No bio available"}
                      </p>
                      
                      <div className="flex justify-end">
                        <Button asChild variant="outline">
                          <Link to={`/profile/${influencer.id}`}>View Profile</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InfluencersPage;
