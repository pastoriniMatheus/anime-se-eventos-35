
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

      // Função para criar variação mais escura para hover
      const darkenColor = (hsl: string, amount: number = 8) => {
        const [h, s, l] = hsl.split(' ').map(v => parseInt(v));
        return `${h} ${s}% ${Math.max(0, l - amount)}%`;
      };

      // Função para criar variação mais clara
      const lightenColor = (hsl: string, amount: number = 5) => {
        const [h, s, l] = hsl.split(' ').map(v => parseInt(v));
        return `${h} ${s}% ${Math.min(100, l + amount)}%`;
      };

      // Aplicar cores do sistema
      settings.forEach(setting => {
        const key = setting.key;
        const value = typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value);
        
        if (!value || !value.startsWith('#')) return;

        const hslValue = hexToHsl(value);
        
        switch (key) {
          // Cores principais
          case 'visual_primary_color':
            root.style.setProperty('--primary', hslValue);
            root.style.setProperty('--primary-hover', darkenColor(hslValue));
            root.style.setProperty('--ring', hslValue);
            break;
          case 'visual_secondary_color':
            root.style.setProperty('--secondary', hslValue);
            root.style.setProperty('--secondary-foreground', '0 0% 98%');
            break;
          case 'visual_accent_color':
            root.style.setProperty('--accent', hslValue);
            root.style.setProperty('--accent-foreground', '240 5.9% 10%');
            break;
          case 'visual_success_color':
            root.style.setProperty('--success', hslValue);
            break;
          case 'visual_warning_color':
            root.style.setProperty('--warning', hslValue);
            break;
          case 'visual_danger_color':
            root.style.setProperty('--destructive', hslValue);
            root.style.setProperty('--destructive-foreground', '0 0% 98%');
            break;

          // Cores do layout
          case 'visual_background_color':
            root.style.setProperty('--background', hslValue);
            document.body.style.backgroundColor = `hsl(${hslValue})`;
            break;
          case 'visual_surface_color':
            root.style.setProperty('--card', hslValue);
            root.style.setProperty('--card-foreground', hexToHsl('#1f2937'));
            root.style.setProperty('--popover', hslValue);
            root.style.setProperty('--popover-foreground', hexToHsl('#1f2937'));
            break;
          case 'visual_border_color':
            root.style.setProperty('--border', hslValue);
            root.style.setProperty('--input', hslValue);
            break;

          // Cores do texto
          case 'visual_text_primary':
            root.style.setProperty('--foreground', hslValue);
            root.style.setProperty('--card-foreground', hslValue);
            root.style.setProperty('--popover-foreground', hslValue);
            break;
          case 'visual_text_secondary':
            root.style.setProperty('--muted-foreground', hslValue);
            break;
          case 'visual_text_muted':
            root.style.setProperty('--muted', lightenColor(hslValue, 40));
            break;

          // Cores do menu/navegação - usando propriedades sidebar
          case 'visual_menu_background':
            root.style.setProperty('--sidebar-background', hslValue);
            break;
          case 'visual_menu_active':
            root.style.setProperty('--sidebar-primary', hslValue);
            root.style.setProperty('--sidebar-primary-foreground', '0 0% 98%');
            break;
          case 'visual_menu_hover':
            root.style.setProperty('--sidebar-accent', hslValue);
            root.style.setProperty('--sidebar-accent-foreground', hexToHsl('#1f2937'));
            break;

          // Aplicar cores do texto do sidebar
          case 'visual_text_primary':
            root.style.setProperty('--sidebar-foreground', hslValue);
            break;

          // Gradientes (aplicados via CSS custom properties)
          case 'visual_gradient_start':
            root.style.setProperty('--gradient-start', value);
            break;
          case 'visual_gradient_end':
            root.style.setProperty('--gradient-end', value);
            break;
          case 'visual_gradient_second_start':
            root.style.setProperty('--gradient-second-start', value);
            break;
          case 'visual_gradient_second_end':
            root.style.setProperty('--gradient-second-end', value);
            break;
        }
      });

      // Aplicar cores adicionais baseadas nas cores do menu
      const menuActiveColor = settings.find(s => s.key === 'visual_menu_active')?.value;
      if (menuActiveColor && typeof menuActiveColor === 'string' && menuActiveColor.startsWith('#')) {
        const hsl = hexToHsl(menuActiveColor);
        root.style.setProperty('--sidebar-border', lightenColor(hsl, 20));
        root.style.setProperty('--sidebar-ring', hsl);
      }
    };

    applyColors();
  }, [settings]);

  return <>{children}</>;
};
