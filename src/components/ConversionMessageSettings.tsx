
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, AlertCircle, Star } from 'lucide-react';
import { useSystemSettings, useUpdateSystemSetting } from '@/hooks/useSystemSettings';
import { useMessageTemplates } from '@/hooks/useMessages';
import { useLeadStatuses } from '@/hooks/useLeads';

const ConversionMessageSettings = () => {
  const [conversionMessageEnabled, setConversionMessageEnabled] = useState(false);
  const [conversionStatusId, setConversionStatusId] = useState('');
  const { data: settings } = useSystemSettings();
  const { data: templates = [] } = useMessageTemplates();
  const { data: statuses = [] } = useLeadStatuses();
  const updateSetting = useUpdateSystemSetting();

  const conversionTemplate = templates.find((t: any) => t.is_conversion_default);

  // Carregar configurações atuais
  useEffect(() => {
    if (settings) {
      const conversionMessageSetting = settings.find(s => s.key === 'conversion_message_enabled');
      if (conversionMessageSetting?.value) {
        setConversionMessageEnabled(conversionMessageSetting.value === 'true');
      }

      const conversionStatusSetting = settings.find(s => s.key === 'conversion_status_id');
      if (conversionStatusSetting?.value) {
        setConversionStatusId(conversionStatusSetting.value);
      }
    }
  }, [settings]);

  const handleToggleConversionMessage = async (enabled: boolean) => {
    try {
      await updateSetting.mutateAsync({
        key: 'conversion_message_enabled',
        value: enabled.toString()
      });
      setConversionMessageEnabled(enabled);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    }
  };

  const handleConversionStatusChange = async (statusId: string) => {
    try {
      await updateSetting.mutateAsync({
        key: 'conversion_status_id',
        value: statusId
      });
      setConversionStatusId(statusId);
    } catch (error) {
      console.error('Erro ao salvar status de conversão:', error);
    }
  };

  const selectedStatus = statuses.find((s: any) => s.id === conversionStatusId);

  return (
    <div className="space-y-6">
      {/* Configuração do Status de Conversão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Status de Conversão</span>
          </CardTitle>
          <CardDescription>
            Defina qual status representa que um lead foi convertido/matriculado/pago
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="conversion-status">Status que representa conversão</Label>
            <Select value={conversionStatusId} onValueChange={handleConversionStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status de conversão" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status: any) => (
                  <SelectItem key={status.id} value={status.id}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: status.color }}
                      />
                      <span>{status.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedStatus && (
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-sm text-muted-foreground">Status selecionado:</span>
                <Badge 
                  variant="outline" 
                  style={{ 
                    backgroundColor: selectedStatus.color + '20',
                    borderColor: selectedStatus.color,
                    color: selectedStatus.color
                  }}
                >
                  {selectedStatus.name}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuração da Mensagem Automática de Conversão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Mensagem Automática de Conversão</span>
          </CardTitle>
          <CardDescription>
            Configure o envio automático de mensagens quando um lead for convertido/matriculado/pago
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="conversion-message-toggle">
                Ativar envio automático de mensagens para leads convertidos
              </Label>
              <p className="text-sm text-muted-foreground">
                Envia automaticamente a mensagem template de conversão quando um lead for alterado para o status de conversão
              </p>
            </div>
            <Switch
              id="conversion-message-toggle"
              checked={conversionMessageEnabled}
              onCheckedChange={handleToggleConversionMessage}
              disabled={updateSetting.isPending}
            />
          </div>

          {conversionMessageEnabled && (
            <div className="space-y-4">
              {conversionTemplate ? (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Template de Conversão Ativo</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {conversionTemplate.name}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Mensagem:</strong>
                  </p>
                  <p className="text-sm bg-background p-2 rounded border">
                    {conversionTemplate.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Esta mensagem será enviada automaticamente via WhatsApp quando um lead for alterado para o status de conversão.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Nenhum Template de Conversão Definido</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Para ativar o envio automático de conversão, você precisa primeiro definir um template como padrão de conversão na seção "Templates" das mensagens.
                  </p>
                </div>
              )}

              {!selectedStatus && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-800">Status de Conversão Não Definido</span>
                  </div>
                  <p className="text-sm text-red-700">
                    Você precisa definir qual status representa conversão antes de ativar o envio automático.
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
              <li>• Quando um lead tem seu status alterado para o status de conversão, a mensagem padrão de conversão é enviada automaticamente</li>
              <li>• O envio é feito via webhook WhatsApp configurado nas configurações</li>
              <li>• Apenas um template pode ser definido como padrão de conversão por vez</li>
              <li>• O histórico de mensagens automáticas fica disponível na seção "Histórico"</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversionMessageSettings;
