
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useMessageRecipients = (messageHistoryId: string) => {
  return useQuery({
    queryKey: ['message_recipients', messageHistoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('message_recipients')
        .select(`
          *,
          leads:lead_id(
            id,
            name,
            email,
            whatsapp,
            courses(name),
            events(name),
            lead_statuses(name, color)
          )
        `)
        .eq('message_history_id', messageHistoryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!messageHistoryId,
  });
};

export const useMessageMetrics = () => {
  return useQuery({
    queryKey: ['message_metrics'],
    queryFn: async () => {
      // Total de mensagens enviadas
      const { count: totalMessages } = await supabase
        .from('message_history')
        .select('*', { count: 'exact', head: true });

      // Total de destinatários
      const { count: totalRecipients } = await supabase
        .from('message_recipients')
        .select('*', { count: 'exact', head: true });

      // Buscar todos os recipients com seus status
      const { data: allRecipients } = await supabase
        .from('message_recipients')
        .select('delivery_status');

      // Contar status corretamente
      const statusCounts = {
        pending: 0,
        sent: 0,
        delivered: 0,
        failed: 0
      };

      allRecipients?.forEach(recipient => {
        const status = recipient.delivery_status;
        if (status in statusCounts) {
          statusCounts[status as keyof typeof statusCounts]++;
        }
      });

      // Calcular taxa de entrega (delivered + sent)
      const deliveredCount = statusCounts.delivered;
      const sentCount = statusCounts.sent;
      const totalSent = deliveredCount + sentCount;
      const deliveryRate = totalRecipients ? Math.round((totalSent / totalRecipients) * 100) : 0;

      return {
        totalMessages: totalMessages || 0,
        totalRecipients: totalRecipients || 0,
        deliveryRate,
        pending: statusCounts.pending,
        delivered: deliveredCount,
        failed: statusCounts.failed
      };
    },
  });
};
