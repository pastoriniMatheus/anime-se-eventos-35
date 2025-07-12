
-- Remover a constraint atual
ALTER TABLE message_history DROP CONSTRAINT IF EXISTS message_history_filter_type_check;

-- Criar nova constraint que inclui os novos tipos de filtro
ALTER TABLE message_history ADD CONSTRAINT message_history_filter_type_check 
CHECK (filter_type IS NULL OR filter_type IN ('course', 'event', 'status', 'auto_new_lead', 'automatic_conversion'));
