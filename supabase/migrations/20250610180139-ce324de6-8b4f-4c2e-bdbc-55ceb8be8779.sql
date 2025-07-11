
-- Tabela para cursos
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para status de leads
CREATE TABLE public.lead_statuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#64748b',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para eventos
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  whatsapp_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para QR codes
CREATE TABLE public.qr_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  short_url TEXT NOT NULL UNIQUE,
  original_url TEXT NOT NULL,
  scans INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para leads
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  course_id UUID REFERENCES public.courses(id),
  event_id UUID REFERENCES public.events(id),
  status_id UUID REFERENCES public.lead_statuses(id),
  shift TEXT CHECK (shift IN ('manhã', 'tarde', 'noite')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para templates de mensagem
CREATE TABLE public.message_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('whatsapp', 'email', 'sms')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para histórico de mensagens
CREATE TABLE public.message_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('whatsapp', 'email', 'sms')),
  filter_type TEXT CHECK (filter_type IN ('course', 'event', 'all')),
  filter_value TEXT,
  recipients_count INTEGER NOT NULL DEFAULT 0,
  content TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'pending')) DEFAULT 'pending',
  webhook_response TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para configurações do sistema
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir dados iniciais
INSERT INTO public.courses (name) VALUES 
  ('Medicina'),
  ('Engenharia'),
  ('Direito'),
  ('Administração'),
  ('Psicologia');

INSERT INTO public.lead_statuses (name, color) VALUES 
  ('Pendente', '#eab308'),
  ('Em Atendimento', '#3b82f6'),
  ('Inscrito', '#22c55e'),
  ('Matriculado', '#8b5cf6'),
  ('Ingressou Outra Faculdade', '#ef4444');

-- Inserir configurações padrão
INSERT INTO public.system_settings (key, value) VALUES 
  ('logo', '""'),
  ('favicon', '""'),
  ('primary_color', '"#3b82f6"'),
  ('secondary_color', '"#64748b"'),
  ('webhooks', '{"whatsapp": "https://api.exemplo.com/whatsapp/send", "email": "https://api.exemplo.com/email/send", "sms": "https://api.exemplo.com/sms/send", "leadCapture": "https://api.exemplo.com/leads/capture", "leadSync": "https://api.exemplo.com/leads/sync"}');

-- Habilitar RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (permitir acesso público por enquanto)
CREATE POLICY "Allow all access" ON public.courses FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.lead_statuses FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.events FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.qr_codes FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.leads FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.message_templates FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.message_history FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.system_settings FOR ALL USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
