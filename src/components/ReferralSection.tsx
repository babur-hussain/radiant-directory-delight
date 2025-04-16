
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@/types/auth';
import { Copy, Share2 } from 'lucide-react';
import { createReferralLink } from '@/utils/referral/referralUtils';
import { useToast } from '@/hooks/use-toast';

interface ReferralSectionProps {
  user: User;
}

const ReferralSection: React.FC<ReferralSectionProps> = ({ user }) => {
  const { toast } = useToast();
  const [copySuccess, setCopySuccess] = useState(false);
  
  const referralLink = user.referralId ? createReferralLink(user.referralId) : '';
  
  const handleCopyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopySuccess(true);
      toast({
        title: 'Link copied!',
        description: 'Referral link copied to clipboard.'
      });
      
      setTimeout(() => {
        setCopySuccess(false);
      }, 3000);
    }
  };
  
  const handleShare = async () => {
    if (navigator.share && referralLink) {
      try {
        await navigator.share({
          title: 'Join me on this platform!',
          text: 'Sign up using my referral link and get started:',
          url: referralLink
        });
        toast({
          title: 'Shared successfully!',
          description: 'Thanks for sharing your referral link.'
        });
      } catch (err) {
        console.error('Error sharing:', err);
        // Fallback to copy if sharing fails
        handleCopyLink();
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      handleCopyLink();
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Referrals</CardTitle>
        <CardDescription>
          Invite friends and earn 20% of their subscription payment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary/10 rounded-md p-4 text-center">
            <p className="text-sm text-muted-foreground">Total Earnings</p>
            <p className="text-2xl font-bold text-primary">₹{user.referralEarnings || 0}</p>
          </div>
          <div className="bg-primary/10 rounded-md p-4 text-center">
            <p className="text-sm text-muted-foreground">Referrals</p>
            <p className="text-2xl font-bold text-primary">{user.referralCount || 0}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium">Your Referral Link</p>
          <div className="flex space-x-2">
            <Input 
              value={referralLink} 
              readOnly
              className="bg-muted"
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleCopyLink}
              className={copySuccess ? "bg-green-100 text-green-600" : ""}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Button 
          className="w-full" 
          variant="default" 
          onClick={handleShare}
        >
          <Share2 className="mr-2 h-4 w-4" /> Share with Friends
        </Button>
        
        <div className="text-xs text-muted-foreground">
          <p>How it works:</p>
          <ol className="list-decimal list-inside space-y-1 mt-1">
            <li>Share your unique referral link with friends</li>
            <li>When they subscribe using your link, you earn 20% of their payment</li>
            <li>Your earnings will be added to your account automatically</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralSection;
