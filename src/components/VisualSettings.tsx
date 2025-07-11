
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Eye, Save, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSystemSettings, useUpdateSystemSetting } from '@/hooks/useSystemSettings';

const VisualSettings = () => {
  const { toast } = useToast();
  const { data: settings = [] } = useSystemSettings();
  const updateSetting = useUpdateSystemSetting();
  
  const [visualConfig, setVisualConfig] = useState({
    title: 'Sistema de Captura de Leads',
    subtitle: 'Gestão Inteligente de Leads',
    description: 'Sistema completo para captura e gestão de leads',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#f59e0b',
    accentColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    menuActiveColor: '#1e40af',
    buttonColor: '#3b82f6',
    buttonHoverColor: '#2563eb'
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
        case 'visual_background_color':
          setVisualConfig(prev => ({ ...prev, backgroundColor: value }));
          break;
        case 'visual_text_color':
          setVisualConfig(prev => ({ ...prev, textColor: value }));
          break;
        case 'visual_menu_active_color':
          setVisualConfig(prev => ({ ...prev, menuActiveColor: value }));
          break;
        case 'visual_button_color':
          setVisualConfig(prev => ({ ...prev, buttonColor: value }));
          break;
        case 'visual_button_hover_color':
          setVisualConfig(prev => ({ ...prev, buttonHoverColor: value }));
          break;
      }
    });
  }, [settings]);

  const handleSave = async () => {
    try {
      const settingsToSave = [
        { key: 'visual_title', value: visualConfig.title },
        { key: 'visual_subtitle', value: visualConfig.subtitle },
        { key: 'visual_description', value: visualConfig.description },
        { key: 'visual_logo_url', value: visualConfig.logoUrl },
        { key: 'visual_favicon_url', value: visualConfig.faviconUrl },
        { key: 'visual_primary_color', value: visualConfig.primaryColor },
        { key: 'visual_secondary_color', value: visualConfig.secondaryColor },
        { key: 'visual_accent_color', value: visualConfig.accentColor },
        { key: 'visual_background_color', value: visualConfig.backgroundColor },
        { key: 'visual_text_color', value: visualConfig.textColor },
        { key: 'visual_menu_active_color', value: visualConfig.menuActiveColor },
        { key: 'visual_button_color', value: visualConfig.buttonColor },
        { key: 'visual_button_hover_color', value: visualConfig.buttonHoverColor }
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Eye className="h-5 w-5" />
          <span>Configurações Visuais</span>
        </CardTitle>
        <CardDescription>
          Personalize a aparência e identidade visual do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Identidade Visual</h3>
          
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="logo-upload">Logotipo</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Fazer Upload do Logo
                </Button>
              </div>
              {visualConfig.logoUrl && (
                <img src={visualConfig.logoUrl} alt="Logo" className="h-16 w-auto object-contain border rounded" />
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="favicon-upload">Favicon</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="favicon-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFaviconUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('favicon-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Fazer Upload do Favicon
                </Button>
              </div>
              {visualConfig.faviconUrl && (
                <img src={visualConfig.faviconUrl} alt="Favicon" className="h-8 w-8 object-contain border rounded" />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Cores do Sistema</h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Cor Primária</Label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: visualConfig.primaryColor }}
                />
                <Input
                  id="primary-color"
                  type="color"
                  value={visualConfig.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="secondary-color">Cor Secundária</Label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: visualConfig.secondaryColor }}
                />
                <Input
                  id="secondary-color"
                  type="color"
                  value={visualConfig.secondaryColor}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accent-color">Cor de Destaque</Label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: visualConfig.accentColor }}
                />
                <Input
                  id="accent-color"
                  type="color"
                  value={visualConfig.accentColor}
                  onChange={(e) => handleChange('accentColor', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="menu-active-color">Cor do Menu Ativo</Label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: visualConfig.menuActiveColor }}
                />
                <Input
                  id="menu-active-color"
                  type="color"
                  value={visualConfig.menuActiveColor}
                  onChange={(e) => handleChange('menuActiveColor', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="button-color">Cor dos Botões</Label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: visualConfig.buttonColor }}
                />
                <Input
                  id="button-color"
                  type="color"
                  value={visualConfig.buttonColor}
                  onChange={(e) => handleChange('buttonColor', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="button-hover-color">Cor dos Botões (Hover)</Label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: visualConfig.buttonHoverColor }}
                />
                <Input
                  id="button-hover-color"
                  type="color"
                  value={visualConfig.buttonHoverColor}
                  onChange={(e) => handleChange('buttonHoverColor', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bg-color">Cor de Fundo</Label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: visualConfig.backgroundColor }}
                />
                <Input
                  id="bg-color"
                  type="color"
                  value={visualConfig.backgroundColor}
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="text-color">Cor do Texto</Label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: visualConfig.textColor }}
                />
                <Input
                  id="text-color"
                  type="color"
                  value={visualConfig.textColor}
                  onChange={(e) => handleChange('textColor', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações Visuais
        </Button>
      </CardContent>
    </Card>
  );
};

export default VisualSettings;
