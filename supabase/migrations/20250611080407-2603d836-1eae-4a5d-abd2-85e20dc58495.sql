
-- Adicionar coluna type na tabela qr_codes para diferenciar WhatsApp de formulário
ALTER TABLE public.qr_codes 
ADD COLUMN type TEXT DEFAULT 'whatsapp';

-- Criar índice para busca rápida por tipo
CREATE INDEX idx_qr_codes_type ON public.qr_codes(type);
