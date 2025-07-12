
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLeadStatuses, useUpdateLeadStatus } from '@/hooks/useLeads';
import { Loader2 } from 'lucide-react';

interface StatusEditorProps {
  leadId: string;
  currentStatusId?: string;
  onStatusChanged?: () => void;
}

const StatusEditor = ({ leadId, currentStatusId, onStatusChanged }: StatusEditorProps) => {
  const [selectedStatusId, setSelectedStatusId] = useState(currentStatusId || '');
  
  const { data: statuses = [] } = useLeadStatuses();
  const updateStatus = useUpdateLeadStatus();

  const handleUpdateStatus = async () => {
    if (!selectedStatusId) return;
    
    console.log('🔄 Iniciando atualização de status via StatusEditor');
    
    try {
      await updateStatus.mutateAsync({
        leadId,
        statusId: selectedStatusId
      });
      
      if (onStatusChanged) {
        onStatusChanged();
      }
    } catch (error) {
      console.error('❌ Erro na atualização:', error);
    }
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label htmlFor="status-select" className="text-xs">Status</Label>
        <Select value={selectedStatusId} onValueChange={setSelectedStatusId}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Selecione um status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status: any) => (
              <SelectItem key={status.id} value={status.id}>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: status.color }}
                  />
                  <span>{status.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button 
        onClick={handleUpdateStatus} 
        disabled={!selectedStatusId || selectedStatusId === currentStatusId || updateStatus.isPending}
        className="w-full h-8 text-sm"
        size="sm"
      >
        {updateStatus.isPending && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
        Atualizar Status
      </Button>
    </div>
  );
};

export default StatusEditor;
