import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import LeadSyncLogo from '@/components/LeadSyncLogo';
import { 
  BarChart3, Users, QrCode, MessageSquare, FileText, Shield, Zap, Target, 
  CheckCircle, ArrowRight, GraduationCap, Building2, Database, Webhook, 
  Mail, Phone, Settings, Bot, Globe, Clock, TrendingUp, Award, Star,
  Smartphone, Bell, Eye, Lock, Cpu, Download, Upload, Calendar,
  AlertTriangle, Check, X, Heart
} from 'lucide-react';

const Apresentacao = () => {
  const navigate = useNavigate();
  const {
    data: systemSettings = []
  } = useSystemSettings();

  const problemas = [
    "Perda de leads por preenchimento manual incorreto ou incompleto",
    "Dados imprecisos com números de telefone e e-mails inválidos", 
    "Falta de acompanhamento da jornada lead → conversão → matrícula",
    "Dificuldade para gerenciar múltiplos eventos simultaneamente",
    "Campanhas de remarketing genéricas sem segmentação eficaz",
    "Ausência de relatórios em tempo real e métricas de conversão",
    "Integração manual e demorada com sistemas de CRM existentes",
    "Falta de validação automática de contatos WhatsApp"
  ];

  const funcionalidades = [
    {
      icon: QrCode,
      title: "QR Code Inteligente",
      desc: "Geração automática com tracking avançado, redirecionamento personalizado e acompanhamento de scans em tempo real",
      detalhes: ["URLs encurtadas automáticas", "Análise de dispositivos", "Geolocalização de scans", "Histórico completo"]
    },
    {
      icon: Shield,
      title: "Validação de Dados",
      desc: "Sistema impede cadastro de dados incorretos com verificação em tempo real de WhatsApp, e-mail e CPF",
      detalhes: ["Validação WhatsApp via API", "Verificação de e-mail", "Validação de CPF/CNPJ", "Prevenção de duplicatas"]
    },
    {
      icon: Bot,
      title: "Chatbot & IA",
      desc: "Captura automática de leads via WhatsApp com inteligência artificial e respostas contextualizadas",
      detalhes: ["Respostas automáticas", "Qualificação de leads", "Agendamento automático", "FAQ inteligente"]
    },
    {
      icon: MessageSquare,
      title: "Disparos Inteligentes",
      desc: "Campanhas segmentadas via WhatsApp, SMS e E-mail com templates personalizáveis e automação completa",
      detalhes: ["Templates ilimitados", "Segmentação avançada", "Agendamento de envios", "Confirmação de entrega"]
    },
    {
      icon: BarChart3,
      title: "Analytics Avançado",
      desc: "Dashboards em tempo real com métricas de conversão, ROI e relatórios exportáveis em PDF/Excel",
      detalhes: ["Métricas em tempo real", "Funil de conversão", "ROI por evento", "Relatórios automáticos"]
    },
    {
      icon: Target,
      title: "Gestão de Leads",
      desc: "Acompanhamento completo da jornada do lead com status personalizáveis e histórico detalhado",
      detalhes: ["Pipeline visual", "Status customizáveis", "Histórico completo", "Pontuação de leads"]
    },
    {
      icon: Calendar,
      title: "Gestão de Eventos",
      desc: "Controle total de eventos simultâneos com configurações independentes e métricas individuais",
      detalhes: ["Eventos ilimitados", "Configurações únicas", "Métricas isoladas", "Gestão de equipes"]
    },
    {
      icon: Database,
      title: "API Completa",
      desc: "Integração total com CRMs existentes, webhooks personalizados e sincronização automática",
      detalhes: ["REST API completa", "Webhooks customizados", "Sync bidirecional", "Documentação completa"]
    }
  ];

  const diferenciais = [
    {
      icon: Zap,
      title: "Backup 1-Click",
      desc: "Importação e exportação completa de dados com um clique, sem perda de informações"
    },
    {
      icon: Webhook,
      title: "Webhooks Avançados",
      desc: "13+ funções serverless para tratamento customizado conforme necessidade"
    },
    {
      icon: Globe,
      title: "Multi-Segmento",
      desc: "Desenvolvido para faculdades, mas adaptável a qualquer tipo de evento ou negócio"
    },
    {
      icon: Lock,
      title: "Segurança Total",
      desc: "Criptografia de ponta, LGPD compliance e controle de acesso granular"
    },
    {
      icon: Cpu,
      title: "Performance",
      desc: "Infraestrutura serverless escalável para eventos de qualquer tamanho"
    },
    {
      icon: Settings,
      title: "Customização",
      desc: "Interface personalizável, templates próprios e configurações flexíveis"
    }
  ];

  const casos = [
    {
      icon: GraduationCap,
      titulo: "Faculdades & Universidades",
      desc: "Vestibulares, feiras de profissões, eventos acadêmicos",
      resultados: ["95% menos dados incorretos", "3x mais matrículas", "80% economia de tempo"]
    },
    {
      icon: Building2,
      titulo: "Empresas & Corporações",
      desc: "Eventos corporativos, feiras, congressos, workshops",
      resultados: ["300% aumento em leads", "50% melhoria na conversão", "90% automação de processos"]
    },
    {
      icon: Award,
      titulo: "Consultorias & Serviços",
      desc: "Palestras, cursos, eventos de networking",
      resultados: ["5x mais agendamentos", "85% redução no tempo", "100% rastreabilidade"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <LeadSyncLogo size="md" />
          <Button 
            onClick={() => navigate('/login')} 
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            Acessar Sistema
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-8">
            <LeadSyncLogo size="xl" showText={false} className="animate-pulse" />
          </div>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
            LeadSync
          </h1>
          <p className="text-2xl font-semibold text-blue-700 mb-4">
            A Revolução na Captação de Leads para Eventos
          </p>
          <p className="text-xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed">
            Sistema completo de automação inteligente que transforma como você capta, gerencia e converte leads em eventos. 
            <strong className="text-blue-700"> Zero perda de dados, máxima conversão, ROI garantido.</strong>
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8 py-4">
              <GraduationCap className="mr-2 h-5 w-5" />
              Para Faculdades
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-blue-600 text-blue-700 hover:bg-blue-50 px-8 py-4">
              <Building2 className="mr-2 h-5 w-5" />
              Para Empresas
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-green-600 text-green-700 hover:bg-green-50 px-8 py-4">
              <Award className="mr-2 h-5 w-5" />
              Para Consultorias
            </Button>
          </div>
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              <span>Mais de 50+ eventos atendidos</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
              <span>95% de satisfação dos clientes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problemas */}
      <section className="py-16 px-6 bg-red-50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-red-800">
            Problemas que Você Enfrenta Diariamente
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Reconhece algum destes desafios no seu dia a dia?
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
            {problemas.map((problema, index) => (
              <Card key={index} className="border-red-200 bg-white/90 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                      <X className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-gray-700 font-medium">{problema}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Funcionalidades Completas */}
      <section className="py-16 px-6 bg-green-50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-green-800">
            Funcionalidades Completas do LeadSync
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Tudo que você precisa para dominar a captação de leads em eventos
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {funcionalidades.map((func, index) => (
              <Card key={index} className="border-green-200 bg-white/95 hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <func.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-green-800">{func.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{func.desc}</p>
                  <div className="space-y-2">
                    {func.detalhes.map((detalhe, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{detalhe}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciais Técnicos */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-blue-800">
            Diferenciais Técnicos
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Tecnologia de ponta para resultados excepcionais
          </p>
          <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-6">
            {diferenciais.map((diferencial, index) => (
              <Card key={index} className="border-blue-200 bg-white/90 hover:shadow-lg transition-all duration-300 text-center">
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <diferencial.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-lg text-blue-800">{diferencial.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{diferencial.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Casos de Uso */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
            Casos de Uso e Resultados
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Adaptável a qualquer tipo de evento ou negócio
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {casos.map((caso, index) => (
              <Card key={index} className="bg-white hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <caso.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-purple-800">{caso.titulo}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-6">{caso.desc}</p>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800">Resultados Típicos:</h4>
                    {caso.resultados.map((resultado, idx) => (
                      <div key={idx} className="flex items-center justify-center text-sm">
                        <Heart className="w-4 h-4 text-red-500 mr-2" />
                        <span className="font-medium text-gray-700">{resultado}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Métricas de Sucesso */}
      <section className="py-16 px-6 bg-blue-900 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Resultados Comprovados</h2>
          <p className="text-xl mb-12 opacity-90">Números que falam por si só</p>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <div className="text-5xl font-bold text-yellow-400 mb-2">95%</div>
              <div className="text-lg">Redução de dados incorretos</div>
              <div className="text-sm opacity-75 mt-2">vs. processos manuais</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <div className="text-5xl font-bold text-yellow-400 mb-2">5x</div>
              <div className="text-lg">Aumento na conversão</div>
              <div className="text-sm opacity-75 mt-2">leads para matrículas</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <div className="text-5xl font-bold text-yellow-400 mb-2">80%</div>
              <div className="text-lg">Economia de tempo</div>
              <div className="text-sm opacity-75 mt-2">da equipe comercial</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <div className="text-5xl font-bold text-yellow-400 mb-2">100%</div>
              <div className="text-lg">ROI Positivo</div>
              <div className="text-sm opacity-75 mt-2">em 90 dias</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">
            Pronto para Revolucionar sua Captação?
          </h2>
          <p className="text-xl mb-4 opacity-90">
            Junte-se às instituições que já transformaram seus resultados com LeadSync
          </p>
          <p className="text-lg mb-8 opacity-80">
            Desenvolvido por especialistas, testado em mais de 50 eventos, aprovado por milhares de leads
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button 
              size="lg" 
              onClick={() => navigate('/login')} 
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-10 py-4 text-lg"
            >
              Começar Agora - GRÁTIS
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-blue-800 px-10 py-4 text-lg"
            >
              <Phone className="mr-2 h-6 w-6" />
              Agendar Demonstração
            </Button>
          </div>
          <div className="flex justify-center items-center space-x-8 text-sm opacity-80">
            <span>✓ Sem taxa de setup</span>
            <span>✓ Suporte completo</span>
            <span>✓ Treinamento incluído</span>
            <span>✓ Resultados em 7 dias</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <LeadSyncLogo size="md" className="mb-4" />
              <p className="text-gray-400 mb-4">
                A solução completa para automação inteligente de captação de leads em eventos.
              </p>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Funcionalidades</h3>
              <ul className="space-y-2 text-gray-400">
                <li>• QR Code Inteligente</li>
                <li>• Validação de Dados</li>
                <li>• Chatbot & IA</li>
                <li>• Analytics Avançado</li>
                <li>• API Completa</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Segmentos</h3>
              <ul className="space-y-2 text-gray-400">
                <li>• Faculdades & Universidades</li>
                <li>• Empresas & Corporações</li>
                <li>• Consultorias & Serviços</li>
                <li>• Eventos & Feiras</li>
                <li>• Qualquer Negócio</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2024 LeadSync. Todos os direitos reservados. Desenvolvido com base em feedbacks reais de eventos e necessidades do mercado.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Apresentacao;
