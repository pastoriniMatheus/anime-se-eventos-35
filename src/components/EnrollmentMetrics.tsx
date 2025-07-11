
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Target, TrendingUp } from 'lucide-react';
import { useEnrollmentMetrics } from '@/hooks/useEnrollmentMetrics';

const EnrollmentMetrics = () => {
  const { data: metrics, isLoading } = useEnrollmentMetrics();

  if (isLoading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse bg-muted h-4 rounded w-3/4 mb-2"></div>
                <div className="animate-pulse bg-muted h-8 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas Resumidas de Matriculados */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matriculados</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEnrolled}</div>
            <p className="text-xs text-muted-foreground">
              Leads matriculados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Matrícula</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.enrollmentRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Lead → Matrícula
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.enrollmentByEvent.length}</div>
            <p className="text-xs text-muted-foreground">
              Com matrículas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista Completa de Matrículas por Evento */}
      <Card>
        <CardHeader>
          <CardTitle>Matrículas por Evento</CardTitle>
          <CardDescription>
            Performance detalhada de matrículas por evento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.enrollmentByEvent.length > 0 ? (
            <div className="space-y-4">
              {metrics.enrollmentByEvent.map((event) => (
                <div key={event.eventId} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{event.eventName}</h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-sm">
                        {event.enrolledCount}/{event.totalLeads} leads
                      </Badge>
                      <Badge 
                        variant={event.enrollmentRate >= 50 ? "default" : event.enrollmentRate >= 25 ? "secondary" : "destructive"}
                        className="text-sm font-medium"
                      >
                        {event.enrollmentRate.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Progresso de matrículas</span>
                      <span>{event.enrolledCount} de {event.totalLeads}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="bg-primary h-3 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${Math.min(event.enrollmentRate, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">{event.totalLeads}</div>
                      <div className="text-xs text-muted-foreground">Total Leads</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{event.enrolledCount}</div>
                      <div className="text-xs text-muted-foreground">Matriculados</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">{event.totalLeads - event.enrolledCount}</div>
                      <div className="text-xs text-muted-foreground">Pendentes</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma matrícula registrada</h3>
              <p className="text-muted-foreground">
                Quando houver matrículas, elas aparecerão aqui organizadas por evento.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnrollmentMetrics;
