
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeads } from '@/hooks/useLeads';
import { useQRCodes } from '@/hooks/useQRCodes';
import { useEvents } from '@/hooks/useEvents';
import { useCourses } from '@/hooks/useCourses';
import { usePostgraduateCourses } from '@/hooks/usePostgraduateCourses';
import { useConversionMetrics } from '@/hooks/useMetrics';
import { useIsMobile } from '@/hooks/use-mobile';
import ConversionMetrics from '@/components/ConversionMetrics';
import SessionMetrics from '@/components/SessionMetrics';
import EnrollmentMetrics from '@/components/EnrollmentMetrics';
import EventReportGenerator from '@/components/EventReportGenerator';
import DashboardVisibilityMenu, { DashboardVisibility } from '@/components/DashboardVisibilityMenu';
import LeadsByEventChart from '@/components/LeadsByEventChart';
import LeadsByCourseChart from '@/components/LeadsByCourseChart';
import CourseRanking from '@/components/CourseRanking';
import EventRanking from '@/components/EventRanking';
import { 
  Users, 
  QrCode, 
  Calendar, 
  TrendingUp,
  Eye,
  UserPlus,
  Target,
  Activity,
  RefreshCw,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { useNomenclature } from '@/hooks/useNomenclature';
import { Layout } from '@/components/Layout';

const Dashboard = () => {
  const { data: leads = [] } = useLeads();
  const { data: qrCodes = [] } = useQRCodes();
  const { data: events = [] } = useEvents();
  const { data: courses = [] } = useCourses();
  const { data: postgraduateCourses = [] } = usePostgraduateCourses();
  const { data: metrics } = useConversionMetrics();
  const isMobile = useIsMobile();
  const { courseNomenclature, postgraduateNomenclature } = useNomenclature();

  const [visibility, setVisibility] = useState<DashboardVisibility>({
    stats: true,
    leadsByEvent: true,
    leadsByCourse: true,
    rankings: true,
    conversion: true
  });

  // Usar a métrica de scans das métricas de conversão em vez do campo inexistente
  const totalScans = metrics?.totalScans || 0;
  const todayLeads = leads.filter(lead => {
    const today = new Date().toDateString();
    const leadDate = new Date(lead.created_at).toDateString();
    return today === leadDate;
  }).length;

  // Métricas de graduação e pós-graduação
  const graduationLeads = leads.filter(lead => lead.course_id).length;
  const postgraduateLeads = leads.filter(lead => lead.postgraduate_course_id).length;

  const conversionRate = totalScans > 0 ? ((leads.length / totalScans) * 100).toFixed(1) : '0';
  const lastUpdate = new Date().toLocaleString('pt-BR');

  const statsCards = [
    {
      title: 'Total de Leads',
      value: leads.length.toLocaleString(),
      icon: Users,
      gradient: 'bg-gradient-primary',
      textColor: 'text-white'
    },
    {
      title: `Leads ${courseNomenclature}`,
      value: graduationLeads.toLocaleString(),
      icon: BookOpen,
      gradient: 'bg-gradient-secondary',
      textColor: 'text-white'
    },
    {
      title: `Leads ${postgraduateNomenclature}`,
      value: postgraduateLeads.toLocaleString(),
      icon: GraduationCap,
      gradient: 'bg-gradient-primary',
      textColor: 'text-white'
    },
    {
      title: 'Leads Hoje',
      value: todayLeads.toLocaleString(),
      icon: UserPlus,
      gradient: 'bg-gradient-secondary',
      textColor: 'text-white'
    },
    {
      title: 'QR Codes Ativos',
      value: qrCodes.length.toLocaleString(),
      icon: QrCode,
      gradient: 'bg-gradient-primary',
      textColor: 'text-white'
    },
    {
      title: 'Total de Scans',
      value: totalScans.toLocaleString(),
      icon: Eye,
      gradient: 'bg-gradient-secondary',
      textColor: 'text-white'
    },
    {
      title: 'Eventos Ativos',
      value: events.length.toLocaleString(),
      icon: Calendar,
      gradient: 'bg-gradient-primary',
      textColor: 'text-white'
    },
    {
      title: 'Taxa de Conversão',
      value: `${conversionRate}%`,
      icon: Target,
      gradient: 'bg-gradient-secondary',
      textColor: 'text-white'
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
            <div>
              <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-primary mb-2`}>
                Dashboard Executivo
              </h1>
              <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>Visão geral do seu sistema de captação de leads</p>
            </div>
            <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center space-x-4'}`}>
              <div className={`text-sm text-muted-foreground flex items-center ${isMobile ? 'text-xs' : ''}`}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Última atualização: {lastUpdate}
              </div>
              <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'space-x-2'}`}>
                <EventReportGenerator />
                <DashboardVisibilityMenu 
                  visibility={visibility} 
                  onVisibilityChange={setVisibility} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {visibility.stats && (
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'} gap-6 mb-8`}>
            {statsCards.map((stat, index) => (
              <Card key={index} className={`${stat.gradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-white/80 mb-1`}>{stat.title}</p>
                      <p className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold ${stat.textColor}`}>{stat.value}</p>
                    </div>
                    <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} bg-white/20 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm`}>
                      <stat.icon className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-white`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Charts Section */}
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-6 mb-8`}>
          {/* Leads by Event */}
          {visibility.leadsByEvent && (
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="border-b bg-gradient-primary text-white rounded-t-lg">
                <CardTitle className={`flex items-center space-x-2 ${isMobile ? 'text-base' : ''}`}>
                  <Calendar className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  <span>Leads por Evento</span>
                </CardTitle>
              </CardHeader>
              <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                <LeadsByEventChart leads={leads} events={events} />
              </CardContent>
            </Card>
          )}

          {/* Leads by Course */}
          {visibility.leadsByCourse && (
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="border-b bg-gradient-secondary text-white rounded-t-lg">
                <CardTitle className={`flex items-center space-x-2 ${isMobile ? 'text-base' : ''}`}>
                  <Users className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  <span>Leads por {courseNomenclature}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                <LeadsByCourseChart leads={leads} courses={courses} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Rankings Section */}
        {visibility.rankings && (
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-6 mb-8`}>
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="border-b bg-gradient-primary text-white rounded-t-lg">
                <CardTitle className={`flex items-center space-x-2 ${isMobile ? 'text-base' : ''}`}>
                  <TrendingUp className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  <span>{courseNomenclature} Mais Procurados</span>
                </CardTitle>
              </CardHeader>
              <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                <CourseRanking leads={leads} courses={courses} />
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="border-b bg-gradient-secondary text-white rounded-t-lg">
                <CardTitle className={`flex items-center space-x-2 ${isMobile ? 'text-base' : ''}`}>
                  <Target className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  <span>Eventos com Mais Capturas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                <EventRanking leads={leads} events={events} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Conversion Metrics */}
        {visibility.conversion && (
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-6 mb-8`}>
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="border-b bg-gradient-primary text-white rounded-t-lg">
                <CardTitle className={`flex items-center space-x-2 ${isMobile ? 'text-base' : ''}`}>
                  <TrendingUp className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  <span>Métricas de Conversão</span>
                </CardTitle>
              </CardHeader>
              <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                <ConversionMetrics leads={leads} events={events} totalScans={totalScans} />
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="border-b bg-gradient-secondary text-white rounded-t-lg">
                <CardTitle className={`flex items-center space-x-2 ${isMobile ? 'text-base' : ''}`}>
                  <Activity className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  <span>Métricas de Sessão</span>
                </CardTitle>
              </CardHeader>
              <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                <SessionMetrics />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enrollment Metrics */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="border-b bg-gradient-primary text-white rounded-t-lg">
            <CardTitle className={`flex items-center space-x-2 ${isMobile ? 'text-base' : ''}`}>
              <Users className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              <span>Métricas de Matrícula</span>
            </CardTitle>
          </CardHeader>
          <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
            <EnrollmentMetrics />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
