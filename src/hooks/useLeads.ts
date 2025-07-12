
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useLeads = () => {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          course:courses(name),
          postgraduate_course:postgraduate_courses(name),
          event:events(name),
          status:lead_statuses(name, color),
          scan_session:scan_sessions(
            id,
            scanned_at,
            qr_code:qr_codes(type, scans)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ leadId, statusId, notes }: { leadId: string; statusId: string; notes?: string }) => {
      console.log('🔄 Atualizando status do lead:', { leadId, statusId, notes });
      
      // Primeiro buscar o status pelo ID para obter o nome
      const { data: statusData, error: statusError } = await supabase
        .from('lead_statuses')
        .select('name')
        .eq('id', statusId)
        .single();

      if (statusError) {
        console.error('❌ Erro ao buscar status:', statusError);
        throw new Error('Status não encontrado');
      }

      console.log('✅ Status encontrado:', statusData.name);

      // Atualizar o lead no banco
      const { data: updatedLead, error: updateError } = await supabase
        .from('leads')
        .update({ 
          status_id: statusId,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Erro ao atualizar lead:', updateError);
        throw updateError;
      }

      console.log('✅ Lead atualizado com sucesso');

      // Chamar a função de callback para processar conversão automática
      console.log('🚀 Chamando função lead-status-callback...');
      try {
        const { data: callbackResponse, error: callbackError } = await supabase.functions.invoke('lead-status-callback', {
          body: {
            lead_id: leadId,
            status_name: statusData.name,
            notes: notes || null
          }
        });

        if (callbackError) {
          console.error('❌ Erro no callback:', callbackError);
          // Não falha a operação se o callback der erro
        } else {
          console.log('✅ Callback executado:', callbackResponse);
        }
      } catch (callbackErr) {
        console.error('❌ Erro ao chamar callback:', callbackErr);
        // Não falha a operação se o callback der erro
      }

      return updatedLead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Status atualizado",
        description: "O status do lead foi atualizado com sucesso!",
      });
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar status do lead",
        variant: "destructive",
      });
    }
  });
};

export const useLeadStatuses = () => {
  return useQuery({
    queryKey: ['lead_statuses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_statuses')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (leadData: any) => {
      const { data, error } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead criado",
        description: "O lead foi criado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar lead",
        variant: "destructive",
      });
    }
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: any) => {
      const { data, error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead atualizado",
        description: "O lead foi atualizado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar lead",
        variant: "destructive",
      });
    }
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (leadId: string) => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead excluído",
        description: "O lead foi excluído com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir lead",
        variant: "destructive",
      });
    }
  });
};
