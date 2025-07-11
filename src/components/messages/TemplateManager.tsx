
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface TemplateManagerProps {
  message: string;
  onSaveTemplate: () => void;
}

const TemplateManager = ({
  message,
  onSaveTemplate
}: TemplateManagerProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onSaveTemplate}
        disabled={!message.trim()}
      >
        <Save className="h-4 w-4 mr-1" />
        Salvar como Template
      </Button>
    </div>
  );
};

export default TemplateManager;
