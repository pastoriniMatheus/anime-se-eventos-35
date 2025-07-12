
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

    // VERIFICAR ENVIO AUTOMÁTICO DE CONVERSÃO
    console.log('🔍 === INICIANDO VERIFICAÇÃO DE CONVERSÃO ===');
    
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
        console.log('🚫 ENVIO AUTOMÁTICO DE CONVERSÃO DESABILITADO');
      } else {
        console.log('✅ ENVIO AUTOMÁTICO DE CONVERSÃO HABILITADO');
        
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
          console.log('🎉 LEAD CONVERTIDO - Iniciando envio automático');

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
            console.log('❌ NENHUM TEMPLATE DE CONVERSÃO ENCONTRADO');
          } else {
            console.log('⭐ TEMPLATE DE CONVERSÃO ENCONTRADO:', conversionTemplate.name);

            // 4. VERIFICAR SE LEAD TEM WHATSAPP
            if (!updatedLead.whatsapp) {
              console.log('❌ LEAD NÃO TEM WHATSAPP, PULANDO ENVIO');
            } else {
              console.log('📱 LEAD TEM WHATSAPP:', updatedLead.whatsapp);
              
              // 5. USAR A MESMA FUNÇÃO send-webhook QUE O SISTEMA DE CADASTRO USA
              console.log('🚀 CHAMANDO send-webhook PARA CONVERSÃO');

              const webhookData = {
                type: 'whatsapp',
                content: conversionTemplate.content,
                filter_type: 'automatic_conversion',
                filter_value: lead_id.toString(),
                send_only_to_new: false,
                delivery_code: `CONV-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
              };

              // Buscar configuração de webhook
              const { data: webhookSettings } = await supabase
                .from('system_settings')
                .select('value')
                .eq('key', 'webhook_urls')
                .single();

              let webhookUrl = '';
              if (webhookSettings?.value) {
                try {
                  const urls = JSON.parse(webhookSettings.value);
                  webhookUrl = urls.whatsapp || '';
                } catch (error) {
                  console.error('❌ Erro ao parsear webhook URLs:', error);
                }
              }

              if (!webhookUrl) {
                console.log('❌ URL DO WEBHOOK WHATSAPP NÃO ENCONTRADA');
              } else {
                console.log('🔗 WEBHOOK URL ENCONTRADA:', webhookUrl);

                // Chamar a função send-webhook (mesma que o sistema de cadastro usa)
                const { data: webhookResponse, error: webhookError } = await supabase.functions.invoke('send-webhook', {
                  body: {
                    webhook_url: webhookUrl,
                    webhook_data: webhookData
                  }
                });

                if (webhookError) {
                  console.error('❌ ERRO AO CHAMAR send-webhook:', webhookError);
                } else {
                  console.log('✅ send-webhook CHAMADA COM SUCESSO:', webhookResponse);
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
