
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User } from '@/types/auth';
import { setInfluencerStatus } from '@/services/influencerService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Star, Award, TrendingUp } from 'lucide-react';

interface BecomeInfluencerSectionProps {
  user: User;
  onUpdate: () => void;
}

const BecomeInfluencerSection: React.FC<BecomeInfluencerSectionProps> = ({ user, onUpdate }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleBecomeInfluencer = async () => {
    if (!user.id) return;
    
    setIsLoading(true);
    try {
      const success = await setInfluencerStatus(user.id, true);
      if (success) {
        toast({
          title: 'Success!',
          description: 'You are now registered as an influencer.',
        });
        onUpdate();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update influencer status. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error becoming an influencer:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500" />
          {user.isInfluencer ? 'Influencer Status' : 'Become an Influencer'}
        </CardTitle>
        <CardDescription>
          {user.isInfluencer 
            ? 'You are currently registered as an influencer'
            : 'Earn more by becoming an influencer on our platform'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {user.isInfluencer ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-md">
              <Award className="h-5 w-5" />
              <span>You're an active influencer on our platform</span>
            </div>
            
            <p className="text-sm">
              Visit the Influencers page to see your public profile and track your earnings.
              Keep referring users to increase your rank and earnings!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p>Benefits of becoming an influencer:</p>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <TrendingUp className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Earn 20% commission on every subscription through your referrals</span>
              </li>
              <li className="flex gap-2">
                <Award className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <span>Get featured on our influencers page</span>
              </li>
              <li className="flex gap-2">
                <Star className="h-5 w-5 text-purple-500 flex-shrink-0" />
                <span>Build your personal brand and establish credibility</span>
              </li>
            </ul>
          </div>
        )}
      </CardContent>
      {!user.isInfluencer && (
        <CardFooter>
          <Button 
            onClick={handleBecomeInfluencer} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Become an Influencer'
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default BecomeInfluencerSection;
