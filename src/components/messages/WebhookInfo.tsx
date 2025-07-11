
import React from 'react';

interface WebhookInfoProps {
  webhookUrl: string;
}

const WebhookInfo = ({ webhookUrl }: WebhookInfoProps) => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h4 className="font-medium text-blue-900 mb-2">Webhook Configurado:</h4>
      <p className="text-sm text-blue-700 font-mono">{webhookUrl}</p>
    </div>
  );
};

export default WebhookInfo;
