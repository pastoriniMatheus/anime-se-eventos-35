
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useMessageSender = (systemSettings: any[]) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);

  const sendMessageMutation = useMutation({
    mutationFn: async (data: {
      message: string;
      filterType?: string;
      filterValue?: string;
      sendOnlyToNew: boolean;
    }) => {
      console.log('🚀 Enviando mensagem com parâmetros:', data);
      
      const webhookSettings = systemSettings.find(s => s.key === 'webhook_urls');
      let webhookUrl = '';
      
      if (webhookSettings?.value) {
        try {
          const urls = JSON.parse(webhookSettings.value);
          webhookUrl = urls.whatsapp || '';
          console.log('🔗 URL do webhook encontrada:', webhookUrl);
        } catch (error) {
          console.error('❌ Erro ao parsear webhook URLs:', error);
        }
      }

      if (!webhookUrl) {
        throw new Error('URL do webhook WhatsApp não configurada');
      }

      // Gerar código de entrega único
      const deliveryCode = `MSG-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      console.log('🏷️ Código de entrega gerado:', deliveryCode);

      // Preparar dados do webhook
      const webhookData = {
        type: 'whatsapp',
        content: data.message,
        filter_type: data.filterType === 'all' ? null : data.filterType,
        filter_value: data.filterType === 'all' ? null : data.filterValue,
        send_only_to_new: data.sendOnlyToNew,
        delivery_code: deliveryCode,
        callback_url: `https://iznfrkdsmbtynmifqcdd.supabase.co/functions/v1/message-delivery-webhook-endpoint`,
        timestamp: new Date().toISOString()
      };

      console.log('📦 Dados do webhook preparados:', webhookData);

      // Chamar a edge function send-webhook
      const { data: response, error } = await supabase.functions.invoke('send-webhook', {
        body: {
          webhook_url: webhookUrl,
          webhook_data: webhookData
        }
      });

      if (error) {
        console.error('❌ Erro da edge function send-webhook:', error);
        throw error;
      }

      console.log('✅ Resposta da edge function send-webhook:', response);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['message_history'] });
      queryClient.invalidateQueries({ queryKey: ['contacts-never-messaged'] });
    },
    onError: (error: any) => {
      console.error('💥 Erro completo no envio de mensagem:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message || "Ocorreu um erro ao enviar a mensagem",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = async (
    message: string,
    filterType: string,
    filterValue: string,
    sendOnlyToNew: boolean,
    onSuccess: () => void
  ) => {
    if (!message.trim()) {
      toast({
        title: "Mensagem vazia",
        description: "Digite uma mensagem antes de enviar",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      await sendMessageMutation.mutateAsync({
        message: message.trim(),
        filterType: filterType,
        filterValue: filterValue,
        sendOnlyToNew
      });
      onSuccess();
    } finally {
      setIsSending(false);
    }
  };

  return {
    handleSendMessage,
    isSending
  };
};
