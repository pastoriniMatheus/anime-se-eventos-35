
import React, { useEffect } from 'react';
import { useSystemSettings } from '@/hooks/useSystemSettings';

interface DynamicColorProviderProps {
  children: React.ReactNode;
}

export const DynamicColorProvider = ({ children }: DynamicColorProviderProps) => {
  const { data: settings = [] } = useSystemSettings();

  useEffect(() => {
    const applyColors = () => {
      const root = document.documentElement;
      
      // Função para converter cor hex para HSL
      const hexToHsl = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
        }

        return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
      };

      // Aplicar cores do sistema
      settings.forEach(setting => {
        switch (setting.key) {
          // Cores principais
          case 'visual_primary_color':
            if (setting.value) {
              root.style.setProperty('--primary', hexToHsl(setting.value));
            }
            break;
          case 'visual_secondary_color':
            if (setting.value) {
              root.style.setProperty('--secondary', hexToHsl(setting.value));
            }
            break;
          case 'visual_accent_color':
            if (setting.value) {
              root.style.setProperty('--accent', hexToHsl(setting.value));
            }
            break;
          case 'visual_success_color':
            if (setting.value) {
              root.style.setProperty('--success', hexToHsl(setting.value));
            }
            break;
          case 'visual_warning_color':
            if (setting.value) {
              root.style.setProperty('--warning', hexToHsl(setting.value));
            }
            break;
          case 'visual_danger_color':
            if (setting.value) {
              root.style.setProperty('--destructive', hexToHsl(setting.value));
            }
            break;

          // Cores do layout
          case 'visual_background_color':
            if (setting.value) {
              root.style.setProperty('--background', hexToHsl(setting.value));
            }
            break;
          case 'visual_surface_color':
            if (setting.value) {
              root.style.setProperty('--card', hexToHsl(setting.value));
              root.style.setProperty('--popover', hexToHsl(setting.value));
            }
            break;
          case 'visual_border_color':
            if (setting.value) {
              root.style.setProperty('--border', hexToHsl(setting.value));
              root.style.setProperty('--input', hexToHsl(setting.value));
            }
            break;

          // Cores do texto
          case 'visual_text_primary':
            if (setting.value) {
              root.style.setProperty('--foreground', hexToHsl(setting.value));
              root.style.setProperty('--card-foreground', hexToHsl(setting.value));
            }
            break;
          case 'visual_text_secondary':
            if (setting.value) {
              root.style.setProperty('--muted-foreground', hexToHsl(setting.value));
            }
            break;
          case 'visual_text_muted':
            if (setting.value) {
              root.style.setProperty('--muted', hexToHsl(setting.value));
            }
            break;

          // Cores do menu
          case 'visual_menu_background':
            if (setting.value) {
              root.style.setProperty('--sidebar-background', hexToHsl(setting.value));
            }
            break;
          case 'visual_menu_active':
            if (setting.value) {
              root.style.setProperty('--sidebar-primary', hexToHsl(setting.value));
            }
            break;
          case 'visual_menu_hover':
            if (setting.value) {
              root.style.setProperty('--sidebar-accent', hexToHsl(setting.value));
            }
            break;

          // Gradientes (aplicados via CSS custom properties)
          case 'visual_gradient_start':
            if (setting.value) {
              root.style.setProperty('--gradient-start', setting.value);
            }
            break;
          case 'visual_gradient_end':
            if (setting.value) {
              root.style.setProperty('--gradient-end', setting.value);
            }
            break;
          case 'visual_gradient_second_start':
            if (setting.value) {
              root.style.setProperty('--gradient-second-start', setting.value);
            }
            break;
          case 'visual_gradient_second_end':
            if (setting.value) {
              root.style.setProperty('--gradient-second-end', setting.value);
            }
            break;
        }
      });
    };

    applyColors();
  }, [settings]);

  return <>{children}</>;
};
