
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Phone, Mail, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

interface PersonalInfoStepProps {
  formData: {
    name: string;
    whatsapp: string;
    email: string;
  };
  onFormDataChange: (field: string, value: string) => void;
  validationResult: string | null;
  isValidating: boolean;
  onValidateWhatsApp?: () => Promise<void>;
}

const PersonalInfoStep = ({ 
  formData, 
  onFormDataChange, 
  validationResult, 
  isValidating,
  onValidateWhatsApp 
}: PersonalInfoStepProps) => {
  
  const handleValidateClick = async () => {
    if (onValidateWhatsApp && formData.whatsapp) {
      await onValidateWhatsApp();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-700 font-medium flex items-center gap-2 lead-form-label">
          <User className="w-4 h-4" />
          Nome completo *
        </Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => onFormDataChange('name', e.target.value)}
          className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 lead-form-input"
          placeholder="Digite seu nome completo"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="whatsapp" className="text-gray-700 font-medium flex items-center gap-2 lead-form-label">
          <Phone className="w-4 h-4" />
          WhatsApp * (Validação obrigatória)
        </Label>
        <div className="flex gap-2">
          <Input
            id="whatsapp"
            type="tel"
            value={formData.whatsapp}
            onChange={(e) => onFormDataChange('whatsapp', e.target.value)}
            className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 lead-form-input"
            placeholder="(11) 99999-9999"
            required
          />
          <Button
            type="button"
            onClick={handleValidateClick}
            disabled={!formData.whatsapp || isValidating || validationResult === 'valid'}
            className="px-4 whitespace-nowrap"
            variant={validationResult === 'valid' ? 'default' : 'outline'}
          >
            {isValidating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Validando...
              </>
            ) : validationResult === 'valid' ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Validado
              </>
            ) : (
              'Validar'
            )}
          </Button>
        </div>
        
        {/* Status da validação */}
        <div className="min-h-[24px]">
          {isValidating && (
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded-md border border-blue-200">
              <Clock className="w-4 h-4 animate-spin" />
              <span>Validando número do WhatsApp via webhook...</span>
            </div>
          )}
          {validationResult === 'valid' && !isValidating && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded-md border border-green-200">
              <CheckCircle className="w-4 h-4" />
              <span>✓ Número do WhatsApp validado com sucesso</span>
            </div>
          )}
          {validationResult === 'invalid' && !isValidating && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 p-2 rounded-md border border-red-200">
              <XCircle className="w-4 h-4" />
              <span>✗ Número do WhatsApp inválido ou não encontrado</span>
            </div>
          )}
          {!validationResult && !isValidating && formData.whatsapp && (
            <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-2 rounded-md border border-orange-200">
              <Clock className="w-4 h-4" />
              <span>Clique em "Validar" para verificar seu WhatsApp</span>
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border">
          <strong>Importante:</strong> É obrigatório validar seu número de WhatsApp para prosseguir. 
          O sistema verificará se o número está ativo no WhatsApp através de um webhook externo.
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-700 font-medium flex items-center gap-2 lead-form-label">
          <Mail className="w-4 h-4" />
          E-mail *
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onFormDataChange('email', e.target.value)}
          className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 lead-form-input"
          placeholder="seu@email.com"
          required
        />
      </div>
    </div>
  );
};

export default PersonalInfoStep;
