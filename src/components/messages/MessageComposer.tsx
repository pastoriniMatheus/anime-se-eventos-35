
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Send } from 'lucide-react';
import { useMessageSender } from '@/hooks/useMessageSender';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useCreateMessageTemplate } from '@/hooks/useMessages';
import { useCourses } from '@/hooks/useCourses';
import { useEvents } from '@/hooks/useEvents';
import MessageFilters from './MessageFilters';
import TemplateManager from './TemplateManager';
import SaveTemplateModal from './SaveTemplateModal';
import EmojiPicker from '@/components/EmojiPicker';

interface MessageComposerProps {
  loadedTemplate?: any;
  onTemplateLoad?: () => void;
}

const MessageComposer = ({ loadedTemplate, onTemplateLoad }: MessageComposerProps) => {
  const [message, setMessage] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterValue, setFilterValue] = useState('');
  const [sendOnlyToNew, setSendOnlyToNew] = useState(false);
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);

  const { data: systemSettings = [] } = useSystemSettings();
  const { data: courses = [] } = useCourses();
  const { data: events = [] } = useEvents();
  const { handleSendMessage, isSending } = useMessageSender(systemSettings);
  const createTemplateMutation = useCreateMessageTemplate();

  // Carregar template quando recebido
  useEffect(() => {
    if (loadedTemplate) {
      console.log('Template carregado no composer:', loadedTemplate);
      setMessage(loadedTemplate.content || '');
      if (onTemplateLoad) {
        onTemplateLoad();
      }
    }
  }, [loadedTemplate, onTemplateLoad]);

  const handleSend = async () => {
    await handleSendMessage(
      message,
      filterType,
      filterValue,
      sendOnlyToNew,
      () => {
        setMessage('');
        setFilterType('all');
        setFilterValue('');
        setSendOnlyToNew(false);
      }
    );
  };

  const handleSaveTemplate = async (templateName: string) => {
    try {
      await createTemplateMutation.mutateAsync({
        name: templateName,
        content: message,
        type: 'whatsapp'
      });
      setIsSaveTemplateModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar template:', error);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Enviar Mensagem</CardTitle>
          <CardDescription>
            Envie mensagens via WhatsApp para seus leads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <MessageFilters
            filterType={filterType}
            filterValue={filterValue}
            onFilterTypeChange={setFilterType}
            onFilterValueChange={setFilterValue}
            leadStatuses={[]}
            courses={courses}
            events={events}
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="message">Mensagem</Label>
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </div>
            <Textarea
              id="message"
              placeholder="Digite sua mensagem aqui..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="send-only-new"
              checked={sendOnlyToNew}
              onCheckedChange={setSendOnlyToNew}
            />
            <Label htmlFor="send-only-new" className="text-sm">
              Enviar apenas para contatos que nunca receberam mensagem
            </Label>
          </div>

          <div className="flex justify-between items-center">
            <TemplateManager
              message={message}
              onSaveTemplate={() => setIsSaveTemplateModalOpen(true)}
            />

            <Button
              onClick={handleSend}
              disabled={!message.trim() || isSending}
              className="flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>{isSending ? 'Enviando...' : 'Enviar Mensagem'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <SaveTemplateModal
        isOpen={isSaveTemplateModalOpen}
        onClose={() => setIsSaveTemplateModalOpen(false)}
        onSave={handleSaveTemplate}
        isLoading={createTemplateMutation.isPending}
      />
    </>
  );
};

export default MessageComposer;
