
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Clock, Eye, Trash2 } from 'lucide-react';
import { useMessages, useClearMessageHistory } from '@/hooks/useMessages';

interface MessageHistoryProps {
  onViewRecipients: (message: any) => void;
}

const MessageHistory = ({ onViewRecipients }: MessageHistoryProps) => {
  const { data: messages = [], isLoading: messagesLoading } = useMessages();
  const clearHistoryMutation = useClearMessageHistory();

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

  const handleClearHistory = () => {
    if (window.confirm('Tem certeza que deseja limpar todo o histórico de mensagens? Esta ação não pode ser desfeita.')) {
      clearHistoryMutation.mutate();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Histórico de Mensagens</CardTitle>
            <CardDescription>
              Visualize todas as mensagens enviadas
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
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma mensagem enviada ainda
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg: any) => (
              <div key={msg.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(msg.status)}
                    <Badge variant={msg.status === 'sent' ? 'default' : msg.status === 'failed' ? 'destructive' : 'secondary'}>
                      {msg.status === 'sent' ? 'Enviado' : 
                       msg.status === 'failed' ? 'Falhou' : 
                       msg.status === 'sending' ? 'Enviando' : 'Pendente'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {msg.recipients_count} destinatários
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
                    Filtro: {msg.filter_type} - {msg.filter_value}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MessageHistory;
