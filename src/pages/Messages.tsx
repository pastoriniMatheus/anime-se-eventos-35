
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

  // Buscar URL do webhook WhatsApp
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mensagens</h1>
          <p className="text-muted-foreground">
            Gerencie e envie mensagens para seus leads
          </p>
        </div>

        {/* Métricas */}
        <MessageMetrics />

        <Tabs defaultValue="composer" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="composer">Enviar</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
            <TabsTrigger value="webhook">Webhook</TabsTrigger>
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
