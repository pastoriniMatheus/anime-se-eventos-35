
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle, XCircle, Clock, Eye, Trash2, Bot, User } from 'lucide-react';
import { useMessages, useClearMessageHistory } from '@/hooks/useMessages';

interface MessageHistoryProps {
  onViewRecipients: (message: any) => void;
}

const MessageHistory = ({ onViewRecipients }: MessageHistoryProps) => {
  const { data: messages = [], isLoading: messagesLoading } = useMessages();
  const clearHistoryMutation = useClearMessageHistory();

  console.log('📋 COMPONENTE - Mensagens carregadas:', messages.length);
  console.log('📋 COMPONENTE - Tipos de filtro encontrados:', [...new Set(messages.map((m: any) => m.filter_type))]);

  // Separar mensagens automáticas das manuais
  const automaticMessages = messages.filter((msg: any) => 
    msg.filter_type === 'auto_new_lead' || 
    msg.filter_type === 'automatic_conversion'
  );
  
  const manualMessages = messages.filter((msg: any) => 
    msg.filter_type !== 'auto_new_lead' && 
    msg.filter_type !== 'automatic_conversion'
  );

  console.log('🤖 COMPONENTE - Mensagens automáticas:', automaticMessages.length);
  console.log('👤 COMPONENTE - Mensagens manuais:', manualMessages.length);
  console.log('🔍 COMPONENTE - Automáticas detalhadas:', automaticMessages.map(m => ({
    id: m.id,
    filter_type: m.filter_type,
    status: m.status,
    sent_at: m.sent_at
  })));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'sending':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getMessageTypeIcon = (filterType: string) => {
    if (filterType === 'auto_new_lead' || filterType === 'automatic_conversion') {
      return <Bot className="h-4 w-4 text-blue-500" />;
    }
    return <User className="h-4 w-4 text-gray-500" />;
  };

  const getMessageTypeLabel = (filterType: string) => {
    switch (filterType) {
      case 'auto_new_lead':
        return 'Cadastro Automático';
      case 'automatic_conversion':
        return 'Conversão Automática';
      default:
        return 'Envio Manual';
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Tem certeza que deseja limpar todo o histórico de mensagens? Esta ação não pode ser desfeita.')) {
      clearHistoryMutation.mutate();
    }
  };

  const renderMessageList = (messageList: any[], title: string, icon: React.ReactNode) => (
    <div className="space-y-4">
      {messageList.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="flex items-center justify-center mb-2">
            {icon}
          </div>
          <p>Nenhuma mensagem {title.toLowerCase()} enviada ainda</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messageList.map((msg: any) => (
            <div key={msg.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(msg.status)}
                  <Badge variant={msg.status === 'sent' ? 'default' : msg.status === 'failed' ? 'destructive' : 'secondary'}>
                    {msg.status === 'sent' ? 'Enviado' : 
                     msg.status === 'failed' ? 'Falhou' : 
                     msg.status === 'sending' ? 'Enviando' : 'Pendente'}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    {getMessageTypeIcon(msg.filter_type)}
                    <Badge variant="outline" className="text-xs">
                      {getMessageTypeLabel(msg.filter_type)}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-500">
                    {msg.recipients_count} destinatário{msg.recipients_count !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {new Date(msg.sent_at).toLocaleString('pt-BR')}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewRecipients(msg)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-sm">
                <p className="font-medium">Mensagem:</p>
                <p className="text-gray-700 mt-1">{msg.content}</p>
              </div>
              {msg.filter_type && (
                <div className="text-xs text-gray-500">
                  Filtro: {getMessageTypeLabel(msg.filter_type)}
                  {msg.filter_value && ` - Lead ID: ${msg.filter_value}`}
                </div>
              )}
              {msg.delivery_code && (
                <div className="text-xs text-gray-400">
                  Código de entrega: {msg.delivery_code}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Histórico de Mensagens</CardTitle>
            <CardDescription>
              Visualize todas as mensagens enviadas, separadas por tipo
            </CardDescription>
          </div>
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              disabled={clearHistoryMutation.isPending}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {clearHistoryMutation.isPending ? 'Limpando...' : 'Limpar Histórico'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {messagesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Carregando histórico...
          </div>
        ) : (
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                Todas ({messages.length})
              </TabsTrigger>
              <TabsTrigger value="automatic">
                <Bot className="h-4 w-4 mr-2" />
                Automáticas ({automaticMessages.length})
              </TabsTrigger>
              <TabsTrigger value="manual">
                <User className="h-4 w-4 mr-2" />
                Manuais ({manualMessages.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {renderMessageList(messages, 'todas as mensagens', <Bot className="h-4 w-4" />)}
            </TabsContent>

            <TabsContent value="automatic">
              {renderMessageList(automaticMessages, 'mensagens automáticas', <Bot className="h-4 w-4" />)}
            </TabsContent>

            <TabsContent value="manual">
              {renderMessageList(manualMessages, 'mensagens manuais', <User className="h-4 w-4" />)}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default MessageHistory;
