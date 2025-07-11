
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Lead capture request received');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(JSON.stringify({ 
        error: 'Server configuration error',
        success: false
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      name, 
      email, 
      whatsapp, 
      eventName, 
      trackingId, 
      courseId, 
      postgraduateCourseId, 
      courseType,
      receiptUrl,
      scanSessionId
    } = await req.json();

    console.log('Form data received:', { 
      name, 
      email, 
      whatsapp, 
      eventName, 
      trackingId, 
      courseType,
      receiptUrl,
      scanSessionId,
      courseId: courseId || 'null',
      postgraduateCourseId: postgraduateCourseId || 'null'
    });

    // Validações básicas
    if (!name || name.trim() === '') {
      return new Response(JSON.stringify({ 
        error: 'Nome é obrigatório',
        success: false
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!whatsapp || whatsapp.trim() === '') {
      return new Response(JSON.stringify({ 
        error: 'WhatsApp é obrigatório',
        success: false
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Buscar evento pelo nome se fornecido
    let eventId = null;
    if (eventName && eventName.trim() !== '') {
      console.log('Buscando evento:', eventName);
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id')
        .eq('name', eventName)
        .single();

      if (eventError) {
        console.error('Erro ao buscar evento:', eventError);
      } else if (event) {
        eventId = event.id;
        console.log('Evento encontrado:', eventId);
      }
    }

    // Buscar status "Pendente" para definir como padrão
    const { data: pendingStatus } = await supabase
      .from('lead_statuses')
      .select('id')
      .ilike('name', 'pendente')
      .single();

    // Preparar dados do lead
    const leadData: any = {
      name: name.trim(),
      whatsapp: whatsapp.trim(),
      event_id: eventId,
      scan_session_id: scanSessionId,
      status_id: pendingStatus?.id || null
    };

    // Adicionar campos opcionais
    if (email && email.trim() !== '') {
      leadData.email = email.trim();
    }

    if (courseId && courseId.trim() !== '') {
      leadData.course_id = courseId;
    }

    if (postgraduateCourseId && postgraduateCourseId.trim() !== '') {
      leadData.postgraduate_course_id = postgraduateCourseId;
    }

    if (courseType && courseType.trim() !== '') {
      leadData.course_type = courseType;
    }

    if (receiptUrl && receiptUrl.trim() !== '') {
      leadData.receipt_url = receiptUrl;
    }

    console.log('Criando lead com dados:', leadData);

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert([leadData])
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
      `)
      .single();

    if (leadError) {
      console.error('Erro ao criar lead:', leadError);
      return new Response(JSON.stringify({ 
        error: 'Erro ao salvar lead: ' + leadError.message,
        success: false
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Lead criado com sucesso:', lead.id);

    // Atualizar scan session se existir
    if (scanSessionId) {
      console.log('Atualizando scan session:', scanSessionId);
      const { error: updateError } = await supabase
        .from('scan_sessions')
        .update({ 
          lead_id: lead.id,
          converted: true,
          converted_at: new Date().toISOString()
        })
        .eq('id', scanSessionId);

      if (updateError) {
        console.error('Erro ao atualizar scan session:', updateError);
      } else {
        console.log('Scan session atualizada com sucesso');
      }
    }

    // ============= ENVIO AUTOMÁTICO DE MENSAGEM =============
    console.log('🔍 INICIANDO verificação de envio automático...');
    
    // 1. Verificar se o envio automático está habilitado
    console.log('📋 Buscando configuração auto_message_enabled...');
    const { data: autoMessageSetting, error: settingError } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'auto_message_enabled')
      .single();

    console.log('📋 Resultado auto_message_enabled:', { 
      data: autoMessageSetting, 
      error: settingError,
      value: autoMessageSetting?.value,
      isEnabled: autoMessageSetting?.value === 'true'
    });

    if (!autoMessageSetting || autoMessageSetting.value !== 'true') {
      console.log('🔕 ENVIO AUTOMÁTICO DESABILITADO - auto_message_enabled não é "true"');
      return new Response(JSON.stringify({ 
        success: true, 
        leadId: lead.id,
        message: 'Lead criado com sucesso! (Envio automático desabilitado)' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Envio automático HABILITADO, buscando template padrão...');
    
    // 2. Buscar template padrão
    const { data: defaultTemplate, error: templateError } = await supabase
      .from('message_templates')
      .select('*')
      .eq('is_default', true)
      .single();

    console.log('📄 Resultado template padrão:', { 
      template: defaultTemplate, 
      error: templateError,
      hasTemplate: !!defaultTemplate,
      templateName: defaultTemplate?.name || 'Nenhum'
    });

    if (!defaultTemplate || templateError) {
      console.log('❌ NENHUM template padrão encontrado - PARANDO envio automático');
      return new Response(JSON.stringify({ 
        success: true, 
        leadId: lead.id,
        message: 'Lead criado com sucesso! (Nenhum template padrão definido)' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Template padrão encontrado, buscando webhook WhatsApp...');
    
    // 3. Buscar URL do webhook WhatsApp
    console.log('🔗 Buscando configuração webhook_urls...');
    const { data: webhookSetting, error: webhookError } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'webhook_urls')
      .single();

    console.log('🔗 Resultado webhook_urls:', { 
      data: webhookSetting, 
      error: webhookError,
      hasValue: !!webhookSetting?.value
    });

    if (!webhookSetting?.value || webhookError) {
      console.log('❌ CONFIGURAÇÃO webhook_urls NÃO ENCONTRADA - PARANDO envio automático');
      return new Response(JSON.stringify({ 
        success: true, 
        leadId: lead.id,
        message: 'Lead criado com sucesso! (Webhook não configurado)' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let webhookUrls;
    let whatsappWebhookUrl;
    
    try {
      webhookUrls = JSON.parse(webhookSetting.value);
      whatsappWebhookUrl = webhookUrls.whatsapp;
      
      console.log('🌐 URLs de webhook parseadas:', {
        whatsapp: whatsappWebhookUrl ? 'CONFIGURADA' : 'NÃO CONFIGURADA',
        email: webhookUrls.email ? 'CONFIGURADA' : 'NÃO CONFIGURADA',
        whatsappUrl: whatsappWebhookUrl
      });
    } catch (parseError) {
      console.error('❌ ERRO ao parsear webhook_urls:', parseError);
      return new Response(JSON.stringify({ 
        success: true, 
        leadId: lead.id,
        message: 'Lead criado com sucesso! (Erro na configuração do webhook)' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (!whatsappWebhookUrl || whatsappWebhookUrl.trim() === '') {
      console.log('❌ URL do webhook WhatsApp VAZIA ou NÃO CONFIGURADA - PARANDO envio automático');
      return new Response(JSON.stringify({ 
        success: true, 
        leadId: lead.id,
        message: 'Lead criado com sucesso! (URL do webhook WhatsApp não configurada)' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🚀 TUDO OK! Iniciando envio de mensagem automática...');
    console.log('📧 Dados do envio:', {
      leadName: lead.name,
      leadWhatsapp: lead.whatsapp,
      templateName: defaultTemplate.name,
      webhookUrl: whatsappWebhookUrl
    });
    
    // Gerar código único de entrega para este envio automático
    const deliveryCode = `AUTO-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    console.log('🆔 Código de entrega gerado:', deliveryCode);
    
    // 4. Criar registro no histórico de mensagens
    const { data: messageHistory, error: historyError } = await supabase
      .from('message_history')
      .insert({
        type: 'whatsapp',
        content: defaultTemplate.content,
        delivery_code: deliveryCode,
        filter_type: 'auto_new_lead',
        filter_value: lead.id,
        recipients_count: 1,
        status: 'sending'
      })
      .select()
      .single();

    if (historyError) {
      console.error('❌ ERRO ao criar histórico:', historyError);
      return new Response(JSON.stringify({ 
        success: true, 
        leadId: lead.id,
        message: 'Lead criado com sucesso! (Erro ao registrar histórico de mensagem)' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('📝 Histórico criado com ID:', messageHistory.id);
    
    // 5. Criar registro de destinatário
    const { error: recipientError } = await supabase
      .from('message_recipients')
      .insert({
        message_history_id: messageHistory.id,
        lead_id: lead.id,
        delivery_status: 'pending'
      });

    if (recipientError) {
      console.error('❌ ERRO ao criar recipient:', recipientError);
    } else {
      console.log('✅ Recipient criado com sucesso');
    }

    // 6. Preparar dados para o webhook
    const webhookData = {
      message_id: messageHistory.id,
      delivery_code: deliveryCode,
      type: 'whatsapp',
      content: defaultTemplate.content,
      filter_type: 'auto_new_lead',
      filter_value: lead.id,
      send_only_to_new: false,
      total_recipients: 1,
      leads: [{
        id: lead.id,
        name: lead.name,
        email: lead.email || null,
        whatsapp: lead.whatsapp || null,
        course: lead.courses?.name || null,
        event: lead.events?.name || null,
        status: lead.lead_statuses?.name || null,
        status_color: lead.lead_statuses?.color || null
      }],
      timestamp: new Date().toISOString(),
      callback_url: `${supabaseUrl}/functions/v1/message-delivery-webhook-endpoint`
    };

    console.log('📤 ENVIANDO para webhook:', {
      url: whatsappWebhookUrl,
      leadId: lead.id,
      leadName: lead.name,
      leadWhatsapp: lead.whatsapp,
      messagePreview: defaultTemplate.content.substring(0, 50) + '...',
      deliveryCode: deliveryCode,
      dataSize: JSON.stringify(webhookData).length
    });

    // 7. Chamar webhook
    try {
      const webhookResponse = await fetch(whatsappWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Supabase-Lead-System/1.0',
          'X-Webhook-Source': 'lead-capture-auto-message'
        },
        body: JSON.stringify(webhookData),
        signal: AbortSignal.timeout(30000) // 30 segundos timeout
      });

      const responseText = await webhookResponse.text();
      console.log('📨 RESPOSTA do webhook:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        ok: webhookResponse.ok,
        headers: Object.fromEntries(webhookResponse.headers.entries()),
        response: responseText.substring(0, 500)
      });

      // 8. Atualizar status baseado na resposta
      const finalStatus = webhookResponse.ok ? 'sent' : 'failed';
      await supabase
        .from('message_history')
        .update({ 
          status: finalStatus,
          webhook_response: `${webhookResponse.status}: ${responseText}` 
        })
        .eq('id', messageHistory.id);

      // Atualizar status do recipient
      if (webhookResponse.ok) {
        await supabase
          .from('message_recipients')
          .update({ 
            delivery_status: 'sent', 
            sent_at: new Date().toISOString() 
          })
          .eq('message_history_id', messageHistory.id);

        console.log('✅ SUCESSO TOTAL! Mensagem automática enviada para o webhook!');
      } else {
        console.error('❌ FALHA no webhook:', webhookResponse.status, responseText);
        
        await supabase
          .from('message_recipients')
          .update({ 
            delivery_status: 'failed',
            error_message: `Webhook error: ${webhookResponse.status} - ${responseText}`
          })
          .eq('message_history_id', messageHistory.id);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        leadId: lead.id,
        message: 'Lead criado e mensagem enviada com sucesso!',
        webhook_status: webhookResponse.ok ? 'sent' : 'failed',
        webhook_response: webhookResponse.status
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (webhookError) {
      console.error('💥 ERRO CRÍTICO ao chamar webhook:', webhookError);
      
      // Atualizar como falha
      await supabase
        .from('message_history')
        .update({ 
          status: 'failed',
          webhook_response: `Error: ${webhookError.message}` 
        })
        .eq('id', messageHistory.id);
        
      await supabase
        .from('message_recipients')
        .update({ 
          delivery_status: 'failed',
          error_message: `Webhook call failed: ${webhookError.message}`
        })
        .eq('message_history_id', messageHistory.id);

      return new Response(JSON.stringify({ 
        success: true, 
        leadId: lead.id,
        message: 'Lead criado com sucesso! (Erro ao enviar mensagem automática)',
        webhook_error: webhookError.message
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('💥 Erro na função lead-capture:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor: ' + (error instanceof Error ? error.message : 'Erro desconhecido'),
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
