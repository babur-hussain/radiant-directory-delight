
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Share2, Users, Gift, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const ReferralPage = () => {
  const [referralCode] = useState('LOVE2024');
  const [referralStats] = useState({
    totalReferrals: 12,
    successfulReferrals: 8,
    totalEarnings: 1600,
    pendingEarnings: 400
  });

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success('Referral code copied to clipboard!');
  };

  const shareReferral = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join Lovable',
        text: 'Join me on Lovable and get started with influencer marketing!',
        url: `${window.location.origin}/ref/${referralCode}`
      });
    } else {
      copyReferralCode();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Referral <span className="text-brand-orange">Program</span></h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Earn money by referring friends and businesses to our platform. Get rewarded for every successful referral!
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Referral Code Section */}
          <Card>
            <CardHeader>
              <CardTitle>Your Referral Code</CardTitle>
              <CardDescription>Share this code with friends to earn rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input 
                    value={referralCode} 
                    readOnly 
                    className="text-center text-lg font-mono"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={copyReferralCode} variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={shareReferral}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{referralStats.totalReferrals}</p>
                    <p className="text-sm text-gray-600">Total Referrals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Gift className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{referralStats.successfulReferrals}</p>
                    <p className="text-sm text-gray-600">Successful</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">₹{referralStats.totalEarnings}</p>
                    <p className="text-sm text-gray-600">Total Earned</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">₹{referralStats.pendingEarnings}</p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How it Works */}
          <Card>
            <CardHeader>
              <CardTitle>How it Works</CardTitle>
              <CardDescription>Simple steps to start earning through referrals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Share Your Code</h3>
                  <p className="text-sm text-gray-600">Share your unique referral code with friends and businesses</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">They Sign Up</h3>
                  <p className="text-sm text-gray-600">Your referrals create an account using your code</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Earn Rewards</h3>
                  <p className="text-sm text-gray-600">Get paid when they purchase a subscription</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reward Tiers */}
          <Card>
            <CardHeader>
              <CardTitle>Reward Tiers</CardTitle>
              <CardDescription>Different rewards for different user types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Influencer Referral</h4>
                    <p className="text-sm text-gray-600">When an influencer signs up and subscribes</p>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">₹200</Badge>
                </div>
                
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Business Referral</h4>
                    <p className="text-sm text-gray-600">When a business signs up and subscribes</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">₹500</Badge>
                </div>
                
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Premium Business</h4>
                    <p className="text-sm text-gray-600">When a business subscribes to premium plans</p>
                  </div>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">₹1000</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;
