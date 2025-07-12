
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LeadStatus {
  id: string;
  name: string;
  color: string;
}

interface MessageFiltersProps {
  filterType: string;
  filterValue: string;
  onFilterTypeChange: (value: string) => void;
  onFilterValueChange: (value: string) => void;
  leadStatuses: LeadStatus[];
  courses: any[];
  events: any[];
}

const MessageFilters = ({
  filterType,
  filterValue,
  onFilterTypeChange,
  onFilterValueChange,
  leadStatuses,
  courses,
  events
}: MessageFiltersProps) => {
  // Buscar status diretamente do banco para garantir que estão atualizados
  const { data: freshLeadStatuses = [], isLoading: statusLoading } = useQuery({
    queryKey: ['lead_statuses_for_filter'],
    queryFn: async () => {
      console.log('🔍 Buscando status para filtro de mensagens...');
      const { data, error } = await supabase
        .from('lead_statuses')
        .select('id, name, color')
        .order('name');
      
      if (error) {
        console.error('❌ Erro ao buscar status para filtro:', error);
        return [];
      }
      
      console.log('📊 Status encontrados para filtro:', data);
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });

  // Usar os status mais frescos ou os passados por props como fallback
  const statusesToUse = freshLeadStatuses.length > 0 ? freshLeadStatuses : leadStatuses;

  console.log('🎯 Status sendo usados no filtro:', statusesToUse);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="filter-type">Filtrar por</Label>
        <Select value={filterType} onValueChange={(value) => {
          console.log('🔄 Mudando tipo de filtro para:', value);
          onFilterTypeChange(value);
          onFilterValueChange('');
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o filtro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os contatos</SelectItem>
            <SelectItem value="course">Curso</SelectItem>
            <SelectItem value="event">Evento</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filterType && filterType !== 'all' && (
        <div className="space-y-2">
          <Label htmlFor="filter-value">
            {filterType === 'course' && 'Curso'}
            {filterType === 'event' && 'Evento'}
            {filterType === 'status' && 'Status'}
          </Label>
          <Select value={filterValue} onValueChange={(value) => {
            console.log('🔄 Mudando valor do filtro para:', value);
            onFilterValueChange(value);
          }}>
            <SelectTrigger>
              <SelectValue placeholder={`Selecione o ${filterType}`} />
            </SelectTrigger>
            <SelectContent>
              {filterType === 'course' && courses.map((course: any) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
              {filterType === 'event' && events.map((event: any) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name}
                </SelectItem>
              ))}
              {filterType === 'status' && (
                statusLoading ? 
                  <SelectItem value="loading" disabled>Carregando status...</SelectItem>
                : statusesToUse.length === 0 ?
                  <SelectItem value="no-status" disabled>Nenhum status encontrado</SelectItem>
                : statusesToUse.map((status: LeadStatus) => (
                  <SelectItem key={status.id} value={status.id}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: status.color }}
                      />
                      <span>{status.name}</span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default MessageFilters;
