
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Trash2, Star, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMessageTemplates, useDeleteMessageTemplate, useSetDefaultTemplate, useSetConversionDefaultTemplate } from '@/hooks/useMessages';

interface MessageTemplatesProps {
  onLoadTemplate: (template: any) => void;
}

const MessageTemplates = ({ onLoadTemplate }: MessageTemplatesProps) => {
  const { toast } = useToast();
  const { data: templates = [] } = useMessageTemplates();
  const deleteTemplateMutation = useDeleteMessageTemplate();
  const setDefaultTemplateMutation = useSetDefaultTemplate();
  const setConversionDefaultTemplateMutation = useSetConversionDefaultTemplate();
  const [pendingDefaultId, setPendingDefaultId] = useState<string | null>(null);
  const [pendingConversionDefaultId, setPendingConversionDefaultId] = useState<string | null>(null);

  const handleLoadTemplate = (template: any) => {
    console.log('Carregando template:', template);
    onLoadTemplate(template);
    toast({
      title: "Template carregado",
      description: `Template "${template.name}" foi carregado na mensagem`,
    });
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteTemplateMutation.mutateAsync(templateId);
    } catch (error) {
      console.error('Erro ao excluir template:', error);
    }
  };

  const handleSetDefault = async (templateId: string, templateName: string) => {
    const currentDefault = templates.find((t: any) => t.is_default);
    
    if (currentDefault && currentDefault.id !== templateId) {
      const confirmed = window.confirm(
        `A mensagem "${templateName}" será padronizada para novos leads e a atual "${currentDefault.name}" será substituída. Deseja continuar?`
      );
      
      if (!confirmed) {
        return;
      }
    }

    try {
      setPendingDefaultId(templateId);
      await setDefaultTemplateMutation.mutateAsync(templateId);
      toast({
        title: "Template padrão definido",
        description: `Template "${templateName}" foi definido como padrão para novos leads`,
      });
    } catch (error) {
      console.error('Erro ao definir template padrão:', error);
    } finally {
      setPendingDefaultId(null);
    }
  };

  const handleSetConversionDefault = async (templateId: string, templateName: string) => {
    const currentConversionDefault = templates.find((t: any) => t.is_conversion_default);
    
    if (currentConversionDefault && currentConversionDefault.id !== templateId) {
      const confirmed = window.confirm(
        `A mensagem "${templateName}" será padronizada para conversões e a atual "${currentConversionDefault.name}" será substituída. Deseja continuar?`
      );
      
      if (!confirmed) {
        return;
      }
    }

    try {
      setPendingConversionDefaultId(templateId);
      await setConversionDefaultTemplateMutation.mutateAsync(templateId);
      toast({
        title: "Template de conversão definido",
        description: `Template "${templateName}" foi definido como padrão para conversões`,
      });
    } catch (error) {
      console.error('Erro ao definir template de conversão:', error);
    } finally {
      setPendingConversionDefaultId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Templates de Mensagem</CardTitle>
        <CardDescription>
          Gerencie seus templates de mensagem salvos e defina os templates padrão para novos leads e conversões
        </CardDescription>
      </CardHeader>
      <CardContent>
        {templates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum template salvo ainda</p>
            <p className="text-sm">Crie uma mensagem e clique em "Salvar como Template"</p>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template: any) => (
              <div key={template.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      {template.is_default && (
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          <Star className="h-3 w-3 mr-1" />
                          Novos Leads
                        </Badge>
                      )}
                      {template.is_conversion_default && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <Trophy className="h-3 w-3 mr-1" />
                          Conversões
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                      {template.content}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="secondary">{template.type}</Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(template.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`default-${template.id}`}
                          checked={template.is_default || false}
                          disabled={pendingDefaultId === template.id}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleSetDefault(template.id, template.name);
                            }
                          }}
                        />
                        <label
                          htmlFor={`default-${template.id}`}
                          className="text-xs text-gray-600 cursor-pointer"
                        >
                          Novos Leads
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`conversion-${template.id}`}
                          checked={template.is_conversion_default || false}
                          disabled={pendingConversionDefaultId === template.id}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleSetConversionDefault(template.id, template.name);
                            }
                          }}
                        />
                        <label
                          htmlFor={`conversion-${template.id}`}
                          className="text-xs text-gray-600 cursor-pointer"
                        >
                          Conversões
                        </label>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadTemplate(template)}
                    >
                      Usar Template
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MessageTemplates;
