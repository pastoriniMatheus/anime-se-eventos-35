
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  const [notes, setNotes] = useState('');
  
  const { data: statuses = [] } = useLeadStatuses();
  const updateStatus = useUpdateLeadStatus();

  const handleUpdateStatus = async () => {
    if (!selectedStatusId) return;
    
    console.log('🔄 Iniciando atualização de status via StatusEditor');
    
    try {
      await updateStatus.mutateAsync({
        leadId,
        statusId: selectedStatusId,
        notes: notes.trim() || undefined
      });
      
      setNotes('');
      if (onStatusChanged) {
        onStatusChanged();
      }
    } catch (error) {
      console.error('❌ Erro na atualização:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="status-select">Status</Label>
        <Select value={selectedStatusId} onValueChange={setSelectedStatusId}>
          <SelectTrigger>
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

      <div className="space-y-2">
        <Label htmlFor="notes">Observações (opcional)</Label>
        <Textarea
          id="notes"
          placeholder="Adicione observações sobre a mudança de status..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <Button 
        onClick={handleUpdateStatus} 
        disabled={!selectedStatusId || selectedStatusId === currentStatusId || updateStatus.isPending}
        className="w-full"
      >
        {updateStatus.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Atualizar Status
      </Button>
    </div>
  );
};

export default StatusEditor;
