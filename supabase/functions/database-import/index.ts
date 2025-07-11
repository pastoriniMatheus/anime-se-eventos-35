
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Method not allowed',
      details: 'Only POST method is allowed'
    }), { 
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { password, sqlContent, filename } = await req.json();

    // Verificar senha de acesso
    const requiredPassword = "admin123"; // Senha fixa para segurança
    if (!password || password !== requiredPassword) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        details: 'Senha incorreta para importação do banco de dados'
      }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!sqlContent || !filename) {
      return new Response(JSON.stringify({
        error: 'Missing data',
        details: 'Conteúdo SQL e nome do arquivo são obrigatórios'
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`🚀 Iniciando importação autorizada do arquivo: ${filename}`);

    // Usar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variáveis de ambiente não configuradas');
      return new Response(JSON.stringify({
        error: 'Server configuration error',
        details: 'Missing Supabase environment variables'
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Dividir o conteúdo SQL em comandos individuais
    const sqlCommands = sqlContent
      .split(';')
      .map((cmd: string) => cmd.trim())
      .filter((cmd: string) => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📊 Processando ${sqlCommands.length} comandos SQL`);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const command of sqlCommands) {
      try {
        if (command.toUpperCase().startsWith('INSERT') || 
            command.toUpperCase().startsWith('UPDATE') || 
            command.toUpperCase().startsWith('DELETE') ||
            command.toUpperCase().startsWith('TRUNCATE')) {
          
          const { error } = await supabase.rpc('execute_sql', { 
            sql_query: command 
          });

          if (error) {
            console.error(`❌ Erro ao executar comando: ${command.substring(0, 50)}...`, error);
            errors.push(`${command.substring(0, 50)}: ${error.message}`);
            errorCount++;
          } else {
            successCount++;
          }
        }
      } catch (cmdError: any) {
        console.error(`💥 Erro ao processar comando: ${command.substring(0, 50)}...`, cmdError);
        errors.push(`${command.substring(0, 50)}: ${cmdError.message}`);
        errorCount++;
      }
    }

    const result = {
      success: true,
      message: `Importação concluída: ${successCount} comandos executados com sucesso, ${errorCount} erros`,
      details: {
        filename,
        totalCommands: sqlCommands.length,
        successCount,
        errorCount,
        errors: errors.slice(0, 10) // Limitar a 10 erros
      }
    };

    console.log(`✅ Importação concluída:`, result);

    return new Response(JSON.stringify(result), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json'
      },
      status: 200
    });

  } catch (error: any) {
    console.error('💥 ERRO GERAL NA IMPORTAÇÃO:', error);
    
    return new Response(JSON.stringify({
      error: 'Database import failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
