
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Webhook, Palette, Type, Database, Users, Settings2, Globe, Package, MessageSquare } from 'lucide-react';
import WebhookSettings from '@/components/WebhookSettings';
import VisualSettings from '@/components/VisualSettings';
import FormSettings from '@/components/FormSettings';
import DatabaseExport from '@/components/DatabaseExport';
import StatusManager from '@/components/StatusManager';
import NomenclatureSettings from '@/components/NomenclatureSettings';
import EnrollmentStatusSettings from '@/components/EnrollmentStatusSettings';
import APIsSettings from '@/components/APIsSettings';
import CourseManager from '@/components/CourseManager';
import PostgraduateCourseManager from '@/components/PostgraduateCourseManager';
import AutoMessageSettings from '@/components/AutoMessageSettings';
import ConversionMessageSettings from '@/components/ConversionMessageSettings';
import { useNomenclature } from '@/hooks/useNomenclature';
import { Layout } from '@/components/Layout';

const Settings = () => {
  const [activeMainTab, setActiveMainTab] = useState('webhooks');
  const [activeSecondaryTab, setActiveSecondaryTab] = useState('webhooks');
  const [activeMessageTab, setActiveMessageTab] = useState('new-leads');
  const [activePersonalizationTab, setActivePersonalizationTab] = useState('visual');
  const [activeProductsTab, setActiveProductsTab] = useState('courses');
  const { courseNomenclature, postgraduateNomenclature } = useNomenclature();
  const supabaseUrl = "https://iznfrkdsmbtynmifqcdd.supabase.co";

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Configurações do Sistema
              </h1>
              <p className="text-muted-foreground mt-2">
                Gerencie todas as configurações da sua plataforma
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Settings2 className="h-8 w-8 text-primary" />
            </div>
          </div>

          <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-card/50 backdrop-blur-sm border shadow-lg">
              <TabsTrigger 
                value="webhooks" 
                className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Webhook className="h-4 w-4" />
                <span className="hidden sm:inline">Webhooks & APIs</span>
                <span className="sm:hidden">APIs</span>
              </TabsTrigger>
              <TabsTrigger 
                value="messages" 
                className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Mensagens</span>
                <span className="sm:hidden">Msg</span>
              </TabsTrigger>
              <TabsTrigger 
                value="personalization" 
                className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Personalização</span>
                <span className="sm:hidden">Visual</span>
              </TabsTrigger>
              <TabsTrigger 
                value="form" 
                className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Settings2 className="h-4 w-4" />
                <span className="hidden sm:inline">Formulário</span>
                <span className="sm:hidden">Form</span>
              </TabsTrigger>
              <TabsTrigger 
                value="data" 
                className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Dados</span>
                <span className="sm:hidden">Data</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="webhooks" className="space-y-6">
              <Tabs value={activeSecondaryTab} onValueChange={setActiveSecondaryTab} className="space-y-4">
                <TabsList className="bg-card/30 backdrop-blur-sm">
                  <TabsTrigger value="webhooks">Configurações de Webhook</TabsTrigger>
                  <TabsTrigger value="apis">APIs & Endpoints</TabsTrigger>
                </TabsList>

                <TabsContent value="webhooks">
                  <div className="bg-card/50 backdrop-blur-sm rounded-lg border shadow-lg">
                    <WebhookSettings />
                  </div>
                </TabsContent>

                <TabsContent value="apis">
                  <div className="bg-card/50 backdrop-blur-sm rounded-lg border shadow-lg">
                    <APIsSettings />
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
              <Tabs value={activeMessageTab} onValueChange={setActiveMessageTab} className="space-y-4">
                <TabsList className="bg-card/30 backdrop-blur-sm">
                  <TabsTrigger value="new-leads">Novos Leads</TabsTrigger>
                  <TabsTrigger value="conversions">Conversões</TabsTrigger>
                </TabsList>

                <TabsContent value="new-leads">
                  <div className="bg-card/50 backdrop-blur-sm rounded-lg border shadow-lg">
                    <AutoMessageSettings />
                  </div>
                </TabsContent>

                <TabsContent value="conversions">
                  <div className="bg-card/50 backdrop-blur-sm rounded-lg border shadow-lg">
                    <ConversionMessageSettings />
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="personalization" className="space-y-6">
              <Tabs value={activePersonalizationTab} onValueChange={setActivePersonalizationTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4 bg-card/30 backdrop-blur-sm">
                  <TabsTrigger value="visual">Cores e Visual</TabsTrigger>
                  <TabsTrigger value="nomenclature">Nomenclaturas</TabsTrigger>
                  <TabsTrigger value="status">Status de Leads</TabsTrigger>
                  <TabsTrigger value="products">Produtos</TabsTrigger>
                </TabsList>

                <TabsContent value="visual">
                  <div className="bg-card/50 backdrop-blur-sm rounded-lg border shadow-lg">
                    <VisualSettings />
                  </div>
                </TabsContent>

                <TabsContent value="nomenclature">
                  <div className="bg-card/50 backdrop-blur-sm rounded-lg border shadow-lg">
                    <NomenclatureSettings />
                  </div>
                </TabsContent>

                <TabsContent value="status">
                  <div className="bg-card/50 backdrop-blur-sm rounded-lg border shadow-lg">
                    <StatusManager />
                  </div>
                </TabsContent>

                <TabsContent value="products">
                  <Tabs value={activeProductsTab} onValueChange={setActiveProductsTab} className="space-y-4">
                    <TabsList className="bg-card/20 backdrop-blur-sm">
                      <TabsTrigger value="courses">{courseNomenclature}</TabsTrigger>
                      <TabsTrigger value="postgraduate">{postgraduateNomenclature}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="courses">
                      <div className="bg-card/50 backdrop-blur-sm rounded-lg border shadow-lg">
                        <CourseManager />
                      </div>
                    </TabsContent>

                    <TabsContent value="postgraduate">
                      <div className="bg-card/50 backdrop-blur-sm rounded-lg border shadow-lg">
                        <PostgraduateCourseManager />
                      </div>
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="form" className="space-y-6">
              <Tabs defaultValue="form-settings" className="space-y-4">
                <TabsList className="bg-card/30 backdrop-blur-sm">
                  <TabsTrigger value="form-settings">Configurações do Formulário</TabsTrigger>
                  <TabsTrigger value="enrollment-status">Status de Matrícula</TabsTrigger>
                </TabsList>

                <TabsContent value="form-settings">
                  <div className="bg-card/50 backdrop-blur-sm rounded-lg border shadow-lg">
                    <FormSettings />
                  </div>
                </TabsContent>

                <TabsContent value="enrollment-status">
                  <div className="bg-card/50 backdrop-blur-sm rounded-lg border shadow-lg">
                    <EnrollmentStatusSettings />
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="data" className="space-y-6">
              <Tabs defaultValue="export" className="space-y-4">
                <TabsList className="bg-card/30 backdrop-blur-sm">
                  <TabsTrigger value="export">Exportar/Importar</TabsTrigger>
                  <TabsTrigger value="info">Informações do Sistema</TabsTrigger>
                </TabsList>

                <TabsContent value="export">
                  <div className="bg-card/50 backdrop-blur-sm rounded-lg border shadow-lg">
                    <DatabaseExport />
                  </div>
                </TabsContent>

                <TabsContent value="info">
                  <Card className="bg-card/50 backdrop-blur-sm border shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Database className="h-5 w-5 text-primary" />
                        <span>Informações do Sistema</span>
                      </CardTitle>
                      <CardDescription>
                        Informações técnicas sobre o sistema e configurações
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                          <span className="font-medium text-foreground">URL do Supabase:</span>
                          <code className="text-sm bg-background/80 px-3 py-1 rounded border font-mono">
                            {supabaseUrl}
                          </code>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                          <span className="font-medium text-foreground">Nomenclatura {courseNomenclature}:</span>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            {courseNomenclature}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                          <span className="font-medium text-foreground">Nomenclatura {postgraduateNomenclature}:</span>
                          <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                            {postgraduateNomenclature}
                          </Badge>
                        </div>

                        <div className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
                          <h4 className="font-semibold text-primary mb-3 flex items-center">
                            <Globe className="h-4 w-4 mr-2" />
                            Sistema de Gestão de Leads
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Sistema completo para captura, gestão e acompanhamento de leads educacionais com integração WhatsApp, QR Codes e relatórios avançados.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
