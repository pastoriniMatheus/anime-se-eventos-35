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
import { useNomenclature } from '@/hooks/useNomenclature';
import { Layout } from '@/components/Layout';

const Settings = () => {
  const [activeMainTab, setActiveMainTab] = useState('webhooks');
  const [activeSecondaryTab, setActiveSecondaryTab] = useState('webhooks');
  const { courseNomenclature, postgraduateNomenclature } = useNomenclature();
  const supabaseUrl = "https://iznfrkdsmbtynmifqcdd.supabase.co";

  return (
    <Layout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-blue-600">Configurações do Sistema</h1>
      </div>

      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="webhooks" className="flex items-center space-x-2">
            <Webhook className="h-4 w-4" />
            <span>Webhooks & APIs</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Mensagens</span>
          </TabsTrigger>
          <TabsTrigger value="personalization" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Personalização</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>{courseNomenclature}</span>
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center space-x-2">
            <Settings2 className="h-4 w-4" />
            <span>Formulário</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Dados</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks">
          <Tabs value={activeSecondaryTab} onValueChange={setActiveSecondaryTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="webhooks">Configurações de Webhook</TabsTrigger>
              <TabsTrigger value="apis">APIs & Endpoints</TabsTrigger>
            </TabsList>

            <TabsContent value="webhooks">
              <WebhookSettings />
            </TabsContent>

            <TabsContent value="apis">
              <APIsSettings />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="messages">
          <AutoMessageSettings />
        </TabsContent>

        <TabsContent value="personalization">
          <Tabs defaultValue="visual" className="space-y-4">
            <TabsList>
              <TabsTrigger value="visual">Cores e Visual</TabsTrigger>
              <TabsTrigger value="nomenclature">Nomenclaturas</TabsTrigger>
              <TabsTrigger value="status">Status de Leads</TabsTrigger>
            </TabsList>

            <TabsContent value="visual">
              <VisualSettings />
            </TabsContent>

            <TabsContent value="nomenclature">
              <NomenclatureSettings />
            </TabsContent>

            <TabsContent value="status">
              <StatusManager />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="products">
          <Tabs defaultValue="courses" className="space-y-4">
            <TabsList>
              <TabsTrigger value="courses">{courseNomenclature}</TabsTrigger>
              <TabsTrigger value="postgraduate">{postgraduateNomenclature}</TabsTrigger>
            </TabsList>

            <TabsContent value="courses">
              <CourseManager />
            </TabsContent>

            <TabsContent value="postgraduate">
              <PostgraduateCourseManager />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="form">
          <Tabs defaultValue="form-settings" className="space-y-4">
            <TabsList>
              <TabsTrigger value="form-settings">Configurações do Formulário</TabsTrigger>
              <TabsTrigger value="enrollment-status">Status de Matrícula</TabsTrigger>
            </TabsList>

            <TabsContent value="form-settings">
              <FormSettings />
            </TabsContent>

            <TabsContent value="enrollment-status">
              <EnrollmentStatusSettings />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="data">
          <Tabs defaultValue="export" className="space-y-4">
            <TabsList>
              <TabsTrigger value="export">Exportar/Importar</TabsTrigger>
              <TabsTrigger value="info">Informações do Sistema</TabsTrigger>
            </TabsList>

            <TabsContent value="export">
              <DatabaseExport />
            </TabsContent>

            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>Informações do Sistema</span>
                  </CardTitle>
                  <CardDescription>
                    Informações técnicas sobre o sistema e configurações
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">URL do Supabase:</span>
                      <code className="text-sm bg-background px-2 py-1 rounded">
                        {supabaseUrl}
                      </code>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">Nomenclatura {courseNomenclature}:</span>
                      <Badge variant="outline">{courseNomenclature}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">Nomenclatura {postgraduateNomenclature}:</span>
                      <Badge variant="outline">{postgraduateNomenclature}</Badge>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Sistema de Gestão de Leads
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
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
    </Layout>
  );
};

export default Settings;
