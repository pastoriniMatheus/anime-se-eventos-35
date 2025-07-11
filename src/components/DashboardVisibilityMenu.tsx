
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Settings } from 'lucide-react';

export interface DashboardVisibility {
  stats: boolean;
  leadsByEvent: boolean;
  leadsByCourse: boolean;
  rankings: boolean;
  conversion: boolean;
}

interface DashboardVisibilityMenuProps {
  visibility: DashboardVisibility;
  onVisibilityChange: (visibility: DashboardVisibility) => void;
}

const DashboardVisibilityMenu = ({ visibility, onVisibilityChange }: DashboardVisibilityMenuProps) => {
  const updateVisibility = (key: keyof DashboardVisibility, value: boolean) => {
    onVisibilityChange({
      ...visibility,
      [key]: value
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Visualização
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuCheckboxItem
          checked={visibility.stats}
          onCheckedChange={(checked) => updateVisibility('stats', checked)}
        >
          Estatísticas Gerais
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={visibility.leadsByEvent}
          onCheckedChange={(checked) => updateVisibility('leadsByEvent', checked)}
        >
          Leads por Evento
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={visibility.leadsByCourse}
          onCheckedChange={(checked) => updateVisibility('leadsByCourse', checked)}
        >
          Leads por Curso
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={visibility.rankings}
          onCheckedChange={(checked) => updateVisibility('rankings', checked)}
        >
          Rankings
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={visibility.conversion}
          onCheckedChange={(checked) => updateVisibility('conversion', checked)}
        >
          Métricas de Conversão
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DashboardVisibilityMenu;
