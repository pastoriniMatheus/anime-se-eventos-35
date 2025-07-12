
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

    console.log('🔄 === INÍCIO DO CALLBACK DE STATUS ===');
    console.log('📥 DADOS RECEBIDOS:', { lead_id, status_name, notes });

    if (!lead_id || !status_name) {
      console.log('❌ ERRO: Campos obrigatórios faltando');
      return new Response('Missing required fields: lead_id and status_name', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Buscar o status pelo nome (case insensitive)
    console.log('🔍 1. BUSCANDO STATUS PELO NOME:', status_name);
    const { data: status, error: statusError } = await supabase
      .from('lead_statuses')
      .select('id, name')
      .ilike('name', status_name)
      .single();

    if (statusError) {
      console.log('❌ ERRO AO BUSCAR STATUS:', statusError);
      return new Response(`Status not found: ${status_name}`, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    console.log('✅ STATUS ENCONTRADO:', { status_id: status.id, status_name: status.name });

    // Verificar se o lead existe e buscar status anterior
    console.log('🔍 2. BUSCANDO LEAD EXISTENTE:', lead_id);
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
      console.log('❌ ERRO AO BUSCAR LEAD:', leadError);
      return new Response(`Lead not found: ${lead_id}`, { 
        status: 404,
        headers: corsHeaders 
      });
    }

    console.log('✅ LEAD ENCONTRADO:', {
      id: existingLead.id,
      name: existingLead.name,
      whatsapp: existingLead.whatsapp,
      status_anterior: existingLead.status_id,
      status_anterior_nome: existingLead.status?.name
    });

    const previousStatusId = existingLead.status_id;
    console.log('🔍 3. COMPARANDO STATUS - Anterior:', previousStatusId, 'Novo:', status.id);

    // Só processa se o status realmente mudou
    if (previousStatusId === status.id) {
      console.log('ℹ️ STATUS NÃO MUDOU, PULANDO PROCESSAMENTO');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Status não alterado'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Atualizar o status do lead
    console.log('🔄 4. ATUALIZANDO STATUS DO LEAD');
    const updateData: any = {
      status_id: status.id,
      updated_at: new Date().toISOString()
    };

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
      console.error('❌ ERRO AO ATUALIZAR LEAD:', updateError);
      return new Response('Error updating lead status', { 
        status: 500,
        headers: corsHeaders 
      });
    }

    console.log('✅ LEAD ATUALIZADO COM SUCESSO');

    // === INÍCIO VERIFICAÇÃO DE CONVERSÃO ===
    console.log('🎯 === INICIANDO VERIFICAÇÃO DE CONVERSÃO ===');
    
    try {
      // 1. VERIFICAR SE ENVIO AUTOMÁTICO DE CONVERSÃO ESTÁ HABILITADO
      console.log('🔍 5. VERIFICANDO SE CONVERSÃO AUTOMÁTICA ESTÁ HABILITADA...');
      const { data: conversionMessageSetting, error: conversionSettingError } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'conversion_message_enabled')
        .single();

      console.log('🤖 CONFIGURAÇÃO CONVERSÃO MESSAGE:', {
        encontrado: !!conversionMessageSetting,
        valor_raw: conversionMessageSetting?.value,
        habilitado: conversionMessageSetting?.value === 'true',
        erro: conversionSettingError?.message
      });

      if (!conversionMessageSetting || conversionMessageSetting.value !== 'true') {
        console.log('🚫 CONVERSÃO AUTOMÁTICA DESABILITADA - SAINDO');
        return new Response(JSON.stringify({ 
          success: true, 
          lead: updatedLead,
          message: `Status do lead ${existingLead.name} atualizado para ${status_name}`,
          conversion_message: 'Conversão automática desabilitada'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      } 
      
      console.log('✅ CONVERSÃO AUTOMÁTICA HABILITADA');
      
      // 2. BUSCAR STATUS DE CONVERSÃO CONFIGURADO
      console.log('🔍 6. BUSCANDO STATUS DE CONVERSÃO CONFIGURADO...');
      const { data: conversionStatusSetting, error: conversionStatusError } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'conversion_status_id')
        .single();

      console.log('🎯 VERIFICAÇÃO DE STATUS DE CONVERSÃO:', {
        encontrado: !!conversionStatusSetting,
        conversion_status_id_configurado: conversionStatusSetting?.value,
        novo_status_id: status.id,
        novo_status_nome: status.name,
        é_conversão: conversionStatusSetting?.value === status.id,
        erro: conversionStatusError?.message
      });

      if (!conversionStatusSetting || conversionStatusSetting.value !== status.id) {
        console.log('ℹ️ STATUS NÃO É DE CONVERSÃO');
        console.log('   - Status configurado para conversão:', conversionStatusSetting?.value);
        console.log('   - Status atual do lead:', status.id);
        console.log('   - Nome do status atual:', status.name);
        return new Response(JSON.stringify({ 
          success: true, 
          lead: updatedLead,
          message: `Status do lead ${existingLead.name} atualizado para ${status_name}`,
          conversion_message: 'Status alterado mas não é conversão'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      console.log('🎉 *** CONVERSÃO DETECTADA *** - Processando envio automático');

      // 3. BUSCAR TEMPLATE DE CONVERSÃO
      console.log('🔍 7. BUSCANDO TEMPLATE DE CONVERSÃO...');
      const { data: conversionTemplate, error: templateError } = await supabase
        .from('message_templates')
        .select('*')
        .eq('is_conversion_default', true)
        .single();

      console.log('📝 TEMPLATE DE CONVERSÃO:', {
        encontrado: !!conversionTemplate,
        template_nome: conversionTemplate?.name,
        template_id: conversionTemplate?.id,
        conteúdo_preview: conversionTemplate?.content?.substring(0, 50) + '...',
        erro: templateError?.message
      });

      if (!conversionTemplate) {
        console.log('❌ TEMPLATE DE CONVERSÃO NÃO ENCONTRADO');
        return new Response(JSON.stringify({ 
          success: true, 
          lead: updatedLead,
          message: `Status do lead ${existingLead.name} atualizado para ${status_name}`,
          conversion_message: 'Template de conversão não encontrado'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      console.log('⭐ TEMPLATE DE CONVERSÃO ENCONTRADO:', conversionTemplate.name);

      // 4. VERIFICAR SE LEAD TEM WHATSAPP
      console.log('🔍 8. VERIFICANDO WHATSAPP DO LEAD...');
      if (!updatedLead.whatsapp) {
        console.log('❌ LEAD NÃO TEM WHATSAPP - SAINDO');
        return new Response(JSON.stringify({ 
          success: true, 
          lead: updatedLead,
          message: `Status do lead ${existingLead.name} atualizado para ${status_name}`,
          conversion_message: 'Lead não possui WhatsApp'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      console.log('📱 LEAD TEM WHATSAPP:', updatedLead.whatsapp);
      
      // 5. BUSCAR CONFIGURAÇÃO DE WEBHOOK
      console.log('🔍 9. BUSCANDO CONFIGURAÇÃO DE WEBHOOK...');
      const { data: webhookSettings, error: webhookError } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'webhook_urls')
        .single();

      console.log('🔗 CONFIGURAÇÃO DE WEBHOOK:', {
        encontrado: !!webhookSettings,
        valor_raw: webhookSettings?.value,
        erro: webhookError?.message
      });

      let webhookUrl = '';
      if (webhookSettings?.value) {
        try {
          const urls = JSON.parse(webhookSettings.value);
          webhookUrl = urls.whatsapp || '';
          console.log('🔗 WEBHOOK URLS PARSEADAS:', urls);
          console.log('🔗 WEBHOOK WHATSAPP URL:', webhookUrl);
        } catch (parseError) {
          console.error('❌ Erro ao parsear webhook URLs:', parseError);
        }
      }

      if (!webhookUrl) {
        console.log('❌ URL DO WEBHOOK WHATSAPP NÃO ENCONTRADA');
        return new Response(JSON.stringify({ 
          success: true, 
          lead: updatedLead,
          message: `Status do lead ${existingLead.name} atualizado para ${status_name}`,
          conversion_message: 'URL do webhook não configurada'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      console.log('🔗 WEBHOOK URL ENCONTRADA:', webhookUrl);

      // 6. PREPARAR DADOS PARA ENVIO VIA send-webhook
      console.log('🔍 10. PREPARANDO DADOS PARA ENVIO...');
      const webhookData = {
        type: 'whatsapp',
        content: conversionTemplate.content,
        filter_type: 'automatic_conversion',
        filter_value: lead_id.toString(),
        send_only_to_new: false,
        delivery_code: `CONV-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
      };

      console.log('📦 DADOS DO WEBHOOK PREPARADOS:', {
        type: webhookData.type,
        conteúdo_preview: webhookData.content.substring(0, 50) + '...',
        filter_type: webhookData.filter_type,
        filter_value: webhookData.filter_value,
        delivery_code: webhookData.delivery_code
      });

      // 7. CHAMAR FUNÇÃO send-webhook (igual ao sistema de cadastro automático)
      console.log('🚀 11. CHAMANDO FUNÇÃO send-webhook...');
      const { data: webhookResponse, error: webhookInvokeError } = await supabase.functions.invoke('send-webhook', {
        body: {
          webhook_url: webhookUrl,
          webhook_data: webhookData
        }
      });

      if (webhookInvokeError) {
        console.error('❌ ERRO AO CHAMAR send-webhook:', webhookInvokeError);
        return new Response(JSON.stringify({ 
          success: true, 
          lead: updatedLead,
          message: `Status do lead ${existingLead.name} atualizado para ${status_name}`,
          conversion_message: 'Erro ao enviar mensagem de conversão',
          conversion_error: webhookInvokeError.message
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      console.log('✅ send-webhook CHAMADA COM SUCESSO:', webhookResponse);
      console.log('🎉 === CONVERSÃO PROCESSADA COM SUCESSO ===');

      return new Response(JSON.stringify({ 
        success: true, 
        lead: updatedLead,
        message: `Status do lead ${existingLead.name} atualizado para ${status_name}`,
        conversion_message: 'Mensagem de conversão enviada com sucesso',
        webhook_response: webhookResponse
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });

    } catch (conversionError) {
      console.error('💥 ERRO NO PROCESSAMENTO DE CONVERSÃO:', conversionError);
      return new Response(JSON.stringify({ 
        success: true, 
        lead: updatedLead,
        message: `Status do lead ${existingLead.name} atualizado para ${status_name}`,
        conversion_message: 'Erro no processamento de conversão',
        conversion_error: conversionError.message
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

  } catch (error) {
    console.error('💥 ERRO GERAL NO CALLBACK:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
