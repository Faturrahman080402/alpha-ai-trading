-- Add expires_at column to trades table for order duration feature
ALTER TABLE public.trades 
ADD COLUMN expires_at timestamp with time zone DEFAULT NULL;