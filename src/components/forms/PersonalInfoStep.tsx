
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Mail, CheckCircle, XCircle, Clock } from 'lucide-react';

interface PersonalInfoStepProps {
  formData: {
    name: string;
    whatsapp: string;
    email: string;
  };
  onFormDataChange: (field: string, value: string) => void;
  validationResult: string | null;
  isValidating: boolean;
}

const PersonalInfoStep = ({ 
  formData, 
  onFormDataChange, 
  validationResult, 
  isValidating
}: PersonalInfoStepProps) => {
  
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
          WhatsApp * (Validação automática)
        </Label>
        <Input
          id="whatsapp"
          type="tel"
          value={formData.whatsapp}
          onChange={(e) => onFormDataChange('whatsapp', e.target.value)}
          className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 lead-form-input"
          placeholder="(11) 99999-9999"
          required
        />
        
        {/* Status da validação */}
        <div className="min-h-[24px]">
          {isValidating && (
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded-md border border-blue-200">
              <Clock className="w-4 h-4 animate-spin" />
              <span>Validando número do WhatsApp...</span>
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
        </div>
        
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border">
          <strong>Importante:</strong> Seu número de WhatsApp será validado automaticamente ao avançar para a próxima etapa.
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
