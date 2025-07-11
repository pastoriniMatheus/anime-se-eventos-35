
-- Adicionar coluna tracking_id na tabela qr_codes
ALTER TABLE public.qr_codes 
ADD COLUMN tracking_id TEXT;

-- Criar índice para busca rápida por tracking_id
CREATE INDEX idx_qr_codes_tracking_id ON public.qr_codes(tracking_id);
