
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Globe, Webhook, Database, MessageSquare, QrCode, Users, FileText, Send, RefreshCw, CheckCircle, AlertTriangle, Download, Upload, BarChart3, Settings, Zap } from 'lucide-react';
import { useSystemSettings } from '@/hooks/useSystemSettings';

interface WebhookUrls {
  whatsapp?: string;
  email?: string;
  sms?: string;
  whatsappValidation?: string;
  sync?: string;
}

const APIsSettings = () => {
  const { data: systemSettings = [] } = useSystemSettings();
  
  const webhookSettings = systemSettings.find(s => s.key === 'webhook_urls');
  let webhookUrls: WebhookUrls = {};
  
  if (webhookSettings?.value) {
    try {
      webhookUrls = JSON.parse(webhookSettings.value);
    } catch (e) {
      console.error('Erro ao processar URLs dos webhooks:', e);
    }
  }

  const supabaseUrl = "https://iznfrkdsmbtynmifqcdd.supabase.co";
  const currentDomain = window.location.origin;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>APIs e Endpoints do Sistema SyncLead</span>
          </CardTitle>
          <CardDescription>
            Documentação completa de todas as APIs, Edge Functions e webhooks disponíveis no sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Seção de Webhooks Configurados */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Webhook className="h-5 w-5" />
              <span>Webhooks Configurados</span>
            </h3>
            <div className="grid gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    <span>WhatsApp</span>
                  </h4>
                  <Badge variant="outline" className="bg-green-50 text-green-700">POST</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Webhook para envio de mensagens WhatsApp com URLs de callback incluídas
                </p>
                <code className="text-xs bg-gray-100 p-2 rounded block mb-3">
                  {webhookUrls.whatsapp || 'Não configurado'}
                </code>
                <div className="mt-3">
                  <p className="text-sm font-medium mb-1">Payload enviado pelo sistema:</p>
                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
{`{
  "message_id": "uuid-do-historico",
  "delivery_code": "MSG-timestamp-hash",
  "type": "whatsapp",
  "content": "Conteúdo da mensagem",
  "total_recipients": 1,
  "leads": [
    {
      "id": "uuid-do-lead",
      "name": "Nome do Lead",
      "whatsapp": "5582999999999",
      "email": "lead@exemplo.com",
      "course": "Nome do Curso",
      "event": "Nome do Evento"
    }
  ],
  "callback_urls": {
    "message_delivery": "${supabaseUrl}/functions/v1/message-delivery-webhook-endpoint",
    "whatsapp_validation": "${supabaseUrl}/functions/v1/whatsapp-validation-callback"
  },
  "timestamp": "2024-01-01T10:00:00.000Z"
}`}
                  </pre>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Send className="h-4 w-4 text-blue-600" />
                    <span>Email</span>
                  </h4>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">POST</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Webhook para envio de emails
                </p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  {webhookUrls.email || 'Não configurado'}
                </code>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-purple-600" />
                    <span>SMS</span>
                  </h4>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">POST</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Webhook para envio de mensagens SMS
                </p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  {webhookUrls.sms || 'Não configurado'}
                </code>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-orange-600" />
                    <span>Validação WhatsApp</span>
                  </h4>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700">POST</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Webhook para validação de números WhatsApp
                </p>
                <code className="text-xs bg-gray-100 p-2 rounded block mb-3">
                  {webhookUrls.whatsappValidation || 'Não configurado'}
                </code>
                <div className="mt-3">
                  <p className="text-sm font-medium mb-1">Payload enviado:</p>
                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
{`{
  "whatsapp": "5582999999999",
  "validation_id": "uuid-validacao",
  "callback_url": "${supabaseUrl}/functions/v1/whatsapp-validation-callback"
}`}
                  </pre>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 text-indigo-600" />
                    <span>Sincronização</span>
                  </h4>
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700">POST</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Webhook para sincronização automática de leads
                </p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  {webhookUrls.sync || 'Não configurado'}
                </code>
              </div>
            </div>
          </div>

          <Separator />

          {/* Seção de Edge Functions */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Edge Functions (Supabase)</span>
            </h3>
            <div className="grid gap-4">
              
              {/* Funções de Captura e Redirecionamento */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <QrCode className="h-4 w-4" />
                    <span>QR Redirect</span>
                  </h4>
                  <Badge variant="secondary">GET</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Redireciona QR codes para WhatsApp ou formulários
                </p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  {supabaseUrl}/functions/v1/qr-redirect/[short_url]
                </code>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Lead Capture</span>
                  </h4>
                  <Badge variant="secondary">POST</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Captura novos leads do formulário público
                </p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  {supabaseUrl}/functions/v1/lead-capture
                </code>
              </div>

              {/* Funções de Mensagens */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Send className="h-4 w-4" />
                    <span>Send Webhook</span>
                  </h4>
                  <Badge variant="secondary">POST</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Envia mensagens via webhooks configurados (com callbacks)
                </p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  {supabaseUrl}/functions/v1/send-webhook
                </code>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Message Delivery Callback</span>
                  </h4>
                  <Badge variant="secondary">POST</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Endpoint para confirmação de entrega de mensagens
                </p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  {supabaseUrl}/functions/v1/message-delivery-webhook-endpoint
                </code>
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">Payload esperado:</p>
                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
{`{
  "delivery_code": "MSG-timestamp-hash",
  "lead_identifier": "email@exemplo.com ou 5582999999999",
  "status": "delivered" // ou "failed"
}`}
                  </pre>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Zap className="h-4 w-4" />
                    <span>Message Delivery Proxy</span>
                  </h4>
                  <Badge variant="secondary">POST</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Proxy para entrega de mensagens
                </p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  {supabaseUrl}/functions/v1/message-delivery-proxy
                </code>
              </div>

              {/* Funções de Validação */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Validate WhatsApp</span>
                  </h4>
                  <Badge variant="secondary">POST</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Valida números de WhatsApp via webhook externo
                </p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  {supabaseUrl}/functions/v1/validate-whatsapp
                </code>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>WhatsApp Validation Callback</span>
                  </h4>
                  <Badge variant="secondary">POST/GET</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Callback para resultado da validação WhatsApp
                </p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  {supabaseUrl}/functions/v1/whatsapp-validation-callback
                </code>
              </div>

              {/* Funções de Status */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Lead Status Callback</span>
                  </h4>
                  <Badge variant="secondary">POST</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Callback para atualização de status de leads
                </p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  {supabaseUrl}/functions/v1/lead-status-callback
                </code>
              </div>

              {/* Funções de Sincronização */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4" />
                    <span>Sync Leads</span>
                  </h4>
                  <Badge variant="secondary">POST</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Sincronização automática de leads
                </p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  {supabaseUrl}/functions/v1/sync-leads
                </code>
              </div>

              {/* Funções de Relatórios */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Generate Event Report</span>
                  </h4>
                  <Badge variant="secondary">POST</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Gera relatórios detalhados de eventos
                </p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  {supabaseUrl}/functions/v1/generate-event-report
                </code>
              </div>

              {/* Funções de Banco de Dados */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Database Export</span>
                  </h4>
                  <Badge variant="secondary">POST</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Exporta dados do banco de dados
                </p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  {supabaseUrl}/functions/v1/database-export
                </code>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>Database Import</span>
                  </h4>
                  <Badge variant="secondary">POST</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Importa dados para o banco de dados
                </p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  {supabaseUrl}/functions/v1/database-import
                </code>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Database Installer</span>
                  </h4>
                  <Badge variant="secondary">POST</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Instala esquema completo do banco de dados
                </p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  {supabaseUrl}/functions/v1/database-installer
                </code>
              </div>
            </div>
          </div>

          <Separator />

          {/* Seção de URLs do Sistema */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>URLs Públicas do Sistema</span>
            </h3>
            <div className="grid gap-4">
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Formulário de Captura</span>
                  </h4>
                  <Badge variant="outline">GET</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  URL pública para captura de leads
                </p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  {currentDomain}/form?event=[NOME_EVENTO]&tracking=[ID_RASTREAMENTO]
                </code>
                <div className="mt-2">
                  <p className="text-sm font-medium">Parâmetros:</p>
                  <ul className="text-xs text-gray-600 list-disc list-inside">
                    <li>event: Nome do evento (obrigatório)</li>
                    <li>tracking: ID de rastreamento (opcional)</li>
                  </ul>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <QrCode className="h-4 w-4" />
                    <span>QR Code Redirect</span>
                  </h4>
                  <Badge variant="outline">GET</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  URL de redirecionamento para QR codes
                </p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  {supabaseUrl}/functions/v1/qr-redirect/[SHORT_CODE]
                </code>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Instalação do Sistema</span>
                  </h4>
                  <Badge variant="outline">GET/POST</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  URL para instalação inicial do sistema
                </p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  {currentDomain}/secret-install
                </code>
              </div>
            </div>
          </div>

          <Separator />

          {/* Seção de Autenticação e Segurança */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Autenticação e Segurança</span>
            </h3>
            <div className="border rounded-lg p-4">
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  O sistema utiliza autenticação customizada baseada em usuários autorizados armazenados no banco de dados.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Edge Functions:</strong> Utilizam Row Level Security (RLS) e autenticação via Supabase Service Role Key.
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-sm text-green-800">
                    <strong>URLs Públicas:</strong> Formulários e QR codes não requerem autenticação para funcionamento.
                  </p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded p-3">
                  <p className="text-sm text-orange-800">
                    <strong>Webhooks:</strong> Callbacks incluem URLs de confirmação para rastreamento de entregas.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Seção de Exemplos de Integração */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Exemplos de Integração</h3>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">1. Validando número WhatsApp:</h4>
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
{`// JavaScript/Node.js
const response = await fetch('${supabaseUrl}/functions/v1/validate-whatsapp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer SUPABASE_ANON_KEY'
  },
  body: JSON.stringify({
    whatsapp: '5582999999999',
    validation_id: 'uuid-unico'
  })
});`}
                </pre>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">2. Confirmando entrega de mensagem:</h4>
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
{`// cURL para confirmar entrega
curl -X POST "${supabaseUrl}/functions/v1/message-delivery-webhook-endpoint" \\
  -H "Content-Type: application/json" \\
  -d '{
    "delivery_code": "MSG-1234567890-abc123",
    "lead_identifier": "lead@exemplo.com",
    "status": "delivered"
  }'`}
                </pre>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">3. Capturando lead via formulário:</h4>
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
{`// POST para captura de lead
const leadData = {
  name: "João Silva",
  email: "joao@exemplo.com",
  whatsapp: "5582999999999",
  event_name: "Vestibular 2024",
  course_name: "Administração"
};

fetch('${supabaseUrl}/functions/v1/lead-capture', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(leadData)
});`}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIsSettings;
