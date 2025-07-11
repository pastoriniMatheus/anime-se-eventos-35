
-- Adicionar coluna is_default na tabela message_templates
ALTER TABLE public.message_templates 
ADD COLUMN is_default BOOLEAN NOT NULL DEFAULT false;

-- Criar índice para melhor performance
CREATE INDEX idx_message_templates_is_default ON public.message_templates(is_default);
