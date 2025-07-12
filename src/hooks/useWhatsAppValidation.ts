
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useWhatsAppValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'valid' | 'invalid' | null>(null);
  const { toast } = useToast();

  const validateWhatsApp = async (phone: string): Promise<boolean> => {
    const numbers = phone.replace(/\D/g, '');
    
    if (numbers.length !== 11) {
      setValidationResult('invalid');
      toast({
        title: "Formato inválido",
        description: "O número deve ter 11 dígitos (DD + 9 dígitos)",
        variant: "destructive",
      });
      return false;
    }

    setIsValidating(true);
    setValidationResult(null);
    
    try {
      console.log('🔄 Iniciando validação WhatsApp para:', numbers);

      // Buscar configuração do webhook de validação WhatsApp
      const { data: settings, error: settingsError } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', 'whatsapp_validation_webhook')
        .single();

      if (settingsError || !settings?.value) {
        console.log('❌ Webhook de validação WhatsApp não configurado:', settingsError);
        setIsValidating(false);
        setValidationResult('invalid');
        toast({
          title: "Configuração necessária",
          description: "O webhook de validação WhatsApp não está configurado. Entre em contato com o administrador.",
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ Webhook de validação encontrado:', settings.value);

      // Gerar ID único para a validação
      const validationId = crypto.randomUUID();
      console.log('🆔 ID de validação gerado:', validationId);

      // Chamar a edge function de validação
      console.log('📡 Chamando edge function validate-whatsapp...');
      const { data, error } = await supabase.functions.invoke('validate-whatsapp', {
        body: {
          whatsapp: numbers,
          validation_id: validationId
        }
      });

      if (error) {
        console.error('❌ Erro na edge function:', error);
        setIsValidating(false);
        setValidationResult('invalid');
        toast({
          title: "Erro na validação",
          description: "Ocorreu um erro ao iniciar a validação. Tente novamente.",
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ Edge function retornou:', data);

      // Aguardar resposta da validação
      const pollValidation = async (): Promise<boolean> => {
        let attempts = 0;
        const maxAttempts = 60; // 60 segundos
        
        console.log('🔍 Iniciando polling para validação ID:', validationId);
        console.log('⏱️ Timeout configurado para:', maxAttempts, 'segundos');
        
        while (attempts < maxAttempts) {
          console.log(`📊 Tentativa ${attempts + 1}/${maxAttempts} - Verificando status...`);
          
          const { data: validation, error: queryError } = await supabase
            .from('whatsapp_validations')
            .select('*')
            .eq('id', validationId)
            .maybeSingle();

          if (queryError) {
            console.error('❌ Erro na consulta:', queryError);
          } else if (validation) {
            console.log('📋 Validação encontrada:', {
              id: validation.id,
              status: validation.status,
              created_at: validation.created_at,
              validated_at: validation.validated_at,
              response_message: validation.response_message
            });
            
            if (validation.status !== 'pending') {
              console.log('🎯 Validação finalizada com status:', validation.status);
              
              if (validation.status === 'valid') {
                setValidationResult('valid');
                setIsValidating(false);
                console.log('✅ Número validado com sucesso!');
                toast({
                  title: "WhatsApp validado",
                  description: "Número verificado com sucesso!",
                  variant: "default",
                });
                return true;
              } else if (validation.status === 'invalid') {
                setValidationResult('invalid');
                setIsValidating(false);
                console.log('❌ Número inválido:', validation.response_message);
                toast({
                  title: "WhatsApp não encontrado",
                  description: validation.response_message || "Número não encontrado ou inválido. Verifique se o número está correto e ativo no WhatsApp.",
                  variant: "destructive",
                });
                return false;
              } else if (validation.status === 'error') {
                setValidationResult('invalid');
                setIsValidating(false);
                console.log('💥 Erro na validação:', validation.response_message);
                toast({
                  title: "Erro na validação",
                  description: validation.response_message || "Ocorreu um erro ao validar o número. Tente novamente.",
                  variant: "destructive",
                });
                return false;
              }
            } else {
              console.log('⏳ Validação ainda pendente, aguardando...');
            }
          } else {
            console.log('⚠️ Nenhuma validação encontrada ainda...');
          }

          // Aguardar 1 segundo antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        }

        // Timeout
        console.log('⏰ Timeout na validação');
        setValidationResult('invalid');
        setIsValidating(false);
        toast({
          title: "Timeout na validação",
          description: "A validação demorou mais que o esperado. Verifique sua conexão e tente novamente.",
          variant: "destructive",
        });
        return false;
      };

      return await pollValidation();

    } catch (error: any) {
      console.error('💥 Erro na validação:', error);
      setIsValidating(false);
      setValidationResult('invalid');
      
      toast({
        title: "Erro na validação",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      
      return false;
    }
  };

  return {
    validateWhatsApp,
    isValidating,
    validationResult,
    setValidationResult
  };
};
