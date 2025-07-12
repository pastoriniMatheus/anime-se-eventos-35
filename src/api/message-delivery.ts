
import { supabase } from '@/integrations/supabase/client';

// Função para confirmar entrega de mensagem usando a Edge Function do Supabase
export const confirmMessageDelivery = async (deliveryCode: string, leadIdentifier: string, status: string = 'delivered') => {
  try {
    console.log('🔄 Confirmando entrega da mensagem:', {
      deliveryCode,
      leadIdentifier,
      status
    });

    // Chamar a Edge Function message-delivery-webhook diretamente
    const { data, error } = await supabase.functions.invoke('message-delivery-webhook', {
      body: {
        delivery_code: deliveryCode,
        lead_identifier: leadIdentifier,
        status: status
      }
    });

    if (error) {
      console.error('❌ Erro na Edge Function:', error);
      throw error;
    }

    console.log('✅ Resposta da confirmação de entrega:', data);
    return data;
    
  } catch (error) {
    console.error('💥 Erro ao confirmar entrega da mensagem:', error);
    throw error;
  }
};

// Função para confirmar entrega usando o callback direto do banco
export const confirmDeliveryCallback = async (deliveryCode: string, leadIdentifier: string, status: string = 'delivered') => {
  try {
    console.log('🔄 Confirmando entrega via callback:', {
      deliveryCode,
      leadIdentifier,
      status
    });

    const { data, error } = await supabase.rpc('confirm_message_delivery', {
      p_delivery_code: deliveryCode,
      p_lead_identifier: leadIdentifier,
      p_status: status
    });

    if (error) {
      console.error('❌ Erro no callback de confirmação:', error);
      throw error;
    }

    console.log('✅ Confirmação de entrega realizada:', data);
    return data;
    
  } catch (error) {
    console.error('💥 Erro ao confirmar entrega via callback:', error);
    throw error;
  }
};

// Função para obter a URL do webhook de entrega (nova Edge Function)
export const getDeliveryWebhookUrl = () => {
  // URL da Edge Function do Supabase
  return 'https://iznfrkdsmbtynmifqcdd.supabase.co/functions/v1/message-delivery-webhook-endpoint';
};
