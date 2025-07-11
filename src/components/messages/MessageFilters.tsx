
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

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
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="filter-type">Filtrar por</Label>
        <Select value={filterType} onValueChange={(value) => {
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
          <Select value={filterValue} onValueChange={onFilterValueChange}>
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
              {filterType === 'status' && leadStatuses.map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default MessageFilters;
