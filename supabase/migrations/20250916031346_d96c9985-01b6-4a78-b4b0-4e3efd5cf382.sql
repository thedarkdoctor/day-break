-- Create contract_reviews table to store analysis results
CREATE TABLE public.contract_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_name TEXT NOT NULL,
  analysis_results JSONB NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('red', 'yellow', 'green')),
  risk_score DECIMAL(3,2) NOT NULL CHECK (risk_score >= 0 AND risk_score <= 1),
  compliance_flags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contract_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own contract reviews" 
ON public.contract_reviews 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contract reviews" 
ON public.contract_reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contract reviews" 
ON public.contract_reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contract reviews" 
ON public.contract_reviews 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_contract_reviews_updated_at
BEFORE UPDATE ON public.contract_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();