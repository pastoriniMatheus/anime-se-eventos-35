import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { BarChart3, Users, QrCode, MessageSquare, FileText, Shield, Zap, Target, CheckCircle, ArrowRight, GraduationCap, Building2, Database, Webhook, Mail, Phone } from 'lucide-react';
const Apresentacao = () => {
  const navigate = useNavigate();
  const {
    data: systemSettings = []
  } = useSystemSettings();
  const logoSetting = systemSettings.find((s: any) => s.key === 'logo');
  const logoUrl = logoSetting ? typeof logoSetting.value === 'string' ? logoSetting.value : JSON.parse(String(logoSetting.value)) : '/lovable-uploads/c7eb5d40-5d53-4b46-b5a9-d35d5a784ac7.png';
  const problemas = ["Perda de leads por preenchimento manual incorreto", "Dados imprecisos e números de telefone errados", "Falta de acompanhamento da conversão lead → matrícula", "Dificuldade para gerenciar múltiplos eventos simultaneamente", "Campanhas de remarketing genéricas e ineficazes", "Falta de relatórios em tempo real"];
  const solucoes = [{
    icon: Shield,
    title: "Validação de Dados em Tempo Real",
    desc: "Sistema impede cadastro de dados incorretos com verificação automática"
  }, {
    icon: Target,
    title: "Acompanhamento Completo",
    desc: "Rastreamento do lead desde o evento até a matrícula final"
  }, {
    icon: QrCode,
    title: "QR Code Inteligente",
    desc: "Geração instantânea com acompanhamento de scans e conversões"
  }, {
    icon: BarChart3,
    title: "Relatórios em Tempo Real",
    desc: "Dashboards dinâmicos e exportação de relatórios PDF por evento"
  }, {
    icon: MessageSquare,
    title: "Automação WhatsApp",
    desc: "Chatbot e IA para captura automática de leads via WhatsApp"
  }, {
    icon: Mail,
    title: "Campanhas Personalizadas",
    desc: "Disparos segmentados por evento/curso via WhatsApp, SMS e e-mail"
  }];
  const diferenciais = [{
    icon: Database,
    title: "API Completa",
    desc: "Integração total com CRM existente e sistemas terceiros"
  }, {
    icon: Webhook,
    title: "Webhooks Personalizados",
    desc: "Tratamento customizado de dados conforme necessidade da T.I."
  }, {
    icon: Zap,
    title: "Backup 1-Click",
    desc: "Importação e exportação de dados com um clique"
  }, {
    icon: Users,
    title: "Multi-Segmento",
    desc: "Desenvolvido para faculdades, mas adaptável a qualquer negócio"
  }];
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src={logoUrl} alt="CESMAC" className="h-12 w-auto" />
            <div>
              <h1 className="text-xl font-bold text-blue-800">LeadSync</h1>
              <p className="text-sm text-gray-600">Lead Sync</p>
            </div>
          </div>
          <Button onClick={() => navigate('/login')} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
            Acessar Sistema
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-yellow-500 rounded-full flex items-center justify-center shadow-2xl">
              <GraduationCap className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
            Revolucione sua Captação de Leads
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            Sistema completo para faculdades e empresas que captam clientes através de eventos. 
            <strong className="text-blue-700"> Zero perda de dados, máxima conversão.</strong>
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8 py-4">
              <Building2 className="mr-2 h-5 w-5" />
              Para Faculdades
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-blue-600 text-blue-700 hover:bg-blue-50 px-8 py-4">
              <Target className="mr-2 h-5 w-5" />
              Para Empresas
            </Button>
          </div>
        </div>
      </section>

      {/* Problemas */}
      <section className="py-16 px-6 bg-red-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-red-800">
            Problemas que Você Enfrenta Diariamente
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problemas.map((problema, index) => <Card key={index} className="border-red-200 bg-white/80">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex-shrink-0 mt-1"></div>
                    <p className="text-gray-700 font-medium">{problema}</p>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Soluções */}
      <section className="py-16 px-6 bg-green-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-green-800">
            Nossa Solução Completa
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solucoes.map((solucao, index) => <Card key={index} className="border-green-200 bg-white/90 hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4">
                    <solucao.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-green-800">{solucao.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{solucao.desc}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-800">
            Diferenciais Técnicos
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {diferenciais.map((diferencial, index) => <Card key={index} className="border-blue-200 bg-white/90 hover:shadow-lg transition-all duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <diferencial.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-lg text-blue-800">{diferencial.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600">{diferencial.desc}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Resultados */}
      <section className="py-16 px-6 bg-blue-900 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Resultados Comprovados</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
              <div className="text-4xl font-bold text-yellow-400 mb-2">95%</div>
              <div className="text-lg">Redução de dados incorretos</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
              <div className="text-4xl font-bold text-yellow-400 mb-2">3x</div>
              <div className="text-lg">Aumento na conversão</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
              <div className="text-4xl font-bold text-yellow-400 mb-2">80%</div>
              <div className="text-lg">Economia de tempo da equipe</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para Revolucionar sua Captação?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se às instituições que já transformaram seus resultados
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/login')} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-4">
              Acessar Sistema Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-800 px-8 py-4">
              <Phone className="mr-2 h-5 w-5" />
              Solicitar Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-6">
        <div className="container mx-auto text-center">
          <div className="flex justify-center items-center space-x-4 mb-4">
            <img src={logoUrl} alt="CESMAC" className="h-8 w-auto" />
            <span className="text-lg font-semibold">Lead Sync - Automação Inteligente para eventos.</span>
          </div>
          <p className="text-gray-400">Desenvolvido com base em feedbacks da necessidade das faculdades atendidas.</p>
        </div>
      </footer>
    </div>;
};
export default Apresentacao;