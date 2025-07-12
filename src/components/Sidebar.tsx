
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  QrCode, 
  MessageSquare, 
  BookOpen, 
  GraduationCap, 
  Settings,
  BarChart3,
  FileText
} from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

const Sidebar = () => {
  const { collapsed } = useSidebar();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Leads', icon: Users, path: '/leads' },
    { name: 'QR Code', icon: QrCode, path: '/qr-code' },
    { name: 'Mensagens', icon: MessageSquare, path: '/messages' },
    { name: 'Cursos', icon: BookOpen, path: '/courses' },
    { name: 'Pós-graduação', icon: GraduationCap, path: '/postgraduate' },
    { name: 'Relatórios', icon: BarChart3, path: '/reports' },
    { name: 'Formulário', icon: FileText, path: '/form' },
    { name: 'Configurações', icon: Settings, path: '/settings' },
  ];

  return (
    <div className={`h-full bg-sidebar-background border-r border-sidebar-border transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            {!collapsed && (
              <span className="font-bold text-lg text-sidebar-foreground">
                LeadGen
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
