
-- Atualizar a constraint de status para incluir 'sending'
ALTER TABLE public.message_history 
DROP CONSTRAINT IF EXISTS message_history_status_check;

ALTER TABLE public.message_history 
ADD CONSTRAINT message_history_status_check 
CHECK (status IN ('sent', 'failed', 'pending', 'sending'));
