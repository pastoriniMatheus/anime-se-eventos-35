
-- Criar tabela para rastrear sessões de scan
CREATE TABLE public.scan_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code_id UUID REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  converted BOOLEAN NOT NULL DEFAULT false,
  converted_at TIMESTAMP WITH TIME ZONE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar coluna scan_session_id na tabela leads para vincular
ALTER TABLE public.leads 
ADD COLUMN scan_session_id UUID REFERENCES public.scan_sessions(id) ON DELETE SET NULL;

-- Criar índices para melhor performance
CREATE INDEX idx_scan_sessions_qr_code_id ON public.scan_sessions(qr_code_id);
CREATE INDEX idx_scan_sessions_event_id ON public.scan_sessions(event_id);
CREATE INDEX idx_scan_sessions_converted ON public.scan_sessions(converted);
CREATE INDEX idx_scan_sessions_scanned_at ON public.scan_sessions(scanned_at);
CREATE INDEX idx_leads_scan_session_id ON public.leads(scan_session_id);

-- Habilitar RLS (se necessário)
ALTER TABLE public.scan_sessions ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS (permitir acesso público para este caso)
CREATE POLICY "Allow all access to scan_sessions" 
  ON public.scan_sessions 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
