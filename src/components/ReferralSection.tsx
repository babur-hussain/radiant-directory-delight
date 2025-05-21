
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@/types/auth';
import { Copy, Share2, RefreshCw } from 'lucide-react';
import { generateReferralLink } from '@/utils/referral/referralUtils';
import { useToast } from '@/hooks/use-toast';
import { ensureReferralId, getReferralStats } from '@/services/referralService';
import { useAuth } from '@/hooks/useAuth';

interface ReferralSectionProps {
  user: User;
}

const ReferralSection: React.FC<ReferralSectionProps> = ({ user }) => {
  const { toast } = useToast();
  const { refreshUserData } = useAuth();
  const [copySuccess, setCopySuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [referralLink, setReferralLink] = useState('');
  const [referralStats, setReferralStats] = useState({
    referralCount: user.referralCount || 0,
    referralEarnings: user.referralEarnings || 0
  });
  
  // Load the latest referral stats
  useEffect(() => {
    const loadReferralStats = async () => {
      if (!user.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        // First ensure the user has a referral ID
        if (!user.referralId) {
          await ensureReferralId(user.id);
          await refreshUserData();
        } else {
          // If they already have a referral ID, get the updated stats
          const stats = await getReferralStats(user.id);
          
          if (stats) {
            setReferralStats({
              referralCount: stats.referralCount,
              referralEarnings: stats.referralEarnings
            });
          }
        }
        
        // Create the referral link
        if (user.referralId) {
          setReferralLink(generateReferralLink(user.referralId));
        }
      } catch (error) {
        console.error('Error loading referral data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadReferralStats();
  }, [user.id, user.referralId, refreshUserData]);
  
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

  const handleGenerateNewRefLink = async () => {
    if (!user.id) return;

    setIsGenerating(true);
    try {
      // Generate a new referral ID
      await ensureReferralId(user.id, true); // Pass true to force generation of a new ID
      
      // Refresh user data to get the new referral ID
      await refreshUserData();
      
      toast({
        title: 'New referral link generated!',
        description: 'Your referral link has been updated.'
      });
    } catch (error) {
      console.error('Error generating new referral link:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate new referral link.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-brand-purple/5">
      <CardHeader>
        <CardTitle className="text-gradient-purple">Your Referrals</CardTitle>
        <CardDescription>
          Invite friends and earn 20% of their subscription payment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-brand-green/10 to-brand-teal/10 rounded-xl p-4 text-center border border-brand-green/10">
            <p className="text-sm text-muted-foreground">Total Earnings</p>
            <p className="text-2xl font-bold text-brand-green">₹{referralStats.referralEarnings}</p>
          </div>
          <div className="bg-gradient-to-br from-brand-pink/10 to-brand-purple/10 rounded-xl p-4 text-center border border-brand-pink/10">
            <p className="text-sm text-muted-foreground">Referrals</p>
            <p className="text-2xl font-bold text-brand-pink">{referralStats.referralCount}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium">Your Referral Link</p>
          <div className="flex space-x-2">
            <Input 
              value={referralLink} 
              readOnly
              className="bg-muted focus:ring-2 focus:ring-brand-blue/20"
              placeholder={isLoading ? "Loading..." : "Generate a referral link"}
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleCopyLink}
              className={copySuccess ? "bg-brand-green/10 text-brand-green border-brand-green/20" : ""}
              disabled={!referralLink || isLoading}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground text-right">
            <button 
              onClick={handleGenerateNewRefLink}
              className="flex items-center text-brand-blue hover:text-brand-purple hover:underline" 
              disabled={isGenerating || isLoading}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isGenerating ? 'animate-spin' : ''}`} /> 
              {isGenerating ? 'Generating...' : 'Generate new link'}
            </button>
          </div>
        </div>
        
        <Button 
          className="w-full" 
          variant="gradientBlue"
          rounded="full" 
          onClick={handleShare}
          disabled={!referralLink || isLoading}
        >
          <Share2 className="mr-2 h-4 w-4" /> Share with Friends
        </Button>
        
        <div className="text-xs text-muted-foreground bg-brand-light/50 p-3 rounded-xl">
          <p className="font-medium mb-1 text-brand-dark">How it works:</p>
          <ol className="list-decimal list-inside space-y-1">
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
