
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Iniciando sincronização de leads...');

    // Buscar configurações de sincronização
    const { data: syncSettings, error: settingsError } = await supabaseClient
      .from('system_settings')
      .select('value')
      .eq('key', 'sync_webhook_settings')
      .single();

    if (settingsError || !syncSettings) {
      console.log('Configurações de sincronização não encontradas');
      return new Response(JSON.stringify({ error: 'Sync settings not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const config = typeof syncSettings.value === 'string' 
      ? JSON.parse(syncSettings.value) 
      : syncSettings.value;

    if (!config.enabled) {
      console.log('Sincronização desabilitada');
      return new Response(JSON.stringify({ message: 'Sync disabled' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Buscar URL do webhook
    const { data: webhookSettings, error: webhookError } = await supabaseClient
      .from('system_settings')
      .select('value')
      .eq('key', 'webhook_urls')
      .single();

    if (webhookError || !webhookSettings) {
      console.log('URLs de webhook não encontradas');
      return new Response(JSON.stringify({ error: 'Webhook URLs not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const webhookUrls = typeof webhookSettings.value === 'string'
      ? JSON.parse(webhookSettings.value)
      : webhookSettings.value;

    if (!webhookUrls.sync) {
      console.log('URL de sincronização não configurada');
      return new Response(JSON.stringify({ error: 'Sync webhook URL not configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Determinar quais leads buscar
    let leadsQuery = supabaseClient
      .from('leads')
      .select(`
        *,
        course:courses(name),
        postgraduate_course:postgraduate_courses(name),
        event:events(name),
        status:lead_statuses(name, color)
      `);

    if (config.mode === 'new_only') {
      // Buscar último timestamp de sincronização bem-sucedida
      const { data: lastSync } = await supabaseClient
        .from('system_settings')
        .select('value')
        .eq('key', 'last_successful_sync')
        .single();

      if (lastSync?.value) {
        const lastSyncTime = typeof lastSync.value === 'string' 
          ? lastSync.value 
          : lastSync.value.timestamp;
        leadsQuery = leadsQuery.gt('created_at', lastSyncTime);
      }
    }

    const { data: leads, error: leadsError } = await leadsQuery.order('created_at', { ascending: false });

    if (leadsError) {
      console.error('Erro ao buscar leads:', leadsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch leads' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Encontrados ${leads?.length || 0} leads para sincronizar`);

    if (!leads || leads.length === 0) {
      return new Response(JSON.stringify({ message: 'No leads to sync', count: 0 }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Enviar leads para o webhook
    const webhookResponse = await fetch(webhookUrls.sync, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        leads: leads,
        sync_mode: config.mode,
        timestamp: new Date().toISOString(),
        total_leads: leads.length
      })
    });

    const responseText = await webhookResponse.text();
    console.log('Resposta do webhook:', responseText);

    if (webhookResponse.ok) {
      // Atualizar timestamp da última sincronização bem-sucedida
      await supabaseClient
        .from('system_settings')
        .upsert({
          key: 'last_successful_sync',
          value: new Date().toISOString()
        });

      console.log('Sincronização realizada com sucesso');
      return new Response(JSON.stringify({ 
        success: true, 
        leads_sent: leads.length,
        webhook_response: responseText
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      console.error('Erro no webhook:', webhookResponse.status, responseText);
      return new Response(JSON.stringify({ 
        error: 'Webhook failed', 
        status: webhookResponse.status,
        response: responseText
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Erro na sincronização:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
