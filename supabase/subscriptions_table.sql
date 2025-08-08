-- Create subscriptions table for autopay system
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    package_id TEXT NOT NULL,
    package_name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    payment_method TEXT,
    transaction_id TEXT,
    payment_type TEXT NOT NULL DEFAULT 'recurring',
    billing_cycle TEXT,
    signup_fee DECIMAL(10,2) DEFAULT 0,
    recurring_amount DECIMAL(10,2),
    razorpay_subscription_id TEXT,
    razorpay_order_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancel_reason TEXT,
    assigned_by TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE,
    advance_payment_months INTEGER DEFAULT 0,
    actual_start_date TIMESTAMP WITH TIME ZONE,
    is_paused BOOLEAN DEFAULT FALSE,
    is_pausable BOOLEAN DEFAULT TRUE,
    is_user_cancellable BOOLEAN DEFAULT TRUE,
    invoice_ids TEXT[],
    next_billing_date TIMESTAMP WITH TIME ZONE,
    paused_at TIMESTAMP WITH TIME ZONE,
    paused_by TEXT,
    resumed_at TIMESTAMP WITH TIME ZONE,
    resumed_by TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_type ON public.subscriptions(payment_type);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing_date ON public.subscriptions(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_package_id ON public.subscriptions(package_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Admin can view all subscriptions
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = true
        )
    );

-- Admin can update all subscriptions
CREATE POLICY "Admins can update all subscriptions" ON public.subscriptions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = true
        )
    );

-- Admin can insert subscriptions for any user
CREATE POLICY "Admins can insert subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = true
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_subscriptions_updated_at_trigger
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscriptions_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.subscriptions IS 'Stores user subscription data for autopay system';
COMMENT ON COLUMN public.subscriptions.payment_type IS 'Type of payment: recurring or one-time';
COMMENT ON COLUMN public.subscriptions.billing_cycle IS 'Billing cycle: monthly or yearly';
COMMENT ON COLUMN public.subscriptions.next_billing_date IS 'Next date when recurring payment is due';
COMMENT ON COLUMN public.subscriptions.is_paused IS 'Whether the subscription is currently paused';
COMMENT ON COLUMN public.subscriptions.is_pausable IS 'Whether the subscription can be paused';
COMMENT ON COLUMN public.subscriptions.is_user_cancellable IS 'Whether the user can cancel this subscription'; 