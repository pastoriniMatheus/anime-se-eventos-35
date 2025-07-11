
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, ExternalLink } from 'lucide-react';

interface ThankYouScreenProps {
  title?: string;
  message?: string;
  logoUrl?: string;
  redirectUrl?: string;
  onBackToForm: () => void;
}

const ThankYouScreen = ({ 
  title = "Obrigado!", 
  message = "Seus dados foram enviados com sucesso. Entraremos em contato em breve!",
  logoUrl,
  redirectUrl,
  onBackToForm 
}: ThankYouScreenProps) => {
  
  const handleRedirect = () => {
    if (redirectUrl) {
      window.open(redirectUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-3 md:p-6">
      <div className="w-full max-w-md mx-auto">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6 pt-8 px-6">
            {/* Logo do sistema */}
            {logoUrl && (
              <div className="flex justify-center mb-6">
                <div className="bg-white rounded-full p-3 shadow-lg">
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="h-16 w-auto object-contain"
                  />
                </div>
              </div>
            )}
            
            {/* Ícone de sucesso */}
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 rounded-full p-4 shadow-lg">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-4">
              {title}
            </h1>
          </CardHeader>
          
          <CardContent className="space-y-6 px-6 pb-8">
            <div className="text-center">
              <p className="text-gray-700 text-base leading-relaxed mb-6">
                {message}
              </p>
            </div>
            
            <div className="space-y-3">
              {redirectUrl && (
                <Button
                  onClick={handleRedirect}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Continuar
                </Button>
              )}
              
              <Button
                onClick={onBackToForm}
                variant="outline"
                className="w-full h-12 text-lg font-semibold shadow-lg"
              >
                <Home className="mr-2 h-5 w-5" />
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThankYouScreen;
