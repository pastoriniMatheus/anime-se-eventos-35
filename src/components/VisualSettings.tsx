
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Eye, Save, Upload, Palette, Layout, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSystemSettings, useUpdateSystemSetting } from '@/hooks/useSystemSettings';

const VisualSettings = () => {
  const { toast } = useToast();
  const { data: settings = [] } = useSystemSettings();
  const updateSetting = useUpdateSystemSetting();
  
  const [visualConfig, setVisualConfig] = useState({
    // Identidade Visual
    title: 'Sistema de Captura de Leads',
    subtitle: 'Gestão Inteligente de Leads',
    description: 'Sistema completo para captura e gestão de leads',
    logoUrl: '',
    faviconUrl: '',
    
    // Cores do Sistema
    primaryColor: '#3b82f6',        // Cor principal (botões principais, links)
    secondaryColor: '#f59e0b',      // Cor secundária (botões secundários)
    accentColor: '#10b981',         // Cor de destaque (badges, notificações)
    successColor: '#22c55e',        // Cor de sucesso
    warningColor: '#f59e0b',        // Cor de aviso
    dangerColor: '#ef4444',         // Cor de perigo
    
    // Cores do Layout
    backgroundColor: '#ffffff',      // Fundo geral da aplicação
    surfaceColor: '#f8fafc',        // Fundo de cards e containers
    borderColor: '#e2e8f0',         // Bordas e divisórias
    
    // Cores do Texto
    textPrimary: '#1e293b',         // Texto principal
    textSecondary: '#64748b',       // Texto secundário
    textMuted: '#94a3b8',           // Texto menos importante
    
    // Cores do Menu/Navegação
    menuBackground: '#ffffff',       // Fundo do menu
    menuActive: '#3b82f6',          // Item de menu ativo
    menuHover: '#f1f5f9',           // Hover no menu
    
    // Gradientes do Dashboard
    gradientStart: '#6366f1',       // Início do gradiente
    gradientEnd: '#8b5cf6',         // Fim do gradiente
    gradientSecondStart: '#ec4899', // Segundo gradiente início
    gradientSecondEnd: '#f97316',   // Segundo gradiente fim
  });

  useEffect(() => {
    // Carregar configurações do banco
    settings.forEach(setting => {
      const key = setting.key;
      const value = typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value);
      
      switch (key) {
        case 'visual_title':
          setVisualConfig(prev => ({ ...prev, title: value }));
          break;
        case 'visual_subtitle':
          setVisualConfig(prev => ({ ...prev, subtitle: value }));
          break;
        case 'visual_description':
          setVisualConfig(prev => ({ ...prev, description: value }));
          break;
        case 'visual_logo_url':
          setVisualConfig(prev => ({ ...prev, logoUrl: value }));
          break;
        case 'visual_favicon_url':
          setVisualConfig(prev => ({ ...prev, faviconUrl: value }));
          break;
        case 'visual_primary_color':
          setVisualConfig(prev => ({ ...prev, primaryColor: value }));
          break;
        case 'visual_secondary_color':
          setVisualConfig(prev => ({ ...prev, secondaryColor: value }));
          break;
        case 'visual_accent_color':
          setVisualConfig(prev => ({ ...prev, accentColor: value }));
          break;
        case 'visual_success_color':
          setVisualConfig(prev => ({ ...prev, successColor: value }));
          break;
        case 'visual_warning_color':
          setVisualConfig(prev => ({ ...prev, warningColor: value }));
          break;
        case 'visual_danger_color':
          setVisualConfig(prev => ({ ...prev, dangerColor: value }));
          break;
        case 'visual_background_color':
          setVisualConfig(prev => ({ ...prev, backgroundColor: value }));
          break;
        case 'visual_surface_color':
          setVisualConfig(prev => ({ ...prev, surfaceColor: value }));
          break;
        case 'visual_border_color':
          setVisualConfig(prev => ({ ...prev, borderColor: value }));
          break;
        case 'visual_text_primary':
          setVisualConfig(prev => ({ ...prev, textPrimary: value }));
          break;
        case 'visual_text_secondary':
          setVisualConfig(prev => ({ ...prev, textSecondary: value }));
          break;
        case 'visual_text_muted':
          setVisualConfig(prev => ({ ...prev, textMuted: value }));
          break;
        case 'visual_menu_background':
          setVisualConfig(prev => ({ ...prev, menuBackground: value }));
          break;
        case 'visual_menu_active':
          setVisualConfig(prev => ({ ...prev, menuActive: value }));
          break;
        case 'visual_menu_hover':
          setVisualConfig(prev => ({ ...prev, menuHover: value }));
          break;
        case 'visual_gradient_start':
          setVisualConfig(prev => ({ ...prev, gradientStart: value }));
          break;
        case 'visual_gradient_end':
          setVisualConfig(prev => ({ ...prev, gradientEnd: value }));
          break;
        case 'visual_gradient_second_start':
          setVisualConfig(prev => ({ ...prev, gradientSecondStart: value }));
          break;
        case 'visual_gradient_second_end':
          setVisualConfig(prev => ({ ...prev, gradientSecondEnd: value }));
          break;
      }
    });
  }, [settings]);

  const handleSave = async () => {
    try {
      const settingsToSave = [
        // Identidade Visual
        { key: 'visual_title', value: visualConfig.title },
        { key: 'visual_subtitle', value: visualConfig.subtitle },
        { key: 'visual_description', value: visualConfig.description },
        { key: 'visual_logo_url', value: visualConfig.logoUrl },
        { key: 'visual_favicon_url', value: visualConfig.faviconUrl },
        
        // Cores do Sistema
        { key: 'visual_primary_color', value: visualConfig.primaryColor },
        { key: 'visual_secondary_color', value: visualConfig.secondaryColor },
        { key: 'visual_accent_color', value: visualConfig.accentColor },
        { key: 'visual_success_color', value: visualConfig.successColor },
        { key: 'visual_warning_color', value: visualConfig.warningColor },
        { key: 'visual_danger_color', value: visualConfig.dangerColor },
        
        // Cores do Layout
        { key: 'visual_background_color', value: visualConfig.backgroundColor },
        { key: 'visual_surface_color', value: visualConfig.surfaceColor },
        { key: 'visual_border_color', value: visualConfig.borderColor },
        
        // Cores do Texto
        { key: 'visual_text_primary', value: visualConfig.textPrimary },
        { key: 'visual_text_secondary', value: visualConfig.textSecondary },
        { key: 'visual_text_muted', value: visualConfig.textMuted },
        
        // Cores do Menu
        { key: 'visual_menu_background', value: visualConfig.menuBackground },
        { key: 'visual_menu_active', value: visualConfig.menuActive },
        { key: 'visual_menu_hover', value: visualConfig.menuHover },
        
        // Gradientes
        { key: 'visual_gradient_start', value: visualConfig.gradientStart },
        { key: 'visual_gradient_end', value: visualConfig.gradientEnd },
        { key: 'visual_gradient_second_start', value: visualConfig.gradientSecondStart },
        { key: 'visual_gradient_second_end', value: visualConfig.gradientSecondEnd },
      ];

      for (const setting of settingsToSave) {
        await updateSetting.mutateAsync(setting);
      }

      toast({
        title: "Configurações visuais salvas",
        description: "As configurações visuais foram atualizadas com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Erro ao salvar as configurações visuais",
        variant: "destructive",
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setVisualConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleChange('logoUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleChange('faviconUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const ColorPicker = ({ label, value, onChange, description }: { 
    label: string; 
    value: string; 
    onChange: (value: string) => void;
    description?: string;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <div className="flex items-center space-x-3">
        <div 
          className="w-12 h-12 rounded-lg border-2 border-border shadow-sm"
          style={{ backgroundColor: value }}
        />
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 h-12 p-1 cursor-pointer"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono text-sm"
          placeholder="#000000"
        />
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Eye className="h-5 w-5" />
          <span>Personalização Visual</span>
        </CardTitle>
        <CardDescription>
          Personalize completamente a aparência e identidade visual do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="identity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="identity" className="flex items-center space-x-2">
              <Layout className="h-4 w-4" />
              <span>Identidade</span>
            </TabsTrigger>
            <TabsTrigger value="colors" className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span>Cores</span>
            </TabsTrigger>
            <TabsTrigger value="gradients" className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>Gradientes</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Prévia</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="identity" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações da Aplicação</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título Principal</Label>
                  <Input
                    id="title"
                    value={visualConfig.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Título da aplicação"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtítulo</Label>
                  <Input
                    id="subtitle"
                    value={visualConfig.subtitle}
                    onChange={(e) => handleChange('subtitle', e.target.value)}
                    placeholder="Subtítulo da aplicação"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={visualConfig.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Descrição da aplicação"
                  rows={3}
                />
              </div>

              <Separator />

              <h3 className="text-lg font-semibold">Logotipos</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Logotipo Principal</Label>
                  <div className="space-y-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Fazer Upload do Logo
                    </Button>
                    {visualConfig.logoUrl && (
                      <div className="border rounded-lg p-4 bg-muted/50">
                        <img 
                          src={visualConfig.logoUrl} 
                          alt="Logo" 
                          className="h-16 w-auto object-contain mx-auto" 
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label>Favicon</Label>
                  <div className="space-y-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFaviconUpload}
                      className="hidden"
                      id="favicon-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('favicon-upload')?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Fazer Upload do Favicon
                    </Button>
                    {visualConfig.faviconUrl && (
                      <div className="border rounded-lg p-4 bg-muted/50">
                        <img 
                          src={visualConfig.faviconUrl} 
                          alt="Favicon" 
                          className="h-8 w-8 object-contain mx-auto" 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="colors" className="space-y-6">
            <div className="grid gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cores Principais do Sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ColorPicker
                    label="Cor Primária"
                    value={visualConfig.primaryColor}
                    onChange={(value) => handleChange('primaryColor', value)}
                    description="Botões principais, links ativos, elementos em destaque"
                  />
                  <ColorPicker
                    label="Cor Secundária"
                    value={visualConfig.secondaryColor}
                    onChange={(value) => handleChange('secondaryColor', value)}
                    description="Botões secundários, elementos de apoio"
                  />
                  <ColorPicker
                    label="Cor de Destaque"
                    value={visualConfig.accentColor}
                    onChange={(value) => handleChange('accentColor', value)}
                    description="Badges, notificações, elementos de atenção"
                  />
                  <ColorPicker
                    label="Cor de Sucesso"
                    value={visualConfig.successColor}
                    onChange={(value) => handleChange('successColor', value)}
                    description="Mensagens de sucesso, confirmações"
                  />
                  <ColorPicker
                    label="Cor de Aviso"
                    value={visualConfig.warningColor}
                    onChange={(value) => handleChange('warningColor', value)}
                    description="Alertas, avisos importantes"
                  />
                  <ColorPicker
                    label="Cor de Perigo"
                    value={visualConfig.dangerColor}
                    onChange={(value) => handleChange('dangerColor', value)}
                    description="Erros, ações destrutivas"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cores do Layout</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ColorPicker
                    label="Fundo Principal"
                    value={visualConfig.backgroundColor}
                    onChange={(value) => handleChange('backgroundColor', value)}
                    description="Fundo geral da aplicação"
                  />
                  <ColorPicker
                    label="Fundo de Superfície"
                    value={visualConfig.surfaceColor}
                    onChange={(value) => handleChange('surfaceColor', value)}
                    description="Fundo de cards, modais, containers"
                  />
                  <ColorPicker
                    label="Cor das Bordas"
                    value={visualConfig.borderColor}
                    onChange={(value) => handleChange('borderColor', value)}
                    description="Bordas de elementos, divisórias"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cores do Texto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ColorPicker
                    label="Texto Principal"
                    value={visualConfig.textPrimary}
                    onChange={(value) => handleChange('textPrimary', value)}
                    description="Títulos, textos importantes"
                  />
                  <ColorPicker
                    label="Texto Secundário"
                    value={visualConfig.textSecondary}
                    onChange={(value) => handleChange('textSecondary', value)}
                    description="Textos de apoio, descrições"
                  />
                  <ColorPicker
                    label="Texto Suave"
                    value={visualConfig.textMuted}
                    onChange={(value) => handleChange('textMuted', value)}
                    description="Textos menos importantes, placeholders"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cores da Navegação</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ColorPicker
                    label="Fundo do Menu"
                    value={visualConfig.menuBackground}
                    onChange={(value) => handleChange('menuBackground', value)}
                    description="Fundo da barra de navegação"
                  />
                  <ColorPicker
                    label="Item Ativo do Menu"
                    value={visualConfig.menuActive}
                    onChange={(value) => handleChange('menuActive', value)}
                    description="Cor do item de menu selecionado/ativo"
                  />
                  <ColorPicker
                    label="Hover do Menu"
                    value={visualConfig.menuHover}
                    onChange={(value) => handleChange('menuHover', value)}
                    description="Fundo ao passar mouse nos itens do menu"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gradients" className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Gradientes do Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  Configure os gradientes utilizados nos cards e elementos visuais do dashboard
                </p>
                
                <div className="grid gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Gradiente Principal</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <ColorPicker
                        label="Cor Inicial"
                        value={visualConfig.gradientStart}
                        onChange={(value) => handleChange('gradientStart', value)}
                        description="Primeira cor do gradiente"
                      />
                      <ColorPicker
                        label="Cor Final"
                        value={visualConfig.gradientEnd}
                        onChange={(value) => handleChange('gradientEnd', value)}
                        description="Última cor do gradiente"
                      />
                    </div>
                    <div 
                      className="h-16 rounded-lg border"
                      style={{ 
                        background: `linear-gradient(135deg, ${visualConfig.gradientStart}, ${visualConfig.gradientEnd})` 
                      }}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Gradiente Secundário</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <ColorPicker
                        label="Cor Inicial"
                        value={visualConfig.gradientSecondStart}
                        onChange={(value) => handleChange('gradientSecondStart', value)}
                        description="Primeira cor do segundo gradiente"
                      />
                      <ColorPicker
                        label="Cor Final"
                        value={visualConfig.gradientSecondEnd}
                        onChange={(value) => handleChange('gradientSecondEnd', value)}
                        description="Última cor do segundo gradiente"
                      />
                    </div>
                    <div 
                      className="h-16 rounded-lg border"
                      style={{ 
                        background: `linear-gradient(135deg, ${visualConfig.gradientSecondStart}, ${visualConfig.gradientSecondEnd})` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Prévia das Configurações</h3>
              <p className="text-sm text-muted-foreground">
                Visualize como as cores se aplicam aos diferentes elementos da interface
              </p>
              
              <div className="grid gap-4 p-6 border rounded-lg" style={{ backgroundColor: visualConfig.backgroundColor }}>
                <div className="space-y-2">
                  <h4 style={{ color: visualConfig.textPrimary }} className="text-lg font-semibold">
                    {visualConfig.title}
                  </h4>
                  <p style={{ color: visualConfig.textSecondary }} className="text-sm">
                    {visualConfig.subtitle}
                  </p>
                  <p style={{ color: visualConfig.textMuted }} className="text-xs">
                    {visualConfig.description}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    className="px-4 py-2 rounded text-white text-sm font-medium"
                    style={{ backgroundColor: visualConfig.primaryColor }}
                  >
                    Botão Primário
                  </button>
                  <button 
                    className="px-4 py-2 rounded text-white text-sm font-medium"
                    style={{ backgroundColor: visualConfig.secondaryColor }}
                  >
                    Botão Secundário
                  </button>
                  <span 
                    className="px-2 py-1 rounded text-white text-xs"
                    style={{ backgroundColor: visualConfig.accentColor }}
                  >
                    Badge
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className="h-20 rounded-lg flex items-center justify-center text-white font-medium"
                    style={{ 
                      background: `linear-gradient(135deg, ${visualConfig.gradientStart}, ${visualConfig.gradientEnd})` 
                    }}
                  >
                    Gradiente Principal
                  </div>
                  <div 
                    className="h-20 rounded-lg flex items-center justify-center text-white font-medium"
                    style={{ 
                      background: `linear-gradient(135deg, ${visualConfig.gradientSecondStart}, ${visualConfig.gradientSecondEnd})` 
                    }}
                  >
                    Gradiente Secundário
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-6">
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Salvar Todas as Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisualSettings;
