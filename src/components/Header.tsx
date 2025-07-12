
import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, MessageSquare, Settings, QrCode, LogOut, Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: systemSettings, isLoading: settingsLoading } = useSystemSettings();
  const isMobile = useIsMobile();
  
  // Buscar logo das configurações do sistema - com verificação segura
  const logoSetting = Array.isArray(systemSettings) 
    ? systemSettings.find((s: any) => s.key === 'visual_logo_url' || s.key === 'logo')
    : null;
  
  let logoUrl = '/lovable-uploads/c7eb5d40-5d53-4b46-b5a9-d35d5a784ac7.png'; // fallback
  
  if (logoSetting?.value) {
    try {
      logoUrl = typeof logoSetting.value === 'string' ? 
        logoSetting.value : 
        JSON.parse(String(logoSetting.value));
    } catch (e) {
      console.error('Erro ao processar logo no header:', e);
      // Manter logoUrl padrão em caso de erro
    }
  }

  const menuItems = [
    {
      title: 'Dashboard',
      icon: BarChart3,
      path: '/dashboard',
    },
    {
      title: 'Leads',
      icon: Users,
      path: '/leads',
    },
    {
      title: 'Mensagens',
      icon: MessageSquare,
      path: '/messages',
    },
    {
      title: 'QR Code',
      icon: QrCode,
      path: '/qr-code',
    },
    {
      title: 'Configurações',
      icon: Settings,
      path: '/settings',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isMobile) {
    return (
      <header className="sticky top-0 z-50 h-14 border-b bg-white shadow-sm w-full">
        <div className="px-3 h-full flex items-center justify-between max-w-full overflow-hidden">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            {settingsLoading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded flex-shrink-0"></div>
            ) : (
              <img
                src={logoUrl}
                alt="Logo"
                className="h-8 w-auto object-contain flex-shrink-0"
                onError={(e) => {
                  console.error('Erro ao carregar logo no header mobile');
                  const target = e.target as HTMLImageElement;
                  target.src = '/lovable-uploads/c7eb5d40-5d53-4b46-b5a9-d35d5a784ac7.png';
                }}
              />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2 flex-shrink-0">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 z-50 bg-white border shadow-lg">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <DropdownMenuItem
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={cn(
                        'flex items-center space-x-2 cursor-pointer p-3',
                        isActive && 'bg-primary/10 text-primary'
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-xs text-gray-600 hidden sm:block truncate max-w-20">
              <strong className="text-primary">{user?.username}</strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-600 hover:text-red-600 hover:border-red-300 p-2 flex-shrink-0"
            >
              <LogOut className="h-3 w-3" />
              <span className="hidden sm:inline text-xs">Sair</span>
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 h-16 border-b bg-white shadow-sm w-full">
      <div className="px-6 h-full flex items-center justify-between max-w-full overflow-hidden">
        <div className="flex items-center space-x-6 min-w-0 flex-1">
          <div className="flex items-center flex-shrink-0">
            {settingsLoading ? (
              <div className="h-10 w-20 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <img
                src={logoUrl}
                alt="Logo"
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  console.error('Erro ao carregar logo no header desktop');
                  const target = e.target as HTMLImageElement;
                  target.src = '/lovable-uploads/c7eb5d40-5d53-4b46-b5a9-d35d5a784ac7.png';
                }}
              />
            )}
          </div>
          
          <nav className="flex items-center space-x-1 overflow-x-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Button
                  key={item.path}
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'flex items-center space-x-2 h-10 text-gray-700 hover:text-primary whitespace-nowrap',
                    isActive && 'bg-primary text-primary-foreground hover:bg-primary/90'
                  )}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden lg:inline">{item.title}</span>
                </Button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center space-x-4 flex-shrink-0">
          <span className="text-sm text-gray-600 hidden md:block truncate max-w-32">
            Olá, <strong className="text-primary">{user?.username}</strong>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-600 hover:border-red-300 whitespace-nowrap"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
