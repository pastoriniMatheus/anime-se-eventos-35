
-- Permitir que whatsapp_number seja nullable para eventos de formulário
ALTER TABLE public.events ALTER COLUMN whatsapp_number DROP NOT NULL;
