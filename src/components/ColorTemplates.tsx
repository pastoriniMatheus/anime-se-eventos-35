
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
    preview: ['#ec4899', '#be185d', '#f8fafc', '#e11d48'],
    colors: {
      primaryColor: '#ec4899',
      secondaryColor: '#be185d',
      accentColor: '#f472b6',
      successColor: '#22c55e',
      warningColor: '#f59e0b',
      dangerColor: '#ef4444',
      backgroundColor: '#fefefe',
      surfaceColor: '#fdf2f8',
      borderColor: '#fce7f3',
      textPrimary: '#831843',
      textSecondary: '#be185d',
      textMuted: '#a21caf',
      menuBackground: '#fdf2f8',
      menuActive: '#ec4899',
      menuHover: '#fce7f3',
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
      successColor: '#22c55e',
      warningColor: '#f59e0b',
      dangerColor: '#ef4444',
      backgroundColor: '#ffffff',
      surfaceColor: '#f8fafc',
      borderColor: '#e2e8f0',
      textPrimary: '#1e293b',
      textSecondary: '#475569',
      textMuted: '#64748b',
      menuBackground: '#f1f5f9',
      menuActive: '#3b82f6',
      menuHover: '#e2e8f0',
      gradientStart: '#3b82f6',
      gradientEnd: '#1e40af',
      gradientSecondStart: '#0ea5e9',
      gradientSecondEnd: '#0284c7',
    }
  },
  {
    id: 'clean-minimal',
    name: 'Clean Minimal',
    description: 'Design limpo e minimalista com tons neutros suaves',
    preview: ['#6b7280', '#374151', '#f9fafb', '#10b981'],
    colors: {
      primaryColor: '#6b7280',
      secondaryColor: '#374151',
      accentColor: '#10b981',
      successColor: '#22c55e',
      warningColor: '#f59e0b',
      dangerColor: '#ef4444',
      backgroundColor: '#ffffff',
      surfaceColor: '#f9fafb',
      borderColor: '#e5e7eb',
      textPrimary: '#111827',
      textSecondary: '#4b5563',
      textMuted: '#9ca3af',
      menuBackground: '#f9fafb',
      menuActive: '#6b7280',
      menuHover: '#f3f4f6',
      gradientStart: '#6b7280',
      gradientEnd: '#374151',
      gradientSecondStart: '#10b981',
      gradientSecondEnd: '#059669',
    }
  },
  {
    id: 'sophisticated-purple',
    name: 'Sofisticado Roxo',
    description: 'Elegante e sofisticado com tons profundos de roxo',
    preview: ['#8b5cf6', '#5b21b6', '#faf5ff', '#a855f7'],
    colors: {
      primaryColor: '#8b5cf6',
      secondaryColor: '#5b21b6',
      accentColor: '#a855f7',
      successColor: '#22c55e',
      warningColor: '#f59e0b',
      dangerColor: '#ef4444',
      backgroundColor: '#ffffff',
      surfaceColor: '#faf5ff',
      borderColor: '#e9d5ff',
      textPrimary: '#581c87',
      textSecondary: '#7c3aed',
      textMuted: '#a855f7',
      menuBackground: '#faf5ff',
      menuActive: '#8b5cf6',
      menuHover: '#f3e8ff',
      gradientStart: '#8b5cf6',
      gradientEnd: '#5b21b6',
      gradientSecondStart: '#a855f7',
      gradientSecondEnd: '#7c3aed',
    }
  },
  {
    id: 'dark-mode',
    name: 'Modo Escuro',
    description: 'Tema escuro moderno com contrastes suaves',
    preview: ['#6366f1', '#4f46e5', '#0f172a', '#8b5cf6'],
    colors: {
      primaryColor: '#6366f1',
      secondaryColor: '#4f46e5',
      accentColor: '#8b5cf6',
      successColor: '#22c55e',
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
    name: 'Pôr do Sol',
    description: 'Cores quentes inspiradas no pôr do sol',
    preview: ['#f97316', '#ea580c', '#fff7ed', '#fb923c'],
    colors: {
      primaryColor: '#f97316',
      secondaryColor: '#ea580c',
      accentColor: '#fb923c',
      successColor: '#22c55e',
      warningColor: '#f59e0b',
      dangerColor: '#ef4444',
      backgroundColor: '#ffffff',
      surfaceColor: '#fff7ed',
      borderColor: '#fed7aa',
      textPrimary: '#9a3412',
      textSecondary: '#c2410c',
      textMuted: '#ea580c',
      menuBackground: '#fff7ed',
      menuActive: '#f97316',
      menuHover: '#ffedd5',
      gradientStart: '#f97316',
      gradientEnd: '#ea580c',
      gradientSecondStart: '#fb923c',
      gradientSecondEnd: '#f59e0b',
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
        title: "Template aplicado",
        description: `O tema "${template.name}" foi aplicado com sucesso!`,
      });

      onTemplateApply?.();
    } catch (error) {
      toast({
        title: "Erro ao aplicar template",
        description: "Erro ao aplicar o tema selecionado",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Palette className="h-5 w-5" />
          <span>Templates de Cores</span>
        </h3>
        <p className="text-sm text-muted-foreground">
          Escolha um tema predefinido para aplicar rapidamente um conjunto de cores harmonioso
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {colorTemplates.map((template) => (
          <Card key={template.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {template.description}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyTemplate(template)}
                  className="ml-2"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Aplicar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-1 h-12">
                  {template.preview.map((color, index) => (
                    <div
                      key={index}
                      className="rounded"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                
                <div className="space-y-2">
                  <div 
                    className="h-8 rounded flex items-center justify-center text-white text-xs font-medium"
                    style={{ 
                      background: `linear-gradient(135deg, ${template.colors.gradientStart}, ${template.colors.gradientEnd})` 
                    }}
                  >
                    Gradiente Principal
                  </div>
                  <div 
                    className="h-8 rounded flex items-center justify-center text-white text-xs font-medium"
                    style={{ 
                      background: `linear-gradient(135deg, ${template.colors.gradientSecondStart}, ${template.colors.gradientSecondEnd})` 
                    }}
                  >
                    Gradiente Secundário
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
