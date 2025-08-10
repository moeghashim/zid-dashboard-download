-- Supabase database schema for Zid Dashboard
-- Run this SQL in your Supabase SQL editor

-- Create brands table with launch plan fields
CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    starting_sales DECIMAL(12,2) NOT NULL,
    monthly_growth_rate DECIMAL(5,2) NOT NULL,
    starting_month INTEGER NOT NULL DEFAULT 0,
    has_launch_plan BOOLEAN NOT NULL DEFAULT FALSE,
    launch_plan_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default brands data with launch plans
INSERT INTO brands (name, category, starting_sales, monthly_growth_rate, starting_month, has_launch_plan, launch_plan_fee) VALUES
('Tech Innovators', 'Technology', 45000, 12, 0, true, 15000),
('Fashion Forward', 'Fashion', 32000, 8, 2, true, 8000),
('Health & Wellness', 'Health', 28000, 15, 1, false, 0);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_brands_updated_at
    BEFORE UPDATE ON brands
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) - optional for better security
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (you can make this more restrictive later)
CREATE POLICY "Allow all operations on brands" ON brands FOR ALL USING (true);