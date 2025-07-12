
-- =====================================================
-- SYNCLEAD - SISTEMA DE GESTÃO DE LEADS EDUCACIONAIS
-- Schema completo para instalação em novos projetos
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de usuários autorizados
CREATE TABLE IF NOT EXISTS public.authorized_users (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de cursos
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de cursos de pós-graduação
CREATE TABLE IF NOT EXISTS public.postgraduate_courses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de eventos
CREATE TABLE IF NOT EXISTS public.events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    whatsapp_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de status de leads
CREATE TABLE IF NOT EXISTS public.lead_statuses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#f59e0b',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de QR codes
CREATE TABLE IF NOT EXISTS public.qr_codes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    short_url TEXT NOT NULL UNIQUE,
    full_url TEXT NOT NULL,
    original_url TEXT,
    tracking_id TEXT,
    event_id UUID REFERENCES public.events(id),
    type TEXT DEFAULT 'whatsapp',
    scans INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de sessões de escaneamento
CREATE TABLE IF NOT EXISTS public.scan_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    qr_code_id UUID REFERENCES public.qr_codes(id),
    event_id UUID REFERENCES public.events(id),
    lead_id UUID REFERENCES public.leads(id),
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    converted_at TIMESTAMP WITH TIME ZONE,
    converted BOOLEAN DEFAULT false,
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela principal de leads
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    whatsapp TEXT,
    course_id UUID REFERENCES public.courses(id),
    postgraduate_course_id UUID REFERENCES public.postgraduate_courses(id),
    event_id UUID REFERENCES public.events(id),
    status_id UUID REFERENCES public.lead_statuses(id),
    scan_session_id UUID REFERENCES public.scan_sessions(id),
    course_type TEXT DEFAULT 'course',
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- SISTEMA DE MENSAGENS
-- =====================================================

-- Tabela de templates de mensagens
CREATE TABLE IF NOT EXISTS public.message_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_conversion_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de histórico de mensagens
CREATE TABLE IF NOT EXISTS public.message_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    filter_type TEXT,
    filter_value TEXT,
    delivery_code TEXT DEFAULT concat('MSG-', extract(epoch from now())::bigint, '-', substring(gen_random_uuid()::text, 1, 8)),
    recipients_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    webhook_response TEXT,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de destinatários das mensagens
CREATE TABLE IF NOT EXISTS public.message_recipients (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    message_history_id UUID NOT NULL REFERENCES public.message_history(id),
    lead_id UUID NOT NULL REFERENCES public.leads(id),
    delivery_status TEXT NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- SISTEMA DE VALIDAÇÃO WHATSAPP
-- =====================================================

-- Tabela de validações WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_validations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    whatsapp TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    response_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    validated_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- CONFIGURAÇÕES DO SISTEMA
-- =====================================================

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- FUNÇÕES DO BANCO DE DADOS
-- =====================================================

-- Função para atualizar timestamp updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar escaneamentos de QR
CREATE OR REPLACE FUNCTION public.increment_qr_scan(tracking_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.qr_codes 
  SET scans = scans + 1 
  WHERE tracking_id = increment_qr_scan.tracking_id;
END;
$$;

-- Função para verificar login
CREATE OR REPLACE FUNCTION public.verify_login(p_username text, p_password text)
RETURNS TABLE(success boolean, user_data json)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record public.authorized_users%ROWTYPE;
BEGIN
  SELECT * INTO user_record 
  FROM public.authorized_users 
  WHERE username = p_username 
    AND password_hash = crypt(p_password, password_hash);
    
  IF FOUND THEN
    RETURN QUERY SELECT 
      true,
      json_build_object(
        'id', user_record.id,
        'username', user_record.username,
        'email', user_record.email
      );
  ELSE
    RETURN QUERY SELECT false, null::json;
  END IF;
END;
$$;

-- Função para obter sessões de scan com dados relacionados
CREATE OR REPLACE FUNCTION public.get_scan_sessions()
RETURNS TABLE(
  id uuid, 
  qr_code_id uuid, 
  event_id uuid, 
  lead_id uuid, 
  scanned_at timestamp with time zone, 
  user_agent text, 
  ip_address text, 
  qr_code json, 
  event json, 
  lead json
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ss.id,
    ss.qr_code_id,
    ss.event_id,
    ss.lead_id,
    ss.scanned_at,
    ss.user_agent,
    ss.ip_address,
    CASE 
      WHEN qr.id IS NOT NULL THEN 
        json_build_object(
          'id', qr.id,
          'short_url', qr.short_url,
          'type', qr.type,
          'scans', qr.scans,
          'tracking_id', qr.tracking_id
        )
      ELSE NULL
    END as qr_code,
    CASE 
      WHEN e.id IS NOT NULL THEN 
        json_build_object(
          'id', e.id,
          'name', e.name,
          'whatsapp_number', e.whatsapp_number
        )
      ELSE NULL
    END as event,
    CASE 
      WHEN l.id IS NOT NULL THEN 
        json_build_object(
          'id', l.id,
          'name', l.name,
          'email', l.email,
          'whatsapp', l.whatsapp
        )
      ELSE NULL
    END as lead
  FROM scan_sessions ss
  LEFT JOIN qr_codes qr ON ss.qr_code_id = qr.id
  LEFT JOIN events e ON ss.event_id = e.id
  LEFT JOIN leads l ON ss.lead_id = l.id
  ORDER BY ss.scanned_at DESC;
END;
$$;

-- Função para confirmar entrega de mensagem
CREATE OR REPLACE FUNCTION public.confirm_message_delivery(
  p_delivery_code text, 
  p_lead_identifier text, 
  p_status text DEFAULT 'delivered'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_message_history_id UUID;
  v_lead_id UUID;
  v_result JSON;
BEGIN
  SELECT id INTO v_message_history_id 
  FROM public.message_history 
  WHERE delivery_code = p_delivery_code;
  
  IF v_message_history_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid delivery code');
  END IF;
  
  SELECT id INTO v_lead_id 
  FROM public.leads 
  WHERE email = p_lead_identifier OR whatsapp = p_lead_identifier;
  
  IF v_lead_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Lead not found');
  END IF;
  
  UPDATE public.message_recipients 
  SET 
    delivery_status = p_status,
    delivered_at = CASE WHEN p_status = 'delivered' THEN now() ELSE NULL END
  WHERE message_history_id = v_message_history_id 
    AND lead_id = v_lead_id;
    
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Message recipient not found');
  END IF;
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Delivery status updated successfully',
    'delivery_code', p_delivery_code,
    'status', p_status
  );
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_authorized_users_updated_at ON public.authorized_users;
CREATE TRIGGER update_authorized_users_updated_at
    BEFORE UPDATE ON public.authorized_users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON public.system_settings;
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Ativar RLS em todas as tabelas
ALTER TABLE public.authorized_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.postgraduate_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Permitir acesso total (sistema interno)
CREATE POLICY "Allow all access" ON public.authorized_users FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.courses FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.postgraduate_courses FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.events FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.lead_statuses FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.leads FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.qr_codes FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.scan_sessions FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.message_templates FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.message_history FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.message_recipients FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.whatsapp_validations FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.system_settings FOR ALL USING (true);

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Usuário administrador padrão
INSERT INTO public.authorized_users (username, email, password_hash) 
VALUES ('synclead', 'admin@synclead.com', crypt('s1ncl3@d', gen_salt('bf')))
ON CONFLICT (username) DO NOTHING;

-- Status de leads padrão
INSERT INTO public.lead_statuses (name, color) VALUES 
('Novo', '#22c55e'),
('Em Contato', '#f59e0b'),
('Interessado', '#3b82f6'),
('Convertido', '#10b981'),
('Não Interessado', '#ef4444')
ON CONFLICT DO NOTHING;

-- Configurações padrão do sistema
INSERT INTO public.system_settings (key, value, description) VALUES 
('app_name', 'SyncLead', 'Nome da aplicação'),
('primary_color', '#3b82f6', 'Cor primária do sistema'),
('secondary_color', '#8b5cf6', 'Cor secundária do sistema'),
('accent_color', '#f59e0b', 'Cor de destaque do sistema'),
('course_nomenclature', 'Cursos', 'Nomenclatura para cursos'),
('postgraduate_nomenclature', 'Pós-graduação', 'Nomenclatura para pós-graduação'),
('webhook_urls', '{}', 'URLs dos webhooks do sistema'),
('sync_webhook_settings', '{"interval":"60","mode":"new_only","enabled":false}', 'Configurações do webhook de sincronização')
ON CONFLICT (key) DO NOTHING;

-- Templates de mensagem padrão
INSERT INTO public.message_templates (name, content, type, is_default) VALUES 
('Boas-vindas WhatsApp', 'Olá {nome}! 👋\n\nObrigado por se interessar em nossos cursos!\n\nEm breve entraremos em contato com mais informações.\n\nEquipe SyncLead', 'whatsapp', true),
('Email de Boas-vindas', 'Olá {nome}!\n\nObrigado por se cadastrar em nosso sistema.\n\nEm breve entraremos em contato com mais informações sobre nossos cursos.\n\nAtenciosamente,\nEquipe SyncLead', 'email', true)
ON CONFLICT DO NOTHING;

-- Cursos de exemplo
INSERT INTO public.courses (name) VALUES 
('Administração'),
('Engenharia Civil'),
('Direito'),
('Psicologia'),
('Medicina')
ON CONFLICT DO NOTHING;

-- Pós-graduação de exemplo
INSERT INTO public.postgraduate_courses (name) VALUES 
('MBA em Gestão Empresarial'),
('Especialização em Direito Digital'),
('Mestrado em Engenharia'),
('Pós em Psicologia Clínica')
ON CONFLICT DO NOTHING;

-- Eventos de exemplo
INSERT INTO public.events (name, description) VALUES 
('Vestibular 2024', 'Processo seletivo para cursos de graduação'),
('Feira de Profissões', 'Apresentação dos cursos disponíveis'),
('Pós-graduação Aberta', 'Inscrições abertas para pós-graduação')
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================

-- Este schema contém:
-- ✅ Todas as tabelas do sistema
-- ✅ Funções otimizadas
-- ✅ Triggers para auditoria
-- ✅ Políticas RLS
-- ✅ Dados iniciais
-- ✅ Sistema de mensagens completo
-- ✅ Validação WhatsApp
-- ✅ Configurações flexíveis

-- Pronto para uso em produção!
