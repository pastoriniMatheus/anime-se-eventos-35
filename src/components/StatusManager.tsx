
import React from 'react';
import { useLeadStatuses, useCreateLeadStatus } from '@/hooks/useLeads';
import EditableItemManager from './EditableItemManager';

const StatusManager = () => {
  const { data: leadStatuses = [], isLoading } = useLeadStatuses();
  const createStatus = useCreateLeadStatus();

  const handleCreateStatus = async (data: { name: string; color: string }) => {
    await createStatus.mutateAsync(data);
  };

  if (isLoading) {
    return <div>Carregando status...</div>;
  }

  return (
    <EditableItemManager
      title="Gerenciar Status de Leads"
      description="Adicione, edite ou remova status de leads do sistema"
      items={leadStatuses}
      onCreate={handleCreateStatus}
      itemName="status"
      withColor={true}
      tableName="lead_statuses"
      queryKey={['lead_statuses']}
    />
  );
};

export default StatusManager;
