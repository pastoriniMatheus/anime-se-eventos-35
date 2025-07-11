
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
      console.log('Enviando mensagem com parâmetros:', data);
      
      const webhookSettings = systemSettings.find(s => s.key === 'webhook_urls');
      let webhookUrl = '';
      
      if (webhookSettings?.value) {
        try {
          const urls = JSON.parse(webhookSettings.value);
          webhookUrl = urls.whatsapp || '';
        } catch (error) {
          console.error('Erro ao parsear webhook URLs:', error);
        }
      }

      if (!webhookUrl) {
        throw new Error('URL do webhook WhatsApp não configurada');
      }

      const webhookData = {
        type: 'whatsapp',
        content: data.message,
        recipients: [],
        filter_type: data.filterType || null,
        filter_value: data.filterValue || null,
        send_only_to_new: data.sendOnlyToNew,
        delivery_code: Math.random().toString(36).substring(2, 15)
      };

      const { data: response, error } = await supabase.functions.invoke('send-webhook', {
        body: {
          webhook_url: webhookUrl,
          webhook_data: webhookData
        }
      });

      if (error) {
        console.error('Erro ao enviar mensagem:', error);
        throw error;
      }

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
      console.error('Erro completo:', error);
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
        filterType: (filterType === 'all') ? undefined : filterType,
        filterValue: filterValue || undefined,
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
