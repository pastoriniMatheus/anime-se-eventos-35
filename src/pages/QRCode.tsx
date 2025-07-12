import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { QrCode, Download, Plus, Copy, Eye, Trash2, MessageCircle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQRCodes } from '@/hooks/useQRCodes';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { generateShortUrl, buildWhatsAppUrl, getCurrentDomain, buildQRRedirectUrl, buildFormUrl } from '@/utils/urlShortener';
import { generateTrackingId } from '@/utils/trackingId';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layout } from '@/components/Layout';

const QRCodePage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: qrCodes = [] } = useQRCodes();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newQRCode, setNewQRCode] = useState({
    eventName: '',
    whatsappNumber: '',
    type: 'whatsapp'
  });
  const [previewQR, setPreviewQR] = useState<any>(null);

  const generateQRCode = (whatsappNumber: string, eventName: string, trackingId: string, type: string) => {
    if (type === 'whatsapp') {
      const waLink = buildWhatsAppUrl(whatsappNumber, eventName, trackingId);
      console.log('WhatsApp URL gerada:', waLink);
      return { waLink };
    } else {
      const formUrl = buildFormUrl(eventName, trackingId);
      console.log('Form URL gerada:', formUrl);
      return { waLink: formUrl };
    }
  };

  const handleCreateQRCode = async () => {
    if (!newQRCode.eventName) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o nome do evento.",
        variant: "destructive",
      });
      return;
    }

    if (newQRCode.type === 'whatsapp' && !newQRCode.whatsappNumber) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o número do WhatsApp para QR Code WhatsApp.",
        variant: "destructive",
      });
      return;
    }

    if (newQRCode.type === 'whatsapp') {
      const whatsappRegex = /^[1-9]\d{1,14}$/;
      if (!whatsappRegex.test(newQRCode.whatsappNumber)) {
        toast({
          title: "Erro",
          description: "Número do WhatsApp inválido. Use apenas números (ex: 5582988898565).",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const eventData: any = {
        name: newQRCode.eventName
      };

      if (newQRCode.type === 'whatsapp') {
        eventData.whatsapp_number = newQRCode.whatsappNumber;
      }

      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();

      if (eventError) throw eventError;

      const trackingId = generateTrackingId();
      const { waLink } = generateQRCode(newQRCode.whatsappNumber, newQRCode.eventName, trackingId, newQRCode.type);
      
      const shortUrl = generateShortUrl();

      console.log('Dados do QR Code:', {
        type: newQRCode.type,
        shortUrl,
        originalUrl: waLink,
        trackingId
      });

      const qrCodeData: any = {
        event_id: event.id,
        short_url: shortUrl,
        full_url: waLink,
        original_url: waLink,
        tracking_id: trackingId,
        type: newQRCode.type,
        scans: 0
      };

      const { error: qrError } = await supabase
        .from('qr_codes')
        .insert([qrCodeData]);

      if (qrError) throw qrError;

      queryClient.invalidateQueries({ queryKey: ['qr_codes'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['conversion_metrics'] });
      queryClient.invalidateQueries({ queryKey: ['scan_sessions'] });
      
      setNewQRCode({ eventName: '', whatsappNumber: '', type: 'whatsapp' });
      setIsCreateDialogOpen(false);

      toast({
        title: "QR Code criado",
        description: `QR Code ${newQRCode.type === 'whatsapp' ? 'WhatsApp' : 'Formulário'} para o evento "${newQRCode.eventName}" foi criado com sucesso!`,
      });
    } catch (error: any) {
      console.error('Erro ao criar QR Code:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar QR Code",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQRCode = async (qrCodeId: string) => {
    try {
      console.log('Iniciando exclusão do QR Code:', qrCodeId);
      
      const { data: qrCodeData, error: fetchError } = await supabase
        .from('qr_codes')
        .select('event_id, short_url')
        .eq('id', qrCodeId)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar QR Code:', fetchError);
        throw fetchError;
      }

      console.log('QR Code encontrado:', qrCodeData);

      const { error: scanSessionsError } = await supabase
        .from('scan_sessions')
        .delete()
        .eq('qr_code_id', qrCodeId);

      if (scanSessionsError) {
        console.error('Erro ao deletar sessões de scan:', scanSessionsError);
      }

      if (qrCodeData.event_id) {
        console.log('Deletando leads do evento:', qrCodeData.event_id);
        const { error: leadsError } = await supabase
          .from('leads')
          .delete()
          .eq('event_id', qrCodeData.event_id);

        if (leadsError) {
          console.error('Erro ao deletar leads:', leadsError);
        }

        const { error: eventScanSessionsError } = await supabase
          .from('scan_sessions')
          .delete()
          .eq('event_id', qrCodeData.event_id);

        if (eventScanSessionsError) {
          console.error('Erro ao deletar sessões de scan do evento:', eventScanSessionsError);
        }
      }

      console.log('Deletando QR Code...');
      const { error: qrError } = await supabase
        .from('qr_codes')
        .delete()
        .eq('id', qrCodeId);

      if (qrError) {
        console.error('Erro ao deletar QR Code:', qrError);
        throw qrError;
      }

      if (qrCodeData.event_id) {
        console.log('Deletando evento:', qrCodeData.event_id);
        const { error: eventError } = await supabase
          .from('events')
          .delete()
          .eq('id', qrCodeData.event_id);

        if (eventError) {
          console.error('Erro ao deletar evento:', eventError);
          throw eventError;
        }
      }

      queryClient.invalidateQueries({ queryKey: ['qr_codes'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['scan_sessions'] });

      toast({
        title: "QR Code e evento removidos",
        description: "QR Code, evento e todos os dados relacionados foram removidos com sucesso!",
      });
    } catch (error: any) {
      console.error('Erro completo na exclusão:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover QR Code e evento",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copiado!",
        description: `${type} copiado para a área de transferência.`,
      });
    });
  };

  const downloadQRCode = (qrCode: any) => {
    let qrUrl;
    
    if (qrCode.type === 'whatsapp') {
      qrUrl = buildQRRedirectUrl(qrCode.short_url);
    } else {
      qrUrl = qrCode.original_url;
    }
    
    console.log('URL do QR Code para download:', qrUrl);
    
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrUrl)}`;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qrcode-${qrCode.type}-${qrCode.event?.name?.replace(/\s+/g, '-').toLowerCase() || 'qrcode'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download iniciado",
      description: "QR Code sendo baixado...",
    });
  };

  const getPreviewMessage = (qrCode: any) => {
    if (!qrCode?.event?.name || !qrCode?.tracking_id) return '';
    return `${qrCode.event.name} id:${qrCode.tracking_id}`;
  };

  const getQRCodeDisplayUrl = (qrCode: any) => {
    if (qrCode.type === 'whatsapp') {
      return buildQRRedirectUrl(qrCode.short_url);
    } else {
      return qrCode.original_url;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <QrCode className="h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold">Gerador de QR Code</h1>
                <p className="text-primary-foreground/80">
                  Crie e gerencie QR codes para seus eventos
                </p>
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Novo QR Code</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Criar Novo QR Code</DialogTitle>
                  <DialogDescription>
                    Escolha o tipo de QR Code que deseja gerar
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Tipo de QR Code*</Label>
                    <Select value={newQRCode.type} onValueChange={(value) => setNewQRCode({...newQRCode, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp">
                          <div className="flex items-center space-x-2">
                            <MessageCircle className="h-4 w-4" />
                            <span>WhatsApp</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="form">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span>Formulário</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {newQRCode.type === 'whatsapp' 
                        ? 'Direciona para uma conversa do WhatsApp com texto pré-definido'
                        : 'Direciona para o formulário de captura de leads'
                      }
                    </p>
                  </div>

                  {newQRCode.type === 'whatsapp' && (
                    <div className="grid gap-2">
                      <Label htmlFor="whatsapp">Número do WhatsApp*</Label>
                      <Input
                        id="whatsapp"
                        value={newQRCode.whatsappNumber}
                        onChange={(e) => setNewQRCode({...newQRCode, whatsappNumber: e.target.value})}
                        placeholder="5582988898565"
                      />
                      <p className="text-xs text-muted-foreground">
                        Formato: código do país + DDD + número (sem espaços ou símbolos)
                      </p>
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="event">Nome do Evento/Palavra-chave*</Label>
                    <Input
                      id="event"
                      value={newQRCode.eventName}
                      onChange={(e) => setNewQRCode({...newQRCode, eventName: e.target.value})}
                      placeholder="Feira Estudante 23"
                    />
                    <p className="text-xs text-muted-foreground">
                      {newQRCode.type === 'whatsapp' 
                        ? 'Este texto aparecerá automaticamente na conversa do WhatsApp com um ID de rastreamento'
                        : 'Nome do evento que aparecerá no formulário'
                      }
                    </p>
                  </div>

                  {newQRCode.eventName && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <Label>Preview {newQRCode.type === 'whatsapp' ? 'da Mensagem' : 'da URL'}:</Label>
                      <p className="text-sm font-mono mt-1 break-all">
                        {newQRCode.type === 'whatsapp' 
                          ? `${newQRCode.eventName} id:XXXXXX`
                          : `${window.location.origin}/form?event=${encodeURIComponent(newQRCode.eventName)}&tracking=XXXXXX`
                        }
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        O ID real será gerado automaticamente (6 caracteres)
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateQRCode}>
                    Criar QR Code
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* QR Codes Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center space-x-2">
              <QrCode className="h-5 w-5" />
              <span>QR Codes Gerados</span>
            </CardTitle>
            <CardDescription>
              Gerencie todos os QR Codes criados para seus eventos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Tracking ID</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>QR Code</TableHead>
                  <TableHead>Link/URL</TableHead>
                  <TableHead>Scans</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qrCodes.map((qrCode: any) => {
                  const displayUrl = getQRCodeDisplayUrl(qrCode);
                  const qrType = qrCode.type || 'whatsapp';
                  const scanCount = typeof qrCode.scans === 'number' ? qrCode.scans : 0;
                  
                  console.log(`🔍 QR Code ${qrCode.short_url}: scans = ${scanCount} (tipo: ${typeof qrCode.scans})`);
                  
                  return (
                    <TableRow key={qrCode.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {qrType === 'whatsapp' ? (
                            <>
                              <MessageCircle className="h-4 w-4 text-green-600" />
                              <Badge variant="secondary" className="bg-green-100 text-green-800">WhatsApp</Badge>
                            </>
                          ) : (
                            <>
                              <FileText className="h-4 w-4 text-blue-600" />
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">Formulário</Badge>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{qrCode.event?.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            {qrCode.tracking_id || 'N/A'}
                          </code>
                          {qrCode.tracking_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(qrCode.tracking_id, 'Tracking ID')}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {qrType === 'whatsapp' ? qrCode.event?.whatsapp_number : 'Formulário'}
                      </TableCell>
                      <TableCell>
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${encodeURIComponent(displayUrl)}`}
                          alt={`QR Code ${qrCode.event?.name}`}
                          className="w-16 h-16 border rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded max-w-32 truncate">
                            {qrType === 'whatsapp' ? `/qr-redirect/${qrCode.short_url}` : displayUrl}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(displayUrl, qrType === 'whatsapp' ? 'Link encurtado' : 'URL do formulário')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={scanCount > 0 ? "default" : "secondary"}
                          className={scanCount > 0 ? "bg-primary text-primary-foreground" : ""}
                        >
                          {scanCount}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(qrCode.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewQR(qrCode)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadQRCode(qrCode)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza de que deseja excluir este QR Code e o evento associado "{qrCode.event?.name}"? 
                                  Esta ação não pode ser desfeita e todos os dados relacionados (leads, sessões de scan, etc.) serão perdidos permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteQRCode(qrCode.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir Tudo
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {qrCodes.length === 0 && (
              <div className="text-center py-8">
                <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum QR Code criado ainda. Clique em "Novo QR Code" para começar.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview Dialog */}
        <Dialog open={!!previewQR} onOpenChange={() => setPreviewQR(null)}>
          <DialogContent className="sm:max-w-[400px] max-h-[80vh] overflow-y-auto">
            <DialogHeader className="pb-3">
              <DialogTitle className="flex items-center space-x-2 text-lg">
                {(previewQR?.type || 'whatsapp') === 'whatsapp' ? (
                  <MessageCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <FileText className="h-4 w-4 text-blue-600" />
                )}
                <span className="truncate">{previewQR?.event?.name}</span>
              </DialogTitle>
            </DialogHeader>
            {previewQR && (
              <div className="space-y-3">
                <div className="flex justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(getQRCodeDisplayUrl(previewQR))}`}
                    alt={`QR Code ${previewQR.event?.name}`}
                    className="w-40 h-40 border rounded shadow-sm"
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-medium text-muted-foreground">Tipo</Label>
                    {(previewQR.type || 'whatsapp') === 'whatsapp' ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        WhatsApp
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        Formulário
                      </Badge>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Tracking ID</Label>
                    <div className="flex items-center space-x-1 mt-1">
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1 font-mono">
                        {previewQR.tracking_id || 'N/A'}
                      </code>
                      {previewQR.tracking_id && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(previewQR.tracking_id, 'Tracking ID')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {(previewQR.type || 'whatsapp') === 'whatsapp' && (
                    <>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">WhatsApp</Label>
                        <p className="text-xs font-mono mt-1">{previewQR.event?.whatsapp_number}</p>
                      </div>
                      
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Mensagem Preview</Label>
                        <div className="flex items-center space-x-1 mt-1">
                          <code className="text-xs bg-muted px-2 py-1 rounded flex-1 font-mono">
                            {getPreviewMessage(previewQR)}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(getPreviewMessage(previewQR), 'Mensagem')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Scans</Label>
                      <p className="text-sm font-medium text-primary">
                        {typeof previewQR.scans === 'number' ? previewQR.scans : 0}
                      </p>
                    </div>
                    <div className="text-right">
                      <Label className="text-xs font-medium text-muted-foreground">Criado em</Label>
                      <p className="text-xs">
                        {new Date(previewQR.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      {(previewQR.type || 'whatsapp') === 'whatsapp' ? 'Link Encurtado' : 'URL'}
                    </Label>
                    <div className="flex items-center space-x-1 mt-1">
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1 font-mono truncate">
                        {getQRCodeDisplayUrl(previewQR)}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(getQRCodeDisplayUrl(previewQR), (previewQR.type || 'whatsapp') === 'whatsapp' ? 'Link encurtado' : 'URL do formulário')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button
                    onClick={() => downloadQRCode(previewQR)}
                    className="flex-1 h-8"
                    size="sm"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Baixar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(getQRCodeDisplayUrl(previewQR), (previewQR.type || 'whatsapp') === 'whatsapp' ? 'Link encurtado' : 'URL do formulário')}
                    className="flex-1 h-8"
                    size="sm"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default QRCodePage;
