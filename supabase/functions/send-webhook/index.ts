
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    console.error('❌ Método não permitido:', req.method);
    return new Response(JSON.stringify({
      error: 'Method not allowed',
      details: 'Only POST method is allowed'
    }), { 
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody = await req.text();
    console.log('📥 Body recebido (raw):', requestBody);
    
    let parsedBody;
    try {
      parsedBody = JSON.parse(requestBody);
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON:', parseError);
      return new Response(JSON.stringify({
        error: 'Invalid JSON',
        details: 'Request body must be valid JSON'
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { webhook_url, webhook_data } = parsedBody;

    if (!webhook_url || !webhook_data) {
      console.error('❌ Campos obrigatórios faltando:', { webhook_url: !!webhook_url, webhook_data: !!webhook_data });
      return new Response(JSON.stringify({
        error: 'Missing required fields',
        details: 'webhook_url and webhook_data are required'
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('📤 URL DO WEBHOOK RECEBIDA:', webhook_url);
    console.log('📋 Dados para envio:', {
      type: webhook_data.type,
      has_content: !!webhook_data.content,
      delivery_code: webhook_data.delivery_code,
      filter_type: webhook_data.filter_type,
      filter_value: webhook_data.filter_value,
      send_only_to_new: webhook_data.send_only_to_new
    });

    // Validar se a URL é válida
    let validUrl;
    try {
      validUrl = new URL(webhook_url);
      console.log('✅ URL válida confirmada:', validUrl.toString());
    } catch (urlError) {
      console.error('❌ URL inválida:', webhook_url, urlError);
      return new Response(JSON.stringify({
        error: 'Invalid webhook URL',
        details: 'The provided webhook URL is not valid',
        webhook_url: webhook_url
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Gerar código único de entrega
    const deliveryCode = `MSG-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    console.log('🆔 Código de entrega gerado:', deliveryCode);

    // Buscar leads baseado nos filtros
    let query = supabaseClient
      .from('leads')
      .select(`
        id,
        name,
        email,
        whatsapp,
        course_id,
        event_id,
        status_id,
        courses(name),
        events(name),
        lead_statuses(name, color)
      `);

    // Aplicar filtros corretamente
    if (webhook_data.filter_type && webhook_data.filter_value) {
      console.log('🔍 Aplicando filtro:', webhook_data.filter_type, '=', webhook_data.filter_value);
      switch (webhook_data.filter_type) {
        case 'course':
          query = query.eq('course_id', webhook_data.filter_value);
          break;
        case 'event':
          query = query.eq('event_id', webhook_data.filter_value);
          break;
        case 'status':
          query = query.eq('status_id', webhook_data.filter_value);
          break;
      }
    }

    const { data: allLeads, error: leadsError } = await query;

    if (leadsError) {
      console.error('❌ Erro ao buscar leads:', leadsError);
      return new Response(JSON.stringify({
        error: 'Database error while fetching leads',
        details: leadsError.message
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let leadsToSend = allLeads || [];
    console.log(`📊 Total de leads encontrados: ${leadsToSend.length}`);

    // Filtrar apenas leads que nunca receberam mensagem se solicitado
    if (webhook_data.send_only_to_new) {
      const { data: recipientLeadIds, error: recipientsError } = await supabaseClient
        .from('message_recipients')
        .select('lead_id');
      
      if (recipientsError) {
        console.error('❌ Erro ao buscar recipients:', recipientsError);
      } else {
        const excludeIds = recipientLeadIds?.map(r => r.lead_id) || [];
        leadsToSend = leadsToSend.filter(lead => !excludeIds.includes(lead.id));
        console.log(`📤 Leads após filtro (apenas novos): ${leadsToSend.length}`);
      }
    }

    if (leadsToSend.length === 0) {
      console.log('⚠️ Nenhum lead encontrado com os critérios especificados');
      return new Response(JSON.stringify({
        success: true,
        message: 'Nenhum lead encontrado com os critérios especificados',
        total_leads: 0,
        delivery_code: deliveryCode
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    // Criar registro no histórico de mensagens
    const { data: messageHistory, error: historyError } = await supabaseClient
      .from('message_history')
      .insert({
        type: webhook_data.type,
        content: webhook_data.content,
        delivery_code: deliveryCode,
        filter_type: webhook_data.filter_type,
        filter_value: webhook_data.filter_value,
        recipients_count: leadsToSend.length,
        status: 'sending'
      })
      .select()
      .single();

    if (historyError) {
      console.error('❌ Erro ao criar histórico:', historyError);
      return new Response(JSON.stringify({
        error: 'Database error while creating message history',
        details: historyError.message
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Histórico de mensagem criado:', messageHistory.id);

    // Criar registros de destinatários
    const recipients = leadsToSend.map(lead => ({
      message_history_id: messageHistory.id,
      lead_id: lead.id,
      delivery_status: 'pending'
    }));

    const { error: recipientsError } = await supabaseClient
      .from('message_recipients')
      .insert(recipients);

    if (recipientsError) {
      console.error('❌ Erro ao criar recipients:', recipientsError);
      // Continuar mesmo com erro nos recipients
    } else {
      console.log('✅ Recipients criados:', recipients.length);
    }

    // Preparar dados para envio ao webhook
    const dataToSend = {
      message_id: messageHistory.id,
      delivery_code: deliveryCode,
      type: webhook_data.type,
      content: webhook_data.content,
      filter_type: webhook_data.filter_type,
      filter_value: webhook_data.filter_value,
      send_only_to_new: webhook_data.send_only_to_new,
      total_recipients: leadsToSend.length,
      leads: leadsToSend.map(lead => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        whatsapp: lead.whatsapp,
        course: lead.courses?.name || null,
        event: lead.events?.name || null,
        status: lead.lead_statuses?.name || null,
        status_color: lead.lead_statuses?.color || null
      })),
      timestamp: new Date().toISOString(),
      callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/message-delivery-webhook-endpoint`
    };

    console.log('🚀 ENVIANDO POST PARA URL:', webhook_url);
    console.log('📦 Total de leads no payload:', dataToSend.leads.length);

    // Enviar webhook com timeout e headers específicos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Supabase-Lead-System/1.0',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(dataToSend),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('📥 STATUS DA RESPOSTA:', response.status);
      console.log('📥 HEADERS DA RESPOSTA:', Object.fromEntries(response.headers.entries()));

      let responseText = '';
      try {
        responseText = await response.text();
        console.log('📥 CORPO DA RESPOSTA:', responseText);
      } catch (textError) {
        console.error('❌ Erro ao ler resposta:', textError);
        responseText = 'Erro ao ler resposta do webhook';
      }
      
      // Atualizar status no histórico
      const finalStatus = response.ok ? 'sent' : 'failed';
      await supabaseClient
        .from('message_history')
        .update({ 
          status: finalStatus,
          webhook_response: responseText 
        })
        .eq('id', messageHistory.id);

      // Atualizar status dos recipients se enviado com sucesso
      if (response.ok) {
        await supabaseClient
          .from('message_recipients')
          .update({ delivery_status: 'sent', sent_at: new Date().toISOString() })
          .eq('message_history_id', messageHistory.id);
      }
      
      if (!response.ok) {
        console.error('❌ WEBHOOK RETORNOU ERRO:', {
          status: response.status,
          statusText: response.statusText,
          body: responseText,
          url: webhook_url
        });
        
        let errorMessage = `Webhook retornou status ${response.status}`;
        let errorDetails = responseText;
        
        if (response.status === 404) {
          errorMessage = 'Webhook não encontrado (404)';
          errorDetails = 'Verifique se a URL está correta: ' + webhook_url;
        } else if (response.status === 405) {
          errorMessage = 'Método não permitido (405)';
          errorDetails = 'O webhook não aceita POST. URL: ' + webhook_url;
        } else if (response.status === 400) {
          errorMessage = 'Dados inválidos (400)';
          errorDetails = 'O webhook rejeitou os dados enviados: ' + responseText;
        } else if (response.status === 500) {
          errorMessage = 'Erro interno do servidor (500)';
          errorDetails = 'Problema no n8n: ' + responseText;
        }
        
        return new Response(JSON.stringify({
          error: errorMessage,
          details: errorDetails,
          webhook_response: responseText,
          status_code: response.status,
          webhook_url: webhook_url,
          sent_data: {
            message_id: messageHistory.id,
            delivery_code: deliveryCode,
            total_leads: leadsToSend.length
          }
        }), { 
          status: 422,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ WEBHOOK EXECUTADO COM SUCESSO');
      
      return new Response(JSON.stringify({
        success: true,
        status: response.status,
        statusText: response.statusText,
        response: responseText,
        webhook_url: webhook_url,
        message: 'Webhook sent successfully',
        delivery_code: deliveryCode,
        message_id: messageHistory.id,
        total_leads_sent: leadsToSend.length,
        callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/message-delivery-webhook-endpoint`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      console.error('❌ ERRO AO CHAMAR WEBHOOK:', {
        error: fetchError,
        message: fetchError.message,
        name: fetchError.name,
        url: webhook_url
      });

      // Atualizar status como falha
      await supabaseClient
        .from('message_history')
        .update({ 
          status: 'failed',
          webhook_response: fetchError.message 
        })
        .eq('id', messageHistory.id);
      
      let errorMessage = 'Erro ao conectar com o webhook';
      let errorDetails: any = {};
      
      if (fetchError.name === 'AbortError') {
        errorMessage = 'Timeout: Webhook demorou mais de 30 segundos';
        errorDetails = { timeout: true, duration: '30s' };
      } else if (fetchError.message?.includes('fetch')) {
        errorMessage = 'Não foi possível conectar ao webhook';
        errorDetails = { connection_error: true, url: webhook_url };
      } else {
        errorDetails = { 
          error_type: fetchError.name || 'UnknownError',
          original_message: fetchError.message
        };
      }
      
      return new Response(JSON.stringify({
        error: errorMessage,
        details: errorDetails,
        webhook_url: webhook_url,
        message_id: messageHistory.id,
        delivery_code: deliveryCode
      }), { 
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error: any) {
    console.error('💥 ERRO GERAL NA EDGE FUNCTION:', {
      error: error,
      message: error.message,
      stack: error.stack
    });
    
    return new Response(JSON.stringify({
      error: 'Webhook execution failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
