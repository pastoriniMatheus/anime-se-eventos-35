
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useMessageTemplates = () => {
  return useQuery({
    queryKey: ['message_templates'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('message_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });
};

export const useMessages = () => {
  return useQuery({
    queryKey: ['message_history'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('message_history')
        .select('*')
        .order('sent_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });
};

export const useMessageHistory = () => {
  return useQuery({
    queryKey: ['message_history'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('message_history')
        .select('*')
        .order('sent_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });
};

export const useCreateMessageTemplate = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, content, type }: { name: string; content: string; type: string }) => {
      const { data, error } = await (supabase as any)
        .from('message_templates')
        .insert([{ name, content, type }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message_templates'] });
      toast({
        title: "Template salvo",
        description: "Template salvo com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar template",
        variant: "destructive",
      });
    }
  });
};

export const useDeleteMessageTemplate = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await (supabase as any)
        .from('message_templates')
        .delete()
        .eq('id', templateId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message_templates'] });
      toast({
        title: "Template excluído",
        description: "Template excluído com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir template",
        variant: "destructive",
      });
    }
  });
};

export const useSetDefaultTemplate = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      console.log('Definindo template padrão para novos leads:', templateId);
      
      // Primeiro, remove o padrão de todos os templates
      await (supabase as any)
        .from('message_templates')
        .update({ is_default: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Depois, define o template selecionado como padrão
      const { error } = await (supabase as any)
        .from('message_templates')
        .update({ is_default: true })
        .eq('id', templateId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message_templates'] });
    },
    onError: (error: any) => {
      console.error('Erro ao definir template padrão:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao definir template padrão",
        variant: "destructive",
      });
    }
  });
};

export const useSetConversionDefaultTemplate = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      console.log('Definindo template padrão para conversões:', templateId);
      
      // Primeiro, remove o padrão de conversão de todos os templates
      await (supabase as any)
        .from('message_templates')
        .update({ is_conversion_default: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Depois, define o template selecionado como padrão de conversão
      const { error } = await (supabase as any)
        .from('message_templates')
        .update({ is_conversion_default: true })
        .eq('id', templateId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message_templates'] });
    },
    onError: (error: any) => {
      console.error('Erro ao definir template de conversão:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao definir template de conversão",
        variant: "destructive",
      });
    }
  });
};

export const useClearMessageHistory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Limpar recipients primeiro devido às foreign keys
      await (supabase as any)
        .from('message_recipients')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Depois limpar o histórico
      const { error } = await (supabase as any)
        .from('message_history')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message_history'] });
      toast({
        title: "Histórico limpo",
        description: "Todo o histórico de mensagens foi removido com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao limpar histórico",
        variant: "destructive",
      });
    }
  });
};
