
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
}

serve(async (req) => {
  console.log('🔄 Webhook endpoint chamado:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Respondendo CORS preflight');
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    if (req.method !== 'POST') {
      console.log('❌ Método não permitido:', req.method);
      return new Response(
        JSON.stringify({ 
          error: 'Method not allowed, only POST is accepted',
          method_received: req.method,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 405, 
          headers: corsHeaders
        }
      );
    }

    // Ler o body da requisição
    let body;
    try {
      const requestText = await req.text();
      console.log('📥 Body recebido (raw):', requestText);
      
      if (!requestText.trim()) {
        throw new Error('Body vazio');
      }
      
      body = JSON.parse(requestText);
      console.log('📋 Body parseado:', body);
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON in request body',
          details: (parseError as Error).message,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 400, 
          headers: corsHeaders
        }
      );
    }

    const { delivery_code, lead_identifier, status = 'delivered' } = body;

    if (!delivery_code || !lead_identifier) {
      console.log('❌ Campos obrigatórios faltando:', { 
        delivery_code: !!delivery_code, 
        lead_identifier: !!lead_identifier 
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'delivery_code and lead_identifier are required',
          received: { delivery_code, lead_identifier, status },
          timestamp: new Date().toISOString()
        }),
        { 
          status: 400, 
          headers: corsHeaders
        }
      );
    }

    console.log('🔄 Processando confirmação de entrega:', {
      delivery_code,
      lead_identifier,
      status
    });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Primeiro, verificar se o delivery_code existe na tabela message_history
    console.log('🔍 Verificando se delivery_code existe:', delivery_code);
    
    const { data: messageHistory, error: historyError } = await supabaseClient
      .from('message_history')
      .select('id, delivery_code, type, content')
      .eq('delivery_code', delivery_code)
      .single();

    if (historyError || !messageHistory) {
      console.log('❌ Delivery code não encontrado:', { delivery_code, error: historyError });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid delivery code - not found in message history',
          delivery_code: delivery_code,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 400, 
          headers: corsHeaders
        }
      );
    }

    console.log('✅ Delivery code encontrado:', messageHistory);

    // Buscar o lead pelo identificador
    const { data: lead, error: leadError } = await supabaseClient
      .from('leads')
      .select('id, name, email, whatsapp')
      .or(`email.eq.${lead_identifier},whatsapp.eq.${lead_identifier}`)
      .single();

    if (leadError || !lead) {
      console.log('❌ Lead não encontrado:', { lead_identifier, error: leadError });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Lead not found with provided identifier',
          lead_identifier: lead_identifier,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 400, 
          headers: corsHeaders
        }
      );
    }

    console.log('✅ Lead encontrado:', lead);

    // Atualizar o status de entrega na tabela message_recipients
    const { data: updateResult, error: updateError } = await supabaseClient
      .from('message_recipients')
      .update({
        delivery_status: status,
        delivered_at: status === 'delivered' ? new Date().toISOString() : null,
        error_message: status === 'failed' ? 'Delivery failed via webhook' : null
      })
      .eq('message_history_id', messageHistory.id)
      .eq('lead_id', lead.id)
      .select();

    if (updateError) {
      console.error('❌ Erro ao atualizar message_recipients:', updateError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to update delivery status: ' + updateError.message,
          delivery_code: delivery_code,
          lead_identifier: lead_identifier,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 500, 
          headers: corsHeaders
        }
      );
    }

    console.log('✅ Status de entrega atualizado:', updateResult);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Delivery status updated successfully',
        data: {
          delivery_code: delivery_code,
          lead_identifier: lead_identifier,
          lead_name: lead.name,
          status: status,
          message_type: messageHistory.type,
          updated_recipients: updateResult?.length || 0
        },
        processed_at: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: corsHeaders
      }
    );

  } catch (error) {
    console.error('💥 Erro inesperado no webhook endpoint:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro interno do servidor',
        details: (error as Error).message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: corsHeaders
      }
    );
  }
})
