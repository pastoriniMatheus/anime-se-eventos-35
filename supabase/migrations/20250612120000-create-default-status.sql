
-- Criar status padrão "pendente" se não existir
INSERT INTO public.lead_statuses (name, color)
SELECT 'Pendente', '#f59e0b'
WHERE NOT EXISTS (
    SELECT 1 FROM public.lead_statuses WHERE name ILIKE 'pendente'
);
