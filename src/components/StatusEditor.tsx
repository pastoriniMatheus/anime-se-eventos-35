
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeadStatuses } from '@/hooks/useLeads';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface StatusEditorProps {
  leadId: string;
  currentStatus: any;
}

const StatusEditor = ({ leadId, currentStatus }: StatusEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { data: leadStatuses = [] } = useLeadStatuses();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = async (newStatusId: string) => {
    try {
      console.log('🔄 Iniciando mudança de status do lead:', leadId);
      console.log('📊 Status anterior:', currentStatus?.name, 'ID:', currentStatus?.id);
      
      // Buscar o novo status para obter o nome
      const newStatus = leadStatuses.find(status => status.id === newStatusId);
      console.log('📊 Novo status:', newStatus?.name, 'ID:', newStatusId);

      // Verificar se houve mudança real
      if (currentStatus?.id === newStatusId) {
        console.log('ℹ️ Status não mudou, cancelando operação');
        setIsEditing(false);
        return;
      }

      // Atualizar o status do lead primeiro
      const { error: updateError } = await supabase
        .from('leads')
        .update({ status_id: newStatusId })
        .eq('id', leadId);

      if (updateError) {
        console.error('❌ Erro ao atualizar lead:', updateError);
        throw updateError;
      }

      console.log('✅ Status do lead atualizado no banco');

      // Chamar a função lead-status-callback com IDs corretos
      console.log('🚀 Chamando função lead-status-callback...');
      
      const callbackData = {
        lead_id: leadId,
        status_name: newStatus?.name || 'Unknown',
        previous_status_id: currentStatus?.id || null,
        new_status_id: newStatusId,
        notes: `Status alterado via interface de ${currentStatus?.name || 'status anterior'} para ${newStatus?.name || 'novo status'}`
      };

      console.log('📦 Dados para callback:', callbackData);

      const { data: callbackResponse, error: callbackError } = await supabase.functions.invoke('lead-status-callback', {
        body: callbackData
      });

      if (callbackError) {
        console.error('❌ Erro na função callback:', callbackError);
        toast({
          title: "Status atualizado",
          description: "Status atualizado, mas houve erro no processamento automático",
          variant: "destructive",
        });
      } else {
        console.log('✅ Callback executado com sucesso:', callbackResponse);
        toast({
          title: "Status atualizado",
          description: "Status do lead atualizado com sucesso!",
        });
      }

      // Invalidar queries para atualizar a UI
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setIsEditing(false);

    } catch (error: any) {
      console.error('💥 Erro geral:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar status",
        variant: "destructive",
      });
    }
  };

  if (isEditing) {
    return (
      <Select 
        value={currentStatus?.id || ""} 
        onValueChange={handleStatusChange}
        onOpenChange={(open) => {
          if (!open) setIsEditing(false);
        }}
        defaultOpen={true}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Selecione..." />
        </SelectTrigger>
        <SelectContent>
          {leadStatuses.map((status: any) => (
            <SelectItem key={status.id} value={status.id}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: status.color }}
                />
                {status.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Badge 
      style={{ 
        backgroundColor: currentStatus?.color || '#f59e0b', 
        color: 'white',
        cursor: 'pointer'
      }}
      className="hover:opacity-80 transition-opacity"
      onClick={() => setIsEditing(true)}
    >
      {currentStatus?.name || 'Sem status'}
    </Badge>
  );
};

export default StatusEditor;
