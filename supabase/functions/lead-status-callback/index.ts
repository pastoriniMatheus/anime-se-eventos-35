
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

    console.log('Callback recebido:', { lead_id, status_name, notes });

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
      console.log('Erro ao buscar status:', statusError);
      return new Response(`Status not found: ${status_name}`, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Verificar se o lead existe
    const { data: existingLead, error: leadError } = await supabase
      .from('leads')
      .select('id, name, email')
      .eq('id', lead_id)
      .single();

    if (leadError) {
      console.log('Erro ao buscar lead:', leadError);
      return new Response(`Lead not found: ${lead_id}`, { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // Atualizar o status do lead
    const updateData: any = {
      status_id: status.id,
      updated_at: new Date().toISOString()
    };

    // Se há notas, adicionar ao campo apropriado (você pode criar um campo notes na tabela leads se necessário)
    if (notes) {
      // Por enquanto, vamos apenas logar as notas
      console.log('Notas recebidas:', notes);
    }

    const { data: updatedLead, error: updateError } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', lead_id)
      .select(`
        *,
        course:courses(name),
        event:events(name),
        status:lead_statuses(name, color)
      `)
      .single();

    if (updateError) {
      console.error('Erro ao atualizar lead:', updateError);
      return new Response('Error updating lead status', { 
        status: 500,
        headers: corsHeaders 
      });
    }

    console.log('Lead atualizado com sucesso:', updatedLead);

    return new Response(JSON.stringify({ 
      success: true, 
      lead: updatedLead,
      message: `Status do lead ${existingLead.name} atualizado para ${status_name}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro no callback:', error);
    return new Response('Internal Server Error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
