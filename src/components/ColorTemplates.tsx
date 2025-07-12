
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Check } from 'lucide-react';
import { useUpdateSystemSetting } from '@/hooks/useSystemSettings';
import { useToast } from '@/hooks/use-toast';

interface ColorTemplate {
  id: string;
  name: string;
  description: string;
  preview: string[];
  colors: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    successColor: string;
    warningColor: string;
    dangerColor: string;
    backgroundColor: string;
    surfaceColor: string;
    borderColor: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    menuBackground: string;
    menuActive: string;
    menuHover: string;
    gradientStart: string;
    gradientEnd: string;
    gradientSecondStart: string;
    gradientSecondEnd: string;
  };
}

const colorTemplates: ColorTemplate[] = [
  {
    id: 'pink-gradient',
    name: 'Pink Gradient (Logo 1)',
    description: 'Baseado no primeiro logotipo com tons vibrantes de rosa e magenta',
    preview: ['#ec4899', '#be185d', '#fdf2f8', '#e11d48'],
    colors: {
      primaryColor: '#ec4899',
      secondaryColor: '#be185d',
      accentColor: '#f472b6',
      successColor: '#10b981',
      warningColor: '#f59e0b',
      dangerColor: '#ef4444',
      backgroundColor: '#ffffff',
      surfaceColor: '#fefefe',
      borderColor: '#f3e8ff',
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      textMuted: '#9ca3af',
      menuBackground: '#fdf2f8',
      menuActive: '#ec4899',
      menuHover: '#f9a8d4',
      gradientStart: '#ec4899',
      gradientEnd: '#be185d',
      gradientSecondStart: '#f472b6',
      gradientSecondEnd: '#a21caf',
    }
  },
  {
    id: 'blue-corporate',
    name: 'Azul Corporativo (Logo 2)',
    description: 'Inspirado no segundo logotipo com tons profissionais de azul',
    preview: ['#3b82f6', '#1e40af', '#f8fafc', '#0ea5e9'],
    colors: {
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af',
      accentColor: '#0ea5e9',
      successColor: '#10b981',
      warningColor: '#f59e0b',
      dangerColor: '#ef4444',
      backgroundColor: '#ffffff',
      surfaceColor: '#fefefe',
      borderColor: '#e2e8f0',
      textPrimary: '#1e293b',
      textSecondary: '#64748b',
      textMuted: '#94a3b8',
      menuBackground: '#f8fafc',
      menuActive: '#3b82f6',
      menuHover: '#dbeafe',
      gradientStart: '#3b82f6',
      gradientEnd: '#1e40af',
      gradientSecondStart: '#0ea5e9',
      gradientSecondEnd: '#0284c7',
    }
  },
  {
    id: 'clean-minimal',
    name: 'Clean & Minimal',
    description: 'Design limpo e minimalista com tons neutros e contrastes perfeitos',
    preview: ['#334155', '#64748b', '#f8fafc', '#10b981'],
    colors: {
      primaryColor: '#334155',
      secondaryColor: '#64748b',
      accentColor: '#10b981',
      successColor: '#059669',
      warningColor: '#d97706',
      dangerColor: '#dc2626',
      backgroundColor: '#ffffff',
      surfaceColor: '#f9fafb',
      borderColor: '#e2e8f0',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      textMuted: '#94a3b8',
      menuBackground: '#f1f5f9',
      menuActive: '#334155',
      menuHover: '#e2e8f0',
      gradientStart: '#334155',
      gradientEnd: '#64748b',
      gradientSecondStart: '#10b981',
      gradientSecondEnd: '#059669',
    }
  },
  {
    id: 'sophisticated-purple',
    name: 'Roxo Sofisticado',
    description: 'Elegante e profissional com tons harmoniosos de roxo e violeta',
    preview: ['#7c3aed', '#5b21b6', '#faf5ff', '#a855f7'],
    colors: {
      primaryColor: '#7c3aed',
      secondaryColor: '#5b21b6',
      accentColor: '#a855f7',
      successColor: '#10b981',
      warningColor: '#f59e0b',
      dangerColor: '#ef4444',
      backgroundColor: '#ffffff',
      surfaceColor: '#fefefe',
      borderColor: '#e9d5ff',
      textPrimary: '#1f2937',
      textSecondary: '#4b5563',
      textMuted: '#6b7280',
      menuBackground: '#faf5ff',
      menuActive: '#7c3aed',
      menuHover: '#ddd6fe',
      gradientStart: '#7c3aed',
      gradientEnd: '#5b21b6',
      gradientSecondStart: '#a855f7',
      gradientSecondEnd: '#7c3aed',
    }
  },
  {
    id: 'dark-elegant',
    name: 'Dark Elegante',
    description: 'Tema escuro moderno com contrastes perfeitos e acentos vibrantes',
    preview: ['#6366f1', '#4f46e5', '#0f172a', '#8b5cf6'],
    colors: {
      primaryColor: '#6366f1',
      secondaryColor: '#4f46e5',
      accentColor: '#8b5cf6',
      successColor: '#10b981',
      warningColor: '#f59e0b',
      dangerColor: '#ef4444',
      backgroundColor: '#0f172a',
      surfaceColor: '#1e293b',
      borderColor: '#334155',
      textPrimary: '#f1f5f9',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
      menuBackground: '#1e293b',
      menuActive: '#6366f1',
      menuHover: '#334155',
      gradientStart: '#6366f1',
      gradientEnd: '#4f46e5',
      gradientSecondStart: '#8b5cf6',
      gradientSecondEnd: '#7c3aed',
    }
  },
  {
    id: 'warm-sunset',
    name: 'Pôr do Sol Caloroso',
    description: 'Cores quentes e acolhedoras inspiradas no pôr do sol',
    preview: ['#f97316', '#ea580c', '#fff7ed', '#fb923c'],
    colors: {
      primaryColor: '#f97316',
      secondaryColor: '#ea580c',
      accentColor: '#fb923c',
      successColor: '#10b981',
      warningColor: '#d97706',
      dangerColor: '#dc2626',
      backgroundColor: '#ffffff',
      surfaceColor: '#fefefe',
      borderColor: '#fed7aa',
      textPrimary: '#1f2937',
      textSecondary: '#4b5563',
      textMuted: '#6b7280',
      menuBackground: '#fff7ed',
      menuActive: '#f97316',
      menuHover: '#fed7aa',
      gradientStart: '#f97316',
      gradientEnd: '#ea580c',
      gradientSecondStart: '#fb923c',
      gradientSecondEnd: '#f59e0b',
    }
  },
  {
    id: 'ocean-breeze',
    name: 'Brisa do Oceano',
    description: 'Tons frescos de azul e turquesa inspirados no oceano',
    preview: ['#0891b2', '#155e75', '#ecfeff', '#06b6d4'],
    colors: {
      primaryColor: '#0891b2',
      secondaryColor: '#155e75',
      accentColor: '#06b6d4',
      successColor: '#10b981',
      warningColor: '#f59e0b',
      dangerColor: '#ef4444',
      backgroundColor: '#ffffff',
      surfaceColor: '#fefefe',
      borderColor: '#cffafe',
      textPrimary: '#1f2937',
      textSecondary: '#374151',
      textMuted: '#6b7280',
      menuBackground: '#ecfeff',
      menuActive: '#0891b2',
      menuHover: '#cffafe',
      gradientStart: '#0891b2',
      gradientEnd: '#155e75',
      gradientSecondStart: '#06b6d4',
      gradientSecondEnd: '#0284c7',
    }
  },
  {
    id: 'forest-green',
    name: 'Verde Floresta',
    description: 'Tons naturais e harmoniosos de verde com acentos terrosos',
    preview: ['#16a34a', '#15803d', '#f0fdf4', '#22c55e'],
    colors: {
      primaryColor: '#16a34a',
      secondaryColor: '#15803d',
      accentColor: '#22c55e',
      successColor: '#059669',
      warningColor: '#d97706',
      dangerColor: '#dc2626',
      backgroundColor: '#ffffff',
      surfaceColor: '#fefefe',
      borderColor: '#bbf7d0',
      textPrimary: '#1f2937',
      textSecondary: '#374151',
      textMuted: '#6b7280',
      menuBackground: '#f0fdf4',
      menuActive: '#16a34a',
      menuHover: '#dcfce7',
      gradientStart: '#16a34a',
      gradientEnd: '#15803d',
      gradientSecondStart: '#22c55e',
      gradientSecondEnd: '#059669',
    }
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold Premium',
    description: 'Tons elegantes de rose gold com acentos dourados',
    preview: ['#e11d48', '#be123c', '#fff1f2', '#f43f5e'],
    colors: {
      primaryColor: '#e11d48',
      secondaryColor: '#be123c',
      accentColor: '#f43f5e',
      successColor: '#10b981',
      warningColor: '#f59e0b',
      dangerColor: '#dc2626',
      backgroundColor: '#ffffff',
      surfaceColor: '#fefefe',
      borderColor: '#fce7e7',
      textPrimary: '#1f2937',
      textSecondary: '#4b5563',
      textMuted: '#6b7280',
      menuBackground: '#fff1f2',
      menuActive: '#e11d48',
      menuHover: '#fce7e7',
      gradientStart: '#e11d48',
      gradientEnd: '#be123c',
      gradientSecondStart: '#f43f5e',
      gradientSecondEnd: '#e11d48',
    }
  }
];

interface ColorTemplatesProps {
  onTemplateApply?: () => void;
}

const ColorTemplates = ({ onTemplateApply }: ColorTemplatesProps) => {
  const { toast } = useToast();
  const updateSetting = useUpdateSystemSetting();

  const applyTemplate = async (template: ColorTemplate) => {
    try {
      const settingsToSave = [
        // Cores do Sistema
        { key: 'visual_primary_color', value: template.colors.primaryColor },
        { key: 'visual_secondary_color', value: template.colors.secondaryColor },
        { key: 'visual_accent_color', value: template.colors.accentColor },
        { key: 'visual_success_color', value: template.colors.successColor },
        { key: 'visual_warning_color', value: template.colors.warningColor },
        { key: 'visual_danger_color', value: template.colors.dangerColor },
        
        // Cores do Layout
        { key: 'visual_background_color', value: template.colors.backgroundColor },
        { key: 'visual_surface_color', value: template.colors.surfaceColor },
        { key: 'visual_border_color', value: template.colors.borderColor },
        
        // Cores do Texto
        { key: 'visual_text_primary', value: template.colors.textPrimary },
        { key: 'visual_text_secondary', value: template.colors.textSecondary },
        { key: 'visual_text_muted', value: template.colors.textMuted },
        
        // Cores do Menu
        { key: 'visual_menu_background', value: template.colors.menuBackground },
        { key: 'visual_menu_active', value: template.colors.menuActive },
        { key: 'visual_menu_hover', value: template.colors.menuHover },
        
        // Gradientes
        { key: 'visual_gradient_start', value: template.colors.gradientStart },
        { key: 'visual_gradient_end', value: template.colors.gradientEnd },
        { key: 'visual_gradient_second_start', value: template.colors.gradientSecondStart },
        { key: 'visual_gradient_second_end', value: template.colors.gradientSecondEnd },
      ];

      for (const setting of settingsToSave) {
        await updateSetting.mutateAsync(setting);
      }

      toast({
        title: "Template aplicado com sucesso!",
        description: `O tema "${template.name}" foi aplicado. A página será recarregada para aplicar as mudanças.`,
      });

      // Recarregar a página após 1 segundo para aplicar as cores
      setTimeout(() => {
        window.location.reload();
      }, 1000);

      onTemplateApply?.();
    } catch (error) {
      toast({
        title: "Erro ao aplicar template",
        description: "Ocorreu um erro ao aplicar o tema selecionado",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Palette className="h-5 w-5" />
          <span>Templates de Cores Profissionais</span>
        </h3>
        <p className="text-sm text-muted-foreground">
          Escolha um tema predefinido com cores harmoniosas e contrastes perfeitos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {colorTemplates.map((template) => (
          <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm font-semibold">{template.name}</CardTitle>
                  <CardDescription className="text-xs mt-1 leading-tight">
                    {template.description}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyTemplate(template)}
                  className="ml-2 shrink-0"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Aplicar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Preview das cores principais */}
                <div className="grid grid-cols-4 gap-1 h-8">
                  {template.preview.map((color, index) => (
                    <div
                      key={index}
                      className="rounded border"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                
                {/* Preview dos gradientes */}
                <div className="space-y-1">
                  <div 
                    className="h-6 rounded text-white text-xs font-medium flex items-center justify-center"
                    style={{ 
                      background: `linear-gradient(135deg, ${template.colors.gradientStart}, ${template.colors.gradientEnd})` 
                    }}
                  >
                    Gradiente Principal
                  </div>
                  <div 
                    className="h-6 rounded text-white text-xs font-medium flex items-center justify-center"
                    style={{ 
                      background: `linear-gradient(135deg, ${template.colors.gradientSecondStart}, ${template.colors.gradientSecondEnd})` 
                    }}
                  >
                    Gradiente Secundário
                  </div>
                </div>

                {/* Preview do menu */}
                <div 
                  className="p-2 rounded text-xs"
                  style={{ backgroundColor: template.colors.menuBackground, color: template.colors.textPrimary }}
                >
                  <div className="flex space-x-1">
                    <span 
                      className="px-2 py-1 rounded text-white"
                      style={{ backgroundColor: template.colors.menuActive }}
                    >
                      Ativo
                    </span>
                    <span 
                      className="px-2 py-1 rounded"
                      style={{ backgroundColor: template.colors.menuHover, color: template.colors.textPrimary }}
                    >
                      Hover
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ColorTemplates;
