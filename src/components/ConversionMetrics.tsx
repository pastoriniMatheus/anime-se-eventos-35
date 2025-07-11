
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, Users, Calendar } from 'lucide-react';

interface ConversionMetricsProps {
  leads: any[];
  events: any[];
  totalScans: number;
}

const ConversionMetrics = ({ leads, events, totalScans }: ConversionMetricsProps) => {
  const conversionRate = totalScans > 0 ? (leads.length / totalScans) * 100 : 0;
  const averageLeadsPerEvent = events.length > 0 ? leads.length / events.length : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            Leads / Total de Scans
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Leads por Evento</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageLeadsPerEvent.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">
            Média de conversões
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{leads.length}</div>
          <p className="text-xs text-muted-foreground">
            Leads capturados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eventos Ativos</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{events.length}</div>
          <p className="text-xs text-muted-foreground">
            Eventos cadastrados
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversionMetrics;
