
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

    // ============= VERIFICAÇÃO DE ENVIO AUTOMÁTICO =============
    console.log('🤖 === INICIANDO VERIFICAÇÃO DE ENVIO AUTOMÁTICO ===');
    
    try {
      // 1. VERIFICAR SE ENVIO AUTOMÁTICO ESTÁ HABILITADO
      console.log('🔍 PASSO 1: Verificando se envio automático está habilitado...');
      const { data: autoSettings, error: autoError } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'auto_message_enabled')
        .single();

      console.log('📊 AUTO_MESSAGE_ENABLED encontrado:', {
        found: !!autoSettings,
        value: autoSettings?.value,
        error: autoError?.message
      });

      if (!autoSettings || autoSettings.value !== 'true') {
        console.log('🔕 ENVIO AUTOMÁTICO DESABILITADO');
        return new Response(JSON.stringify({ 
          success: true, 
          leadId: lead.id,
          message: 'Lead criado! (Envio automático desabilitado)',
          auto_send_status: 'disabled'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ ENVIO AUTOMÁTICO HABILITADO!');

      // 2. BUSCAR TEMPLATE PADRÃO
      console.log('🔍 PASSO 2: Buscando template padrão...');
      const { data: templates, error: templateError } = await supabase
        .from('message_templates')
        .select('*')
        .eq('is_default', true)
        .single();

      console.log('📄 TEMPLATE PADRÃO:', {
        found: !!templates,
        template: templates ? {
          id: templates.id,
          name: templates.name,
          content_preview: templates.content?.substring(0, 100) + '...'
        } : null,
        error: templateError?.message
      });

      if (!templates) {
        console.log('❌ NENHUM TEMPLATE PADRÃO ENCONTRADO');
        return new Response(JSON.stringify({ 
          success: true, 
          leadId: lead.id,
          message: 'Lead criado! (Nenhum template padrão definido)',
          auto_send_status: 'no_template'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 3. BUSCAR WEBHOOK WHATSAPP
      console.log('🔍 PASSO 3: Buscando configurações de webhook...');
      const { data: webhookSettings, error: webhookError } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'webhook_urls')
        .single();

      console.log('🌐 WEBHOOK_URLS RAW:', {
        found: !!webhookSettings,
        raw_value: webhookSettings?.value,
        type: typeof webhookSettings?.value,
        error: webhookError?.message
      });

      if (!webhookSettings?.value) {
        console.log('❌ CONFIGURAÇÃO WEBHOOK NÃO ENCONTRADA');
        return new Response(JSON.stringify({ 
          success: true, 
          leadId: lead.id,
          message: 'Lead criado! (Webhook não configurado)',
          auto_send_status: 'no_webhook'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      let webhookUrls;
      let whatsappWebhookUrl;
      
      try {
        // Parse do JSON das URLs
        if (typeof webhookSettings.value === 'string') {
          webhookUrls = JSON.parse(webhookSettings.value);
        } else {
          webhookUrls = webhookSettings.value;
        }
        
        whatsappWebhookUrl = webhookUrls?.whatsapp;
        
        console.log('🔗 WEBHOOK URLS PARSEADAS:', {
          all_urls: webhookUrls,
          whatsapp_url: whatsappWebhookUrl,
          has_whatsapp: !!whatsappWebhookUrl
        });
        
      } catch (parseError) {
        console.error('❌ ERRO ao parsear webhook_urls:', parseError);
        return new Response(JSON.stringify({ 
          success: true, 
          leadId: lead.id,
          message: 'Lead criado! (Erro na configuração do webhook)',
          auto_send_status: 'webhook_parse_error',
          debug_info: {
            raw_value: webhookSettings.value,
            parse_error: parseError.message
          }
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      if (!whatsappWebhookUrl || whatsappWebhookUrl.trim() === '') {
        console.log('❌ URL WEBHOOK WHATSAPP VAZIA OU INVÁLIDA');
        return new Response(JSON.stringify({ 
          success: true, 
          leadId: lead.id,
          message: 'Lead criado! (URL do webhook WhatsApp não configurada)',
          auto_send_status: 'empty_webhook_url',
          debug_info: {
            webhook_urls: webhookUrls,
            whatsapp_url: whatsappWebhookUrl
          }
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ WEBHOOK WHATSAPP ENCONTRADO:', whatsappWebhookUrl);

      // 4. PREPARAR ENVIO
      const deliveryCode = `AUTO-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      console.log('🆔 Código de entrega gerado:', deliveryCode);
      
      // 5. CRIAR HISTÓRICO
      console.log('📝 PASSO 5: Criando histórico da mensagem...');
      const { data: messageHistory, error: historyError } = await supabase
        .from('message_history')
        .insert({
          type: 'whatsapp',
          content: templates.content,
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
          message: 'Lead criado! (Erro ao registrar histórico)',
          auto_send_status: 'history_error'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ HISTÓRICO CRIADO - ID:', messageHistory.id);
      
      // 6. CRIAR RECIPIENT
      console.log('👥 PASSO 6: Criando recipient...');
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
        console.log('✅ RECIPIENT CRIADO');
      }

      // 7. PREPARAR PAYLOAD PARA WEBHOOK
      console.log('📦 PASSO 7: Preparando payload para webhook...');
      const webhookPayload = {
        phone: lead.whatsapp,
        message: templates.content,
        lead_id: lead.id,
        lead_name: lead.name,
        delivery_code: deliveryCode,
        template_name: templates.name,
        timestamp: new Date().toISOString()
      };

      console.log('📤 PAYLOAD PREPARADO:', {
        phone: webhookPayload.phone,
        message_length: webhookPayload.message?.length,
        lead_id: webhookPayload.lead_id,
        delivery_code: webhookPayload.delivery_code
      });

      // 8. ENVIAR WEBHOOK
      console.log('🌐 PASSO 8: ENVIANDO WEBHOOK PARA:', whatsappWebhookUrl);
      
      const webhookResponse = await fetch(whatsappWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Supabase-Auto-Message/1.0'
        },
        body: JSON.stringify(webhookPayload)
      });

      const responseText = await webhookResponse.text();
      
      console.log('📨 RESPOSTA DO WEBHOOK:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        ok: webhookResponse.ok,
        response: responseText
      });

      // 9. ATUALIZAR STATUS
      const finalStatus = webhookResponse.ok ? 'sent' : 'failed';
      
      await supabase
        .from('message_history')
        .update({ 
          status: finalStatus,
          webhook_response: `${webhookResponse.status}: ${responseText}` 
        })
        .eq('id', messageHistory.id);

      // Atualizar recipient
      const recipientStatus = webhookResponse.ok ? 'sent' : 'failed';
      await supabase
        .from('message_recipients')
        .update({ 
          delivery_status: recipientStatus,
          sent_at: webhookResponse.ok ? new Date().toISOString() : null,
          error_message: webhookResponse.ok ? null : `${webhookResponse.status}: ${responseText}`
        })
        .eq('message_history_id', messageHistory.id)
        .eq('lead_id', lead.id);

      if (webhookResponse.ok) {
        console.log('🎉 WEBHOOK ENVIADO COM SUCESSO!');
        return new Response(JSON.stringify({ 
          success: true, 
          leadId: lead.id,
          message: 'Lead criado e mensagem automática enviada com sucesso!',
          auto_send_status: 'sent',
          delivery_code: deliveryCode,
          webhook_url: whatsappWebhookUrl,
          webhook_status: webhookResponse.status
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        console.log('❌ FALHA NO WEBHOOK:', webhookResponse.status);
        return new Response(JSON.stringify({ 
          success: true, 
          leadId: lead.id,
          message: 'Lead criado, mas houve erro no envio da mensagem',
          auto_send_status: 'failed',
          delivery_code: deliveryCode,
          webhook_url: whatsappWebhookUrl,
          webhook_status: webhookResponse.status,
          webhook_error: responseText
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

    } catch (webhookError) {
      console.error('💥 ERRO NO PROCESSAMENTO DE WEBHOOK:', webhookError);
      
      return new Response(JSON.stringify({ 
        success: true, 
        leadId: lead.id,
        message: 'Lead criado! (Erro no processamento do webhook automático)',
        auto_send_status: 'processing_error',
        error: webhookError.message
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
