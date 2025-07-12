
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
    console.log('🚀 Lead capture request received');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables');
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

    console.log('📋 Form data received:', { 
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
      console.log('🔍 Buscando evento:', eventName);
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id')
        .eq('name', eventName)
        .single();

      if (eventError) {
        console.error('⚠️ Erro ao buscar evento:', eventError);
      } else if (event) {
        eventId = event.id;
        console.log('✅ Evento encontrado:', eventId);
      }
    }

    // Buscar status "Pendente" para definir como padrão
    const { data: pendingStatus } = await supabase
      .from('lead_statuses')
      .select('id')
      .ilike('name', 'pendente')
      .single();

    // Preparar dados do lead
    const leadData = {
      name: name.trim(),
      whatsapp: whatsapp.trim(),
      email: email && email.trim() !== '' ? email.trim() : null,
      event_id: eventId,
      scan_session_id: scanSessionId,
      status_id: pendingStatus?.id || null,
      course_id: courseType === 'course' && courseId ? courseId : null,
      postgraduate_course_id: courseType === 'postgraduate' && postgraduateCourseId ? postgraduateCourseId : null,
      course_type: courseType || null,
      receipt_url: receiptUrl && receiptUrl.trim() !== '' ? receiptUrl.trim() : null
    };

    console.log('💾 Criando lead com dados:', leadData);

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert([leadData])
      .select(`
        id,
        name,
        email,
        whatsapp,
        course_id,
        postgraduate_course_id,
        event_id,
        status_id,
        courses(name),
        postgraduate_courses(name),
        events(name),
        lead_statuses(name, color)
      `)
      .single();

    if (leadError) {
      console.error('❌ Erro ao criar lead:', leadError);
      return new Response(JSON.stringify({ 
        error: 'Erro ao salvar lead: ' + leadError.message,
        success: false
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ LEAD CRIADO COM SUCESSO - ID:', lead.id);

    // Atualizar scan session se existir
    if (scanSessionId) {
      console.log('🔄 Atualizando scan session:', scanSessionId);
      const { error: updateError } = await supabase
        .from('scan_sessions')
        .update({ 
          lead_id: lead.id,
          converted: true,
          converted_at: new Date().toISOString()
        })
        .eq('id', scanSessionId);

      if (updateError) {
        console.error('⚠️ Erro ao atualizar scan session:', updateError);
      } else {
        console.log('✅ Scan session atualizada');
      }
    }

    // ============= VERIFICAÇÃO DE ENVIO AUTOMÁTICO =============
    console.log('🔍 === VERIFICANDO ENVIO AUTOMÁTICO ===');
    
    try {
      // 1. VERIFICAR SE ENVIO AUTOMÁTICO ESTÁ HABILITADO
      const { data: autoMessageSetting, error: autoSettingError } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'auto_message_enabled')
        .single();

      console.log('🤖 CONFIGURAÇÃO AUTO MESSAGE:', {
        found: !!autoMessageSetting,
        raw_value: autoMessageSetting?.value,
        error: autoSettingError?.message
      });

      // VERIFICAÇÃO RIGOROSA: deve ser exatamente 'true' como string
      const isAutoSendEnabled = autoMessageSetting?.value === 'true';
      
      console.log('✅ VERIFICAÇÃO FINAL AUTO SEND:', {
        setting_value: autoMessageSetting?.value,
        is_enabled: isAutoSendEnabled,
        comparison: `"${autoMessageSetting?.value}" === "true" = ${isAutoSendEnabled}`
      });

      if (!isAutoSendEnabled) {
        console.log('🚫 ENVIO AUTOMÁTICO DESABILITADO - Parando execução');
        return new Response(JSON.stringify({ 
          success: true, 
          leadId: lead.id,
          message: 'Lead criado com sucesso!',
          auto_send_status: 'disabled'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ ENVIO AUTOMÁTICO HABILITADO - Continuando...');

      // 2. BUSCAR WEBHOOK URL
      const { data: webhookSetting, error: webhookError } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'webhook_urls')
        .single();

      console.log('🌐 WEBHOOK URLS SETTING:', {
        found: !!webhookSetting,
        raw_value: webhookSetting?.value,
        error: webhookError?.message
      });

      if (!webhookSetting?.value) {
        console.log('❌ WEBHOOK_URLS NÃO CONFIGURADO');
        return new Response(JSON.stringify({ 
          success: true, 
          leadId: lead.id,
          message: 'Lead criado! (Webhook não configurado)',
          auto_send_status: 'no_webhook_config'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      let webhookUrls;
      let whatsappWebhookUrl;
      
      try {
        webhookUrls = typeof webhookSetting.value === 'string' 
          ? JSON.parse(webhookSetting.value) 
          : webhookSetting.value;
        whatsappWebhookUrl = webhookUrls?.whatsapp;
        
        console.log('🔗 WEBHOOK URLS PARSEADAS:', {
          all_urls: webhookUrls,
          whatsapp_url: whatsappWebhookUrl
        });
        
      } catch (parseError) {
        console.error('❌ ERRO AO PARSEAR WEBHOOK_URLS:', parseError);
        return new Response(JSON.stringify({ 
          success: true, 
          leadId: lead.id,
          message: 'Lead criado! (Erro no formato das URLs do webhook)',
          auto_send_status: 'webhook_parse_error'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      if (!whatsappWebhookUrl || whatsappWebhookUrl.trim() === '') {
        console.log('❌ URL WEBHOOK WHATSAPP VAZIA');
        return new Response(JSON.stringify({ 
          success: true, 
          leadId: lead.id,
          message: 'Lead criado! (URL do webhook WhatsApp não configurada)',
          auto_send_status: 'empty_whatsapp_url'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 3. BUSCAR TEMPLATE PADRÃO
      console.log('📄 BUSCANDO TEMPLATE PADRÃO...');
      const { data: defaultTemplate, error: templateError } = await supabase
        .from('message_templates')
        .select('*')
        .eq('is_default', true)
        .single();

      console.log('📋 TEMPLATE PADRÃO:', {
        found: !!defaultTemplate,
        template: defaultTemplate ? {
          id: defaultTemplate.id,
          name: defaultTemplate.name,
          is_default: defaultTemplate.is_default
        } : null,
        error: templateError?.message
      });
      
      if (!defaultTemplate) {
        console.log('❌ NENHUM TEMPLATE PADRÃO ENCONTRADO');
        return new Response(JSON.stringify({ 
          success: true, 
          leadId: lead.id,
          message: 'Lead criado! (Nenhum template padrão definido)',
          auto_send_status: 'no_default_template'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('⭐ TEMPLATE PADRÃO ENCONTRADO:', {
        id: defaultTemplate.id,
        name: defaultTemplate.name
      });

      // 4. GERAR CÓDIGO DE ENTREGA
      const deliveryCode = `AUTO-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      
      // 5. CRIAR HISTÓRICO DE MENSAGEM
      console.log('📝 CRIANDO HISTÓRICO DE MENSAGEM...');
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
        console.error('❌ ERRO AO CRIAR HISTÓRICO:', historyError);
      } else {
        console.log('✅ HISTÓRICO CRIADO - ID:', messageHistory.id);
      }
      
      // 6. CRIAR RECIPIENT
      if (messageHistory) {
        const { error: recipientError } = await supabase
          .from('message_recipients')
          .insert({
            message_history_id: messageHistory.id,
            lead_id: lead.id,
            delivery_status: 'pending'
          });

        if (recipientError) {
          console.error('❌ ERRO AO CRIAR RECIPIENT:', recipientError);
        } else {
          console.log('✅ RECIPIENT CRIADO');
        }
      }

      // 7. PREPARAR PAYLOAD NO FORMATO PADRONIZADO
      const webhookPayload = {
        type: "whatsapp",
        content: defaultTemplate.content,
        filter_type: "auto_new_lead",
        filter_value: lead.id,
        send_only_to_new: false,
        total_recipients: 1,
        leads: [{
          id: lead.id,
          name: lead.name,
          email: lead.email,
          whatsapp: lead.whatsapp,
          course: lead.courses?.name || lead.postgraduate_courses?.name || null,
          event: lead.events?.name || null,
          status: lead.lead_statuses?.name || null,
          status_color: lead.lead_statuses?.color || null
        }],
        timestamp: new Date().toISOString(),
        callback_url: `${supabaseUrl}/functions/v1/message-delivery-webhook-endpoint`,
        message_id: messageHistory?.id || null,
        delivery_code: deliveryCode
      };

      console.log('📦 PAYLOAD PADRONIZADO CRIADO:', {
        type: webhookPayload.type,
        total_recipients: webhookPayload.total_recipients,
        lead_name: webhookPayload.leads[0].name,
        delivery_code: webhookPayload.delivery_code,
        webhook_url: whatsappWebhookUrl
      });

      // 8. ENVIAR WEBHOOK
      console.log('🚀 ENVIANDO WEBHOOK PARA:', whatsappWebhookUrl);
      
      const webhookResponse = await fetch(whatsappWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Supabase-Auto-Message/1.0',
          'X-Lead-ID': lead.id,
          'X-Delivery-Code': deliveryCode
        },
        body: JSON.stringify(webhookPayload)
      });

      const responseText = await webhookResponse.text();
      
      console.log('📨 RESPOSTA DO WEBHOOK:', {
        url: whatsappWebhookUrl,
        status: webhookResponse.status,
        ok: webhookResponse.ok,
        response_body: responseText
      });

      // 9. ATUALIZAR STATUS
      if (messageHistory) {
        const finalStatus = webhookResponse.ok ? 'sent' : 'failed';
        
        await supabase
          .from('message_history')
          .update({ 
            status: finalStatus,
            webhook_response: `${webhookResponse.status}: ${responseText}` 
          })
          .eq('id', messageHistory.id);

        await supabase
          .from('message_recipients')
          .update({ 
            delivery_status: webhookResponse.ok ? 'sent' : 'failed',
            sent_at: webhookResponse.ok ? new Date().toISOString() : null,
            error_message: webhookResponse.ok ? null : `${webhookResponse.status}: ${responseText}`
          })
          .eq('message_history_id', messageHistory.id)
          .eq('lead_id', lead.id);
      }

      if (webhookResponse.ok) {
        console.log('🎉 WEBHOOK ENVIADO COM SUCESSO!');
        return new Response(JSON.stringify({ 
          success: true, 
          leadId: lead.id,
          message: 'Lead criado e mensagem automática enviada com sucesso!',
          auto_send_status: 'sent',
          webhook_details: {
            url: whatsappWebhookUrl,
            status: webhookResponse.status,
            delivery_code: deliveryCode,
            message_id: messageHistory?.id
          }
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        console.log('❌ FALHA NO WEBHOOK:', webhookResponse.status, responseText);
        return new Response(JSON.stringify({ 
          success: true, 
          leadId: lead.id,
          message: 'Lead criado, mas houve erro no envio da mensagem',
          auto_send_status: 'webhook_failed',
          webhook_details: {
            url: whatsappWebhookUrl,
            status: webhookResponse.status,
            delivery_code: deliveryCode,
            error: responseText
          }
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

    } catch (webhookError) {
      console.error('💥 ERRO GERAL NO PROCESSAMENTO DE WEBHOOK:', webhookError);
      
      return new Response(JSON.stringify({ 
        success: true, 
        leadId: lead.id,
        message: 'Lead criado! (Erro no processamento do webhook automático)',
        auto_send_status: 'processing_error',
        error_details: {
          message: webhookError.message
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('💥 Erro geral na função lead-capture:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno: ' + (error instanceof Error ? error.message : 'Erro desconhecido'),
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
