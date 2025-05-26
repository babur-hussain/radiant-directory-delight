
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gift, Users, DollarSign, Share2 } from 'lucide-react';

const ReferralPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Referral <span className="text-brand-orange">Program</span></h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Earn rewards by referring friends and businesses to our platform.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Share2 className="h-12 w-12 text-brand-orange mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Share Your Link</h3>
              <p className="text-gray-600">Share your unique referral link with friends and businesses.</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-12 w-12 text-brand-orange mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">They Sign Up</h3>
              <p className="text-gray-600">Your referrals sign up and start using our platform.</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <DollarSign className="h-12 w-12 text-brand-orange mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Earn Rewards</h3>
              <p className="text-gray-600">Get paid for every successful referral that joins.</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Your Referral Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label htmlFor="referral-link" className="block text-sm font-medium mb-2">Your Referral Link</label>
                <div className="flex gap-2">
                  <Input 
                    id="referral-link" 
                    value="https://example.com/ref/your-code" 
                    readOnly 
                    className="flex-1"
                  />
                  <Button>Copy</Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-brand-orange">12</p>
                  <p className="text-sm text-gray-600">Total Referrals</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">$240</p>
                  <p className="text-sm text-gray-600">Earnings</p>
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
