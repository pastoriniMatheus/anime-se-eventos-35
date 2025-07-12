
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
        event_id,
        status_id,
        courses(name),
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

    // ============= DIAGNÓSTICO DETALHADO DO WEBHOOK =============
    console.log('🔍 === INICIANDO DIAGNÓSTICO COMPLETO DO WEBHOOK ===');
    
    try {
      // 1. VERIFICAR TODAS AS SYSTEM_SETTINGS
      console.log('📊 PASSO 1: Listando TODAS as system_settings...');
      const { data: allSettings, error: allSettingsError } = await supabase
        .from('system_settings')
        .select('*');

      console.log('📋 TODAS AS CONFIGURAÇÕES:', {
        total: allSettings?.length || 0,
        settings: allSettings?.map(s => ({ key: s.key, value: s.value })) || [],
        error: allSettingsError?.message
      });

      // 2. VERIFICAR AUTO_MESSAGE_ENABLED ESPECIFICAMENTE
      const autoMessageSetting = allSettings?.find(s => s.key === 'auto_message_enabled');
      console.log('🤖 AUTO MESSAGE ENABLED:', {
        found: !!autoMessageSetting,
        value: autoMessageSetting?.value,
        type: typeof autoMessageSetting?.value,
        is_true_string: autoMessageSetting?.value === 'true',
        full_setting: autoMessageSetting
      });

      if (!autoMessageSetting || autoMessageSetting.value !== 'true') {
        console.log('🚫 ENVIO AUTOMÁTICO DESABILITADO - Retornando sem enviar webhook');
        return new Response(JSON.stringify({ 
          success: true, 
          leadId: lead.id,
          message: 'Lead criado com sucesso!',
          auto_send_status: 'disabled',
          debug_info: {
            auto_message_enabled: autoMessageSetting?.value || 'não encontrado'
          }
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ ENVIO AUTOMÁTICO HABILITADO - Prosseguindo...');

      // 3. VERIFICAR WEBHOOK_URLS ESPECIFICAMENTE
      const webhookSetting = allSettings?.find(s => s.key === 'webhook_urls');
      console.log('🌐 WEBHOOK URLS SETTING:', {
        found: !!webhookSetting,
        raw_value: webhookSetting?.value,
        type: typeof webhookSetting?.value,
        full_setting: webhookSetting
      });

      if (!webhookSetting?.value) {
        console.log('❌ WEBHOOK_URLS NÃO ENCONTRADO');
        return new Response(JSON.stringify({ 
          success: true, 
          leadId: lead.id,
          message: 'Lead criado! (Webhook URLs não configurado)',
          auto_send_status: 'no_webhook_config',
          debug_info: {
            webhook_setting_found: !!webhookSetting,
            webhook_value: webhookSetting?.value || 'null'
          }
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 4. FAZER PARSE DAS WEBHOOK URLS
      let webhookUrls;
      let whatsappWebhookUrl;
      
      try {
        if (typeof webhookSetting.value === 'string') {
          webhookUrls = JSON.parse(webhookSetting.value);
        } else {
          webhookUrls = webhookSetting.value;
        }
        
        whatsappWebhookUrl = webhookUrls?.whatsapp;
        
        console.log('🔗 WEBHOOK URLS PARSEADAS:', {
          parse_successful: true,
          all_urls: webhookUrls,
          whatsapp_url: whatsappWebhookUrl,
          whatsapp_url_length: whatsappWebhookUrl?.length || 0,
          has_whatsapp: !!whatsappWebhookUrl && whatsappWebhookUrl.trim() !== ''
        });
        
      } catch (parseError) {
        console.error('❌ ERRO AO PARSEAR WEBHOOK_URLS:', parseError);
        return new Response(JSON.stringify({ 
          success: true, 
          leadId: lead.id,
          message: 'Lead criado! (Erro no formato das URLs do webhook)',
          auto_send_status: 'webhook_parse_error',
          debug_info: {
            raw_value: webhookSetting.value,
            parse_error: parseError.message
          }
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
          auto_send_status: 'empty_whatsapp_url',
          debug_info: {
            webhook_urls: webhookUrls,
            whatsapp_url: whatsappWebhookUrl || 'vazio'
          }
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 5. VERIFICAR TEMPLATES
      console.log('📄 PASSO 5: Verificando templates...');
      const { data: templates, error: templateError } = await supabase
        .from('message_templates')
        .select('*');

      console.log('📋 TEMPLATES ENCONTRADOS:', {
        total: templates?.length || 0,
        templates: templates?.map(t => ({ 
          id: t.id, 
          name: t.name, 
          is_default: t.is_default,
          content_length: t.content?.length || 0
        })) || [],
        error: templateError?.message
      });

      const defaultTemplate = templates?.find(t => t.is_default);
      console.log('⭐ TEMPLATE PADRÃO:', {
        found: !!defaultTemplate,
        template: defaultTemplate ? {
          id: defaultTemplate.id,
          name: defaultTemplate.name,
          content_preview: defaultTemplate.content?.substring(0, 100) + '...'
        } : null
      });

      if (!defaultTemplate) {
        console.log('❌ NENHUM TEMPLATE PADRÃO ENCONTRADO');
        return new Response(JSON.stringify({ 
          success: true, 
          leadId: lead.id,
          message: 'Lead criado! (Nenhum template padrão definido)',
          auto_send_status: 'no_default_template',
          debug_info: {
            total_templates: templates?.length || 0,
            templates_with_default: templates?.filter(t => t.is_default).length || 0
          }
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 6. TUDO OK - PREPARAR ENVIO
      console.log('🎯 TUDO VERIFICADO - PREPARANDO ENVIO DO WEBHOOK');
      console.log('📤 URL DE DESTINO:', whatsappWebhookUrl);
      
      const deliveryCode = `AUTO-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      
      // 7. CRIAR HISTÓRICO
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
      
      // 8. CRIAR RECIPIENT
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

      // 9. PREPARAR PAYLOAD
      const webhookPayload = {
        phone: lead.whatsapp,
        message: defaultTemplate.content,
        lead_id: lead.id,
        lead_name: lead.name,
        delivery_code: deliveryCode,
        template_name: defaultTemplate.name,
        timestamp: new Date().toISOString()
      };

      console.log('📦 PAYLOAD FINAL:', {
        phone: webhookPayload.phone,
        message_length: webhookPayload.message?.length,
        lead_id: webhookPayload.lead_id,
        delivery_code: webhookPayload.delivery_code,
        full_payload: webhookPayload
      });

      // 10. ENVIAR WEBHOOK
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
      
      console.log('📨 RESPOSTA COMPLETA DO WEBHOOK:', {
        url: whatsappWebhookUrl,
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        ok: webhookResponse.ok,
        headers: Object.fromEntries(webhookResponse.headers.entries()),
        response_body: responseText,
        response_length: responseText?.length || 0
      });

      // 11. ATUALIZAR STATUS
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
            response: responseText
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
          message: webhookError.message,
          stack: webhookError.stack
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
