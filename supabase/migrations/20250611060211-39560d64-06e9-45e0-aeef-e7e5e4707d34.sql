
-- Create table for WhatsApp validations
CREATE TABLE public.whatsapp_validations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  whatsapp TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  response_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  validated_at TIMESTAMP WITH TIME ZONE
);

-- Add index for better performance on status queries
CREATE INDEX idx_whatsapp_validations_status ON public.whatsapp_validations(status);
CREATE INDEX idx_whatsapp_validations_created_at ON public.whatsapp_validations(created_at);
