
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MessageComposer from '@/components/messages/MessageComposer';
import MessageHistory from '@/components/messages/MessageHistory';
import MessageTemplates from '@/components/messages/MessageTemplates';
import ContactsNeverMessaged from '@/components/messages/ContactsNeverMessaged';
import WebhookInfo from '@/components/messages/WebhookInfo';
import MessageRecipientsModal from '@/components/MessageRecipientsModal';
import MessageMetrics from '@/components/MessageMetrics';
import { Layout } from '@/components/Layout';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { MessageSquare, Send, History, FileText, Users, Settings } from 'lucide-react';

const Messages = () => {
  const [loadedTemplate, setLoadedTemplate] = useState<any>(null);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isRecipientsModalOpen, setIsRecipientsModalOpen] = useState(false);
  const { data: systemSettings = [] } = useSystemSettings();

  const handleLoadTemplate = (template: any) => {
    console.log('Template selecionado na página Messages:', template);
    setLoadedTemplate(template);
  };

  const handleTemplateLoaded = () => {
    setLoadedTemplate(null);
  };

  const handleViewRecipients = (message: any) => {
    console.log('Visualizar destinatários da mensagem:', message);
    setSelectedMessage(message);
    setIsRecipientsModalOpen(true);
  };

  const handleCloseRecipientsModal = () => {
    setIsRecipientsModalOpen(false);
    setSelectedMessage(null);
  };

  const getWebhookUrl = () => {
    const webhookSettings = systemSettings.find(s => s.key === 'webhook_urls');
    if (webhookSettings?.value) {
      try {
        const urls = JSON.parse(webhookSettings.value);
        return urls.whatsapp || 'Não configurado';
      } catch (error) {
        console.error('Erro ao parsear webhook URLs:', error);
        return 'Erro na configuração';
      }
    }
    return 'Não configurado';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 text-primary-foreground">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Mensagens</h1>
              <p className="text-primary-foreground/80">
                Gerencie e envie mensagens para seus leads
              </p>
            </div>
          </div>
        </div>

        {/* Métricas */}
        <MessageMetrics />

        <Tabs defaultValue="composer" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 bg-card">
            <TabsTrigger value="composer" className="flex items-center space-x-2">
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Enviar</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Contatos</span>
            </TabsTrigger>
            <TabsTrigger value="webhook" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Webhook</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="composer" className="space-y-4">
            <MessageComposer 
              loadedTemplate={loadedTemplate}
              onTemplateLoad={handleTemplateLoaded}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <MessageHistory onViewRecipients={handleViewRecipients} />
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <MessageTemplates onLoadTemplate={handleLoadTemplate} />
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <ContactsNeverMessaged />
          </TabsContent>

          <TabsContent value="webhook" className="space-y-4">
            <WebhookInfo webhookUrl={getWebhookUrl()} />
          </TabsContent>
        </Tabs>

        <MessageRecipientsModal
          isOpen={isRecipientsModalOpen}
          onClose={handleCloseRecipientsModal}
          messageHistory={selectedMessage}
        />
      </div>
    </Layout>
  );
};

export default Messages;
