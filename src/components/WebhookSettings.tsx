import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Webhook, Save, Clock, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSystemSettings, useUpdateSystemSetting } from '@/hooks/useSystemSettings';

const WebhookSettings = () => {
  const { toast } = useToast();
  const { data: settings = [] } = useSystemSettings();
  const updateSetting = useUpdateSystemSetting();

  const [webhooks, setWebhooks] = useState({
    whatsapp: 'https://n8n.intrategica.com.br/webhook-test/disparos',
    email: 'https://n8n.intrategica.com.br/webhook-test/disparos',
    sms: 'https://n8n.intrategica.com.br/webhook-test/disparos',
    whatsappValidation: 'https://n8n-wh.intrategica.com.br/webhook/qrcode-cesmac',
    sync: '' // Novo webhook de sincronização
  });

  const [syncSettings, setSyncSettings] = useState({
    interval: '60', // minutos
    mode: 'new_only', // 'all' ou 'new_only'
    enabled: false
  });

  // Carregar configurações salvas
  useEffect(() => {
    const webhookSettings = settings.find(s => s.key === 'webhook_urls');
    const syncWebhookSettings = settings.find(s => s.key === 'sync_webhook_settings');
    
    if (webhookSettings?.value) {
      const urls = typeof webhookSettings.value === 'string' 
        ? JSON.parse(webhookSettings.value) 
        : webhookSettings.value;
      setWebhooks(prev => ({ ...prev, ...urls }));
    }

    if (syncWebhookSettings?.value) {
      const syncConfig = typeof syncWebhookSettings.value === 'string'
        ? JSON.parse(syncWebhookSettings.value)
        : syncWebhookSettings.value;
      setSyncSettings(prev => ({ ...prev, ...syncConfig }));
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      // Salvar URLs dos webhooks
      await updateSetting.mutateAsync({
        key: 'webhook_urls',
        value: webhooks
      });

      // Salvar configurações de sincronização
      await updateSetting.mutateAsync({
        key: 'sync_webhook_settings',
        value: syncSettings
      });

      // Se a sincronização está habilitada, configurar o cron job
      if (syncSettings.enabled && webhooks.sync) {
        await setupSyncWebhook();
      }

      toast({
        title: "Webhooks salvos",
        description: "Configurações de webhooks atualizadas com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao salvar webhooks:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações de webhooks",
        variant: "destructive",
      });
    }
  };

  const setupSyncWebhook = async () => {
    try {
      // Aqui implementaremos a lógica para configurar o webhook de sincronização
      console.log('Configurando webhook de sincronização:', {
        url: webhooks.sync,
        interval: syncSettings.interval,
        mode: syncSettings.mode
      });
    } catch (error) {
      console.error('Erro ao configurar webhook de sincronização:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setWebhooks(prev => ({ ...prev, [field]: value }));
  };

  const handleSyncSettingChange = (field: string, value: any) => {
    setSyncSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Webhooks Básicos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Webhook className="h-5 w-5" />
            <span>Configuração de Webhooks</span>
          </CardTitle>
          <CardDescription>
            Configure as URLs dos webhooks para diferentes tipos de mensagens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-whatsapp">Webhook WhatsApp</Label>
              <Input
                id="webhook-whatsapp"
                value={webhooks.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                placeholder="https://exemplo.com/webhook/whatsapp"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook-email">Webhook Email</Label>
              <Input
                id="webhook-email"
                value={webhooks.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="https://exemplo.com/webhook/email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook-sms">Webhook SMS</Label>
              <Input
                id="webhook-sms"
                value={webhooks.sms}
                onChange={(e) => handleChange('sms', e.target.value)}
                placeholder="https://exemplo.com/webhook/sms"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook-validation">Webhook de Verificação WhatsApp</Label>
              <Input
                id="webhook-validation"
                value={webhooks.whatsappValidation}
                onChange={(e) => handleChange('whatsappValidation', e.target.value)}
                placeholder="https://exemplo.com/webhook/validation"
              />
              <p className="text-sm text-muted-foreground">
                URL para validar números de WhatsApp antes do envio
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhook de Sincronização */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5" />
            <span>Webhook de Sincronização</span>
          </CardTitle>
          <CardDescription>
            Configure o webhook para sincronizar leads automaticamente em intervalos regulares
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-sync">URL do Webhook de Sincronização</Label>
              <Input
                id="webhook-sync"
                value={webhooks.sync}
                onChange={(e) => handleChange('sync', e.target.value)}
                placeholder="https://exemplo.com/webhook/sync-leads"
              />
              <p className="text-sm text-muted-foreground">
                URL que receberá os dados dos leads via POST
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sync-interval">Intervalo de Sincronização</Label>
                <Select 
                  value={syncSettings.interval} 
                  onValueChange={(value) => handleSyncSettingChange('interval', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o intervalo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    <SelectItem value="240">4 horas</SelectItem>
                    <SelectItem value="480">8 horas</SelectItem>
                    <SelectItem value="720">12 horas</SelectItem>
                    <SelectItem value="1440">24 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sync-mode">Modo de Sincronização</Label>
                <Select 
                  value={syncSettings.mode} 
                  onValueChange={(value) => handleSyncSettingChange('mode', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o modo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Enviar todos os leads sempre</SelectItem>
                    <SelectItem value="new_only">Enviar apenas leads novos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sync-enabled"
                checked={syncSettings.enabled}
                onChange={(e) => handleSyncSettingChange('enabled', e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="sync-enabled">Habilitar sincronização automática</Label>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Como funciona:</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Os leads serão enviados automaticamente no intervalo configurado</li>
                <li>• No modo "todos os leads", sempre envia todos os leads do banco</li>
                <li>• No modo "apenas novos", envia apenas leads criados após o último envio bem-sucedido</li>
                <li>• Os dados são enviados via POST como um array JSON de leads</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 w-full">
        <Save className="h-4 w-4 mr-2" />
        Salvar Configurações de Webhooks
      </Button>
    </div>
  );
};

export default WebhookSettings;
