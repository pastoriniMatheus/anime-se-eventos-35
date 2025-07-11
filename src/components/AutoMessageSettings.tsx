
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, AlertCircle, Star } from 'lucide-react';
import { useSystemSettings, useUpdateSystemSetting } from '@/hooks/useSystemSettings';
import { useMessageTemplates } from '@/hooks/useMessages';

const AutoMessageSettings = () => {
  const [autoMessageEnabled, setAutoMessageEnabled] = useState(false);
  const { data: settings } = useSystemSettings();
  const { data: templates = [] } = useMessageTemplates();
  const updateSetting = useUpdateSystemSetting();

  const defaultTemplate = templates.find((t: any) => t.is_default);

  // Carregar configuração atual
  useEffect(() => {
    if (settings) {
      const autoMessageSetting = settings.find(s => s.key === 'auto_message_enabled');
      if (autoMessageSetting?.value) {
        setAutoMessageEnabled(autoMessageSetting.value === 'true');
      }
    }
  }, [settings]);

  const handleToggle = async (enabled: boolean) => {
    try {
      await updateSetting.mutateAsync({
        key: 'auto_message_enabled',
        value: enabled.toString()
      });
      setAutoMessageEnabled(enabled);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Mensagem Automática para Novos Leads</span>
        </CardTitle>
        <CardDescription>
          Configure o envio automático de mensagens para leads recém-cadastrados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-message-toggle">
              Ativar envio automático de mensagens para novos leads
            </Label>
            <p className="text-sm text-muted-foreground">
              Envia automaticamente a mensagem template padrão para cada novo lead cadastrado
            </p>
          </div>
          <Switch
            id="auto-message-toggle"
            checked={autoMessageEnabled}
            onCheckedChange={handleToggle}
            disabled={updateSetting.isPending}
          />
        </div>

        {autoMessageEnabled && (
          <div className="space-y-4">
            {defaultTemplate ? (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Template Padrão Ativo</span>
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    {defaultTemplate.name}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Mensagem:</strong>
                </p>
                <p className="text-sm bg-background p-2 rounded border">
                  {defaultTemplate.content}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Esta mensagem será enviada automaticamente via WhatsApp para cada novo lead cadastrado.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Nenhum Template Padrão Definido</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Para ativar o envio automático, você precisa primeiro definir um template como padrão na seção "Templates" das mensagens.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <MessageSquare className="h-4 w-4" />
            <span className="font-medium">Como funciona:</span>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Quando um novo lead é cadastrado no sistema, a mensagem padrão é enviada automaticamente</li>
            <li>• O envio é feito via webhook WhatsApp configurado nas configurações</li>
            <li>• Apenas um template pode ser definido como padrão por vez</li>
            <li>• O histórico de mensagens automáticas fica disponível na seção "Histórico"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoMessageSettings;
