
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

    console.log('🔄 Callback de status recebido:', { lead_id, status_name, notes });

    if (!lead_id || !status_name) {
      return new Response('Missing required fields: lead_id and status_name', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Buscar o status pelo nome
    const { data: status, error: statusError } = await supabase
      .from('lead_statuses')
      .select('id')
      .ilike('name', status_name)
      .single();

    if (statusError) {
      console.log('❌ Erro ao buscar status:', statusError);
      return new Response(`Status not found: ${status_name}`, { 
        status: 400,
        headers: corsHeaders 
      });
    }

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
    console.log('📊 Status anterior:', previousStatusId, 'Status novo:', status.id);

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

    // ============= VERIFICAR ENVIO AUTOMÁTICO DE CONVERSÃO =============
    // Só verifica conversão se o status mudou (evita loop)
    if (previousStatusId !== status.id) {
      console.log('🔍 === VERIFICANDO ENVIO AUTOMÁTICO DE CONVERSÃO ===');

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
          error: conversionSettingError?.message
        });

        const isConversionSendEnabled = conversionMessageSetting?.value === 'true';

        if (!isConversionSendEnabled) {
          console.log('🚫 ENVIO AUTOMÁTICO DE CONVERSÃO DESABILITADO');
        } else {
          // 2. VERIFICAR SE O NOVO STATUS É O STATUS DE CONVERSÃO
          const { data: conversionStatusSetting, error: conversionStatusError } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'conversion_status_id')
            .single();

          console.log('🎯 STATUS DE CONVERSÃO:', {
            found: !!conversionStatusSetting,
            conversion_status_id: conversionStatusSetting?.value,
            new_status_id: status.id,
            is_conversion: conversionStatusSetting?.value === status.id
          });

          if (conversionStatusSetting?.value === status.id) {
            console.log('🎉 LEAD CONVERTIDO - Iniciando envio automático');

            // 3. BUSCAR WEBHOOK URL
            const { data: webhookSetting, error: webhookError } = await supabase
              .from('system_settings')
              .select('value')
              .eq('key', 'webhook_urls')
              .single();

            if (!webhookSetting?.value) {
              console.log('❌ WEBHOOK_URLS NÃO CONFIGURADO');
            } else {
              let whatsappWebhookUrl;
              try {
                const webhookUrls = typeof webhookSetting.value === 'string' 
                  ? JSON.parse(webhookSetting.value) 
                  : webhookSetting.value;
                whatsappWebhookUrl = webhookUrls?.whatsapp;
              } catch (parseError) {
                console.error('❌ ERRO AO PARSEAR WEBHOOK_URLS:', parseError);
                whatsappWebhookUrl = null;
              }

              if (whatsappWebhookUrl) {
                // 4. BUSCAR TEMPLATE DE CONVERSÃO
                const { data: conversionTemplate, error: templateError } = await supabase
                  .from('message_templates')
                  .select('*')
                  .eq('is_conversion_default', true)
                  .single();

                if (!conversionTemplate) {
                  console.log('❌ NENHUM TEMPLATE DE CONVERSÃO ENCONTRADO');
                } else {
                  console.log('⭐ TEMPLATE DE CONVERSÃO ENCONTRADO:', conversionTemplate.name);

                  // 5. GERAR CÓDIGO DE ENTREGA
                  const deliveryCode = `CONV-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

                  // 6. CRIAR HISTÓRICO DE MENSAGEM
                  const { data: messageHistory, error: historyError } = await supabase
                    .from('message_history')
                    .insert({
                      type: 'whatsapp',
                      content: conversionTemplate.content,
                      delivery_code: deliveryCode,
                      filter_type: 'conversion',
                      filter_value: lead_id,
                      recipients_count: 1,
                      status: 'sending'
                    })
                    .select()
                    .single();

                  if (messageHistory) {
                    // 7. CRIAR RECIPIENT
                    await supabase
                      .from('message_recipients')
                      .insert({
                        message_history_id: messageHistory.id,
                        lead_id: lead_id,
                        delivery_status: 'pending'
                      });

                    // 8. PREPARAR PAYLOAD PADRONIZADO
                    const webhookPayload = {
                      type: "whatsapp",
                      content: conversionTemplate.content,
                      filter_type: "conversion",
                      filter_value: lead_id,
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
                      callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/message-delivery-webhook-endpoint`,
                      message_id: messageHistory.id,
                      delivery_code: deliveryCode
                    };

                    console.log('📦 PAYLOAD DE CONVERSÃO CRIADO:', {
                      lead_name: webhookPayload.leads[0].name,
                      delivery_code: deliveryCode
                    });

                    // 9. ENVIAR WEBHOOK
                    const webhookResponse = await fetch(whatsappWebhookUrl, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'User-Agent': 'Supabase-Conversion-Message/1.0',
                        'X-Lead-ID': lead_id,
                        'X-Delivery-Code': deliveryCode
                      },
                      body: JSON.stringify(webhookPayload)
                    });

                    const responseText = await webhookResponse.text();
                    console.log('📨 RESPOSTA DO WEBHOOK DE CONVERSÃO:', {
                      status: webhookResponse.status,
                      ok: webhookResponse.ok,
                      response_body: responseText
                    });

                    // 10. ATUALIZAR STATUS
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
                      .eq('lead_id', lead_id);

                    if (webhookResponse.ok) {
                      console.log('🎉 WEBHOOK DE CONVERSÃO ENVIADO COM SUCESSO!');
                    } else {
                      console.log('❌ FALHA NO WEBHOOK DE CONVERSÃO:', webhookResponse.status);
                    }
                  }
                }
              }
            }
          } else {
            console.log('ℹ️ Status alterado, mas não é conversão');
          }
        }
      } catch (conversionError) {
        console.error('💥 ERRO NO PROCESSAMENTO DE CONVERSÃO:', conversionError);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      lead: updatedLead,
      message: `Status do lead ${existingLead.name} atualizado para ${status_name}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('💥 Erro no callback:', error);
    return new Response('Internal Server Error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
