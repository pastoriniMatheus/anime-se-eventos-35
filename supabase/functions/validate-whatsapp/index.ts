
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      console.log('❌ Método não permitido:', req.method);
      return new Response('Method not allowed', { 
        status: 405,
        headers: corsHeaders 
      });
    }

    const { whatsapp, validation_id } = await req.json();

    if (!whatsapp || !validation_id) {
      console.log('❌ Campos obrigatórios faltando:', { whatsapp, validation_id });
      return new Response('Missing required fields', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    console.log('🔄 Iniciando validação para número:', whatsapp, 'ID:', validation_id);

    // Buscar configurações de webhook
    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('*')
      .eq('key', 'webhook_urls')
      .single();

    if (settingsError) {
      console.error('❌ Erro ao buscar configurações:', settingsError);
      return new Response('Error fetching webhook configuration', { 
        status: 500,
        headers: corsHeaders 
      });
    }

    if (!settings?.value) {
      console.log('❌ Configurações de webhook não encontradas');
      return new Response('Webhook configurations not found', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Parse das configurações
    let webhookUrls;
    try {
      webhookUrls = typeof settings.value === 'string' 
        ? JSON.parse(settings.value) 
        : settings.value;
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse das configurações:', parseError);
      return new Response('Invalid webhook configuration format', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    const validationWebhook = webhookUrls?.whatsappValidation;

    if (!validationWebhook) {
      console.log('❌ Webhook de validação WhatsApp não configurado');
      return new Response('WhatsApp validation webhook not configured', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    console.log('📡 Webhook configurado:', validationWebhook);

    // Verificar se já existe validação com este ID
    const { data: existingValidation } = await supabase
      .from('whatsapp_validations')
      .select('*')
      .eq('id', validation_id)
      .maybeSingle();

    if (existingValidation) {
      console.log('⚠️ Validação já existe:', existingValidation);
      return new Response(JSON.stringify({
        error: 'Validation ID already exists',
        validation_id,
        existing_status: existingValidation.status
      }), { 
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Criar registro de validação pendente
    console.log('📝 Criando registro de validação...');
    const { data: validation, error: validationError } = await supabase
      .from('whatsapp_validations')
      .insert([{
        id: validation_id,
        whatsapp,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (validationError) {
      console.error('❌ Erro ao criar validação:', validationError);
      return new Response(JSON.stringify({
        error: 'Error creating validation',
        details: validationError.message,
        validation_id
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Validação criada:', validation);

    // Enviar para webhook externo
    try {
      console.log('📤 Enviando para webhook externo...');
      
      const webhookPayload = {
        whatsapp,
        validation_id,
        callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/whatsapp-validation-callback`
      };

      console.log('📋 Payload do webhook:', JSON.stringify(webhookPayload, null, 2));
      console.log('🌐 URL do callback configurada:', webhookPayload.callback_url);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const webhookResponse = await fetch(validationWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(webhookPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await webhookResponse.text();
      console.log('📥 Resposta do webhook:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        body: responseText
      });

      if (!webhookResponse.ok) {
        console.error('❌ Webhook retornou erro:', webhookResponse.status, responseText);
        
        // Atualizar status para erro
        await supabase
          .from('whatsapp_validations')
          .update({ 
            status: 'error',
            response_message: `Webhook error ${webhookResponse.status}: ${responseText}`,
            validated_at: new Date().toISOString()
          })
          .eq('id', validation_id);

        throw new Error(`Webhook returned ${webhookResponse.status}: ${responseText}`);
      }

      console.log('✅ Webhook chamado com sucesso');

      return new Response(JSON.stringify({ 
        success: true, 
        validation_id,
        message: 'Validation request sent successfully',
        webhook_status: webhookResponse.status,
        webhook_response: responseText,
        callback_url: webhookPayload.callback_url
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });

    } catch (webhookError) {
      console.error('❌ Erro no webhook:', webhookError);
      
      let errorMessage = webhookError.message;
      if (webhookError.name === 'AbortError') {
        errorMessage = 'Webhook timeout (30s exceeded)';
      }
      
      // Atualizar status para erro
      await supabase
        .from('whatsapp_validations')
        .update({ 
          status: 'error',
          response_message: `Webhook error: ${errorMessage}`,
          validated_at: new Date().toISOString()
        })
        .eq('id', validation_id);

      // Retornar erro mais específico
      return new Response(JSON.stringify({
        error: 'Webhook error',
        details: errorMessage,
        validation_id,
        webhook_url: validationWebhook
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('💥 Erro geral no endpoint:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      details: error.message
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
