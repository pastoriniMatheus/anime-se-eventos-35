
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: corsHeaders 
      });
    }

    const { lead_id, status_name, notes } = await req.json();

    console.log('🔄 === CALLBACK DE STATUS RECEBIDO ===');
    console.log('📋 Dados recebidos:', { lead_id, status_name, notes });

    if (!lead_id || !status_name) {
      return new Response('Missing required fields: lead_id and status_name', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Buscar o status pelo nome (case insensitive)
    const { data: status, error: statusError } = await supabase
      .from('lead_statuses')
      .select('id, name')
      .ilike('name', status_name)
      .single();

    if (statusError) {
      console.log('❌ Erro ao buscar status:', statusError);
      return new Response(`Status not found: ${status_name}`, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    console.log('📊 Status encontrado:', { status_id: status.id, status_name: status.name });

    // Verificar se o lead existe e buscar status anterior
    const { data: existingLead, error: leadError } = await supabase
      .from('leads')
      .select(`
        *,
        course:courses(name),
        postgraduate_course:postgraduate_courses(name),
        event:events(name),
        status:lead_statuses(name, color)
      `)
      .eq('id', lead_id)
      .single();

    if (leadError) {
      console.log('❌ Erro ao buscar lead:', leadError);
      return new Response(`Lead not found: ${lead_id}`, { 
        status: 404,
        headers: corsHeaders 
      });
    }

    const previousStatusId = existingLead.status_id;
    console.log('🔍 Status anterior:', previousStatusId, 'Status novo:', status.id);

    // Só processa se o status realmente mudou
    if (previousStatusId === status.id) {
      console.log('ℹ️ Status não mudou, pulando processamento');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Status não alterado'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Atualizar o status do lead
    const updateData: any = {
      status_id: status.id,
      updated_at: new Date().toISOString()
    };

    if (notes) {
      console.log('📝 Notas recebidas:', notes);
    }

    const { data: updatedLead, error: updateError } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', lead_id)
      .select(`
        *,
        course:courses(name),
        postgraduate_course:postgraduate_courses(name),
        event:events(name),
        status:lead_statuses(name, color)
      `)
      .single();

    if (updateError) {
      console.error('❌ Erro ao atualizar lead:', updateError);
      return new Response('Error updating lead status', { 
        status: 500,
        headers: corsHeaders 
      });
    }

    console.log('✅ Lead atualizado com sucesso:', updatedLead);

    // === VERIFICAÇÃO DE CONVERSÃO AUTOMÁTICA ===
    console.log('🔍 === INICIANDO VERIFICAÇÃO DE CONVERSÃO AUTOMÁTICA ===');
    
    try {
      // 1. VERIFICAR SE ENVIO AUTOMÁTICO DE CONVERSÃO ESTÁ HABILITADO
      const { data: conversionMessageSetting, error: conversionSettingError } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'conversion_message_enabled')
        .single();

      console.log('🤖 CONFIGURAÇÃO CONVERSÃO MESSAGE:', {
        found: !!conversionMessageSetting,
        raw_value: conversionMessageSetting?.value,
        enabled: conversionMessageSetting?.value === 'true',
        error: conversionSettingError?.message
      });

      if (conversionMessageSetting?.value !== 'true') {
        console.log('🚫 ENVIO AUTOMÁTICO DE CONVERSÃO DESABILITADO - finalizando callback');
      } else {
        console.log('✅ ENVIO AUTOMÁTICO DE CONVERSÃO HABILITADO - continuando verificação');
        
        // 2. VERIFICAR SE O NOVO STATUS É O STATUS DE CONVERSÃO
        const { data: conversionStatusSetting, error: conversionStatusError } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'conversion_status_id')
          .single();

        console.log('🎯 VERIFICAÇÃO DE STATUS DE CONVERSÃO:', {
          found: !!conversionStatusSetting,
          conversion_status_id: conversionStatusSetting?.value,
          new_status_id: status.id,
          is_conversion: conversionStatusSetting?.value === status.id.toString(),
          error: conversionStatusError?.message
        });

        if (conversionStatusSetting?.value === status.id.toString()) {
          console.log('🎉 === LEAD CONVERTIDO - INICIANDO ENVIO AUTOMÁTICO ===');

          // 3. BUSCAR TEMPLATE DE CONVERSÃO
          const { data: conversionTemplate, error: templateError } = await supabase
            .from('message_templates')
            .select('*')
            .eq('is_conversion_default', true)
            .single();

          console.log('📝 TEMPLATE DE CONVERSÃO:', {
            found: !!conversionTemplate,
            template_name: conversionTemplate?.name,
            template_id: conversionTemplate?.id,
            error: templateError?.message
          });

          if (!conversionTemplate) {
            console.log('❌ NENHUM TEMPLATE DE CONVERSÃO ENCONTRADO - abortando envio');
          } else {
            console.log('⭐ TEMPLATE DE CONVERSÃO ENCONTRADO:', conversionTemplate.name);

            // 4. VERIFICAR SE LEAD TEM WHATSAPP
            if (!updatedLead.whatsapp) {
              console.log('❌ LEAD NÃO TEM WHATSAPP - abortando envio');
            } else {
              console.log('📱 LEAD TEM WHATSAPP:', updatedLead.whatsapp);
              
              // 5. BUSCAR WEBHOOK URL
              const { data: webhookSetting, error: webhookError } = await supabase
                .from('system_settings')
                .select('value')
                .eq('key', 'webhook_urls')
                .single();

              console.log('🌐 WEBHOOK SETTINGS:', {
                found: !!webhookSetting,
                has_value: !!webhookSetting?.value,
                error: webhookError?.message
              });

              if (!webhookSetting?.value) {
                console.log('❌ WEBHOOK_URLS NÃO CONFIGURADO - abortando envio');
              } else {
                let whatsappWebhookUrl;
                try {
                  const webhookUrls = typeof webhookSetting.value === 'string' 
                    ? JSON.parse(webhookSetting.value) 
                    : webhookSetting.value;
                  whatsappWebhookUrl = webhookUrls?.whatsapp;
                  console.log('🔗 WEBHOOK URL EXTRAÍDA:', whatsappWebhookUrl);
                } catch (parseError) {
                  console.error('❌ ERRO AO PARSEAR WEBHOOK_URLS:', parseError);
                  whatsappWebhookUrl = null;
                }

                if (whatsappWebhookUrl) {
                  // 6. GERAR CÓDIGO DE ENTREGA ÚNICO
                  const deliveryCode = `CONV-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
                  console.log('🏷️ CÓDIGO DE ENTREGA GERADO:', deliveryCode);

                  // 7. CRIAR HISTÓRICO DE MENSAGEM
                  const { data: messageHistory, error: historyError } = await supabase
                    .from('message_history')
                    .insert({
                      type: 'whatsapp',
                      content: conversionTemplate.content,
                      delivery_code: deliveryCode,
                      filter_type: 'automatic_conversion',
                      filter_value: lead_id.toString(),
                      recipients_count: 1,
                      status: 'sending'
                    })
                    .select()
                    .single();

                  console.log('📋 HISTÓRICO DE MENSAGEM CRIADO:', {
                    created: !!messageHistory,
                    message_id: messageHistory?.id,
                    delivery_code: deliveryCode,
                    error: historyError?.message
                  });

                  if (messageHistory) {
                    // 8. CRIAR RECIPIENT
                    const { data: recipient, error: recipientError } = await supabase
                      .from('message_recipients')
                      .insert({
                        message_history_id: messageHistory.id,
                        lead_id: lead_id,
                        delivery_status: 'pending'
                      })
                      .select()
                      .single();

                    console.log('👤 RECIPIENT CRIADO:', {
                      created: !!recipient,
                      recipient_id: recipient?.id,
                      error: recipientError?.message
                    });

                    // 9. PREPARAR PAYLOAD DE CONVERSÃO
                    const conversionPayload = {
                      type: "whatsapp",
                      content: conversionTemplate.content,
                      filter_type: "automatic_conversion",
                      filter_value: lead_id.toString(),
                      send_only_to_new: false,
                      total_recipients: 1,
                      leads: [{
                        id: updatedLead.id,
                        name: updatedLead.name,
                        email: updatedLead.email,
                        whatsapp: updatedLead.whatsapp,
                        course: updatedLead.course?.name || updatedLead.postgraduate_course?.name || null,
                        event: updatedLead.event?.name || null,
                        status: updatedLead.status?.name || null,
                        status_color: updatedLead.status?.color || null
                      }],
                      timestamp: new Date().toISOString(),
                      callback_url: `https://iznfrkdsmbtynmifqcdd.supabase.co/functions/v1/message-delivery-webhook-endpoint`,
                      message_id: messageHistory.id,
                      delivery_code: deliveryCode
                    };

                    console.log('📦 PAYLOAD DE CONVERSÃO PREPARADO:', {
                      lead_name: conversionPayload.leads[0].name,
                      delivery_code: deliveryCode,
                      webhook_url: whatsappWebhookUrl,
                      payload_size: JSON.stringify(conversionPayload).length
                    });

                    // 10. ENVIAR WEBHOOK DE CONVERSÃO
                    try {
                      console.log('🚀 === ENVIANDO WEBHOOK DE CONVERSÃO ===');
                      console.log('🔗 URL:', whatsappWebhookUrl);
                      console.log('📋 Payload completo:', JSON.stringify(conversionPayload, null, 2));
                      
                      const webhookResponse = await fetch(whatsappWebhookUrl, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Accept': 'application/json',
                          'User-Agent': 'Supabase-Conversion-Message/1.0',
                          'X-Lead-ID': lead_id.toString(),
                          'X-Delivery-Code': deliveryCode
                        },
                        body: JSON.stringify(conversionPayload)
                      });

                      const responseText = await webhookResponse.text();
                      console.log('📨 RESPOSTA DO WEBHOOK DE CONVERSÃO:', {
                        status: webhookResponse.status,
                        ok: webhookResponse.ok,
                        response_body: responseText.substring(0, 500),
                        url: whatsappWebhookUrl,
                        headers: Object.fromEntries(webhookResponse.headers.entries())
                      });

                      // 11. ATUALIZAR STATUS NO BANCO
                      const finalStatus = webhookResponse.ok ? 'sent' : 'failed';
                      
                      const { error: updateHistoryError } = await supabase
                        .from('message_history')
                        .update({ 
                          status: finalStatus,
                          webhook_response: `${webhookResponse.status}: ${responseText}`.substring(0, 1000)
                        })
                        .eq('id', messageHistory.id);

                      console.log('📝 HISTÓRICO ATUALIZADO:', {
                        status: finalStatus,
                        message_id: messageHistory.id,
                        error: updateHistoryError?.message
                      });

                      const { error: updateRecipientError } = await supabase
                        .from('message_recipients')
                        .update({ 
                          delivery_status: webhookResponse.ok ? 'sent' : 'failed',
                          sent_at: webhookResponse.ok ? new Date().toISOString() : null,
                          error_message: webhookResponse.ok ? null : `${webhookResponse.status}: ${responseText}`.substring(0, 500)
                        })
                        .eq('message_history_id', messageHistory.id)
                        .eq('lead_id', lead_id);

                      console.log('👤 RECIPIENT ATUALIZADO:', {
                        status: webhookResponse.ok ? 'sent' : 'failed',
                        recipient_id: recipient?.id,
                        error: updateRecipientError?.message
                      });

                      if (webhookResponse.ok) {
                        console.log('🎉 === WEBHOOK DE CONVERSÃO ENVIADO COM SUCESSO ===');
                      } else {
                        console.log('❌ === FALHA NO WEBHOOK DE CONVERSÃO ===', webhookResponse.status);
                      }
                    } catch (fetchError) {
                      console.error('💥 ERRO AO FAZER FETCH DO WEBHOOK:', fetchError);
                      
                      // Atualizar status como failed
                      await supabase
                        .from('message_history')
                        .update({ 
                          status: 'failed',
                          webhook_response: `Fetch error: ${fetchError.message}` 
                        })
                        .eq('id', messageHistory.id);

                      await supabase
                        .from('message_recipients')
                        .update({ 
                          delivery_status: 'failed',
                          error_message: `Fetch error: ${fetchError.message}`
                        })
                        .eq('message_history_id', messageHistory.id)
                        .eq('lead_id', lead_id);
                    }
                  } else {
                    console.log('❌ FALHA AO CRIAR HISTÓRICO DE MENSAGEM:', historyError);
                  }
                } else {
                  console.log('❌ URL DO WEBHOOK WHATSAPP NÃO ENCONTRADA NAS CONFIGURAÇÕES');
                }
              }
            }
          }
        } else {
          console.log('ℹ️ Status alterado, mas não é conversão. Status de conversão configurado:', conversionStatusSetting?.value, 'Status atual:', status.id);
        }
      }
    } catch (conversionError) {
      console.error('💥 ERRO NO PROCESSAMENTO DE CONVERSÃO:', conversionError);
    }

    console.log('🏁 === CALLBACK DE STATUS FINALIZADO ===');

    return new Response(JSON.stringify({ 
      success: true, 
      lead: updatedLead,
      message: `Status do lead ${existingLead.name} atualizado para ${status_name}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('💥 Erro geral no callback:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
