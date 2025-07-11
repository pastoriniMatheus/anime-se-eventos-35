
-- Criar tabela para pós-graduações
CREATE TABLE public.postgraduate_courses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Adicionar RLS (Row Level Security) para permitir acesso total
ALTER TABLE public.postgraduate_courses ENABLE ROW LEVEL SECURITY;

-- Criar política que permite todas as operações
CREATE POLICY "Allow all access" 
  ON public.postgraduate_courses 
  FOR ALL 
  USING (true);

-- Adicionar coluna type na tabela leads para distinguir entre curso e pós-graduação
ALTER TABLE public.leads 
ADD COLUMN course_type text DEFAULT 'course';

-- Adicionar coluna postgraduate_course_id na tabela leads
ALTER TABLE public.leads 
ADD COLUMN postgraduate_course_id uuid REFERENCES public.postgraduate_courses(id);
