
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserSubscriptionsTabProps {
  userId: string;
}

interface Subscription {
  id: string;
  user_id: string;
  package_id: string;
  package_name: string;
  status: string;
  start_date: string;
  end_date: string;
  transaction_id?: string;
  amount?: number;
  created_at: string;
}

const UserSubscriptionsTab: React.FC<UserSubscriptionsTabProps> = ({ userId }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSubscriptions(data || []);
      } catch (err) {
        console.error('Error fetching subscriptions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch subscriptions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Subscription History</h3>
        <Button variant="outline" size="sm">Assign New Subscription</Button>
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center pt-6 pb-8">
            <p className="text-muted-foreground mt-2">No subscription history found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{subscription.package_name || 'Unknown Package'}</CardTitle>
                  <Badge 
                    variant={subscription.status === 'active' ? 'default' : 
                            subscription.status === 'cancelled' ? 'destructive' : 'outline'}
                  >
                    {subscription.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Start Date</dt>
                    <dd>{new Date(subscription.start_date).toLocaleDateString() || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">End Date</dt>
                    <dd>{subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'N/A'}</dd>
                  </div>
                  {subscription.amount && (
                    <div>
                      <dt className="text-muted-foreground">Amount</dt>
                      <dd>₹{subscription.amount}</dd>
                    </div>
                  )}
                  {subscription.transaction_id && (
                    <div>
                      <dt className="text-muted-foreground">Transaction ID</dt>
                      <dd className="truncate">{subscription.transaction_id}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSubscriptionsTab;
