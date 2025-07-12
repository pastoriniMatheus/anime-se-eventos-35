
-- Adicionar coluna is_conversion_default à tabela message_templates
ALTER TABLE public.message_templates 
ADD COLUMN is_conversion_default boolean NOT NULL DEFAULT false;

-- Garantir que apenas um template pode ser padrão de conversão por vez
-- (similar ao constraint que já existe para is_default)
