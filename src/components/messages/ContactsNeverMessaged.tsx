
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ContactsNeverMessaged = () => {
  const { data: contactsNeverMessaged = [] } = useQuery({
    queryKey: ['contacts-never-messaged'],
    queryFn: async () => {
      // Primeiro buscar todos os leads que já receberam mensagem
      const { data: recipientLeadIds, error: recipientsError } = await supabase
        .from('message_recipients')
        .select('lead_id');
      
      if (recipientsError) throw recipientsError;
      
      const excludeIds = recipientLeadIds?.map(r => r.lead_id) || [];
      
      // Buscar leads que não estão na lista de destinatários
      let query = supabase
        .from('leads')
        .select(`
          id, name, email, whatsapp,
          courses(name),
          events(name),
          lead_statuses(name, color)
        `);
      
      if (excludeIds.length > 0) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contatos Não Contatados</CardTitle>
        <CardDescription>
          Lista de contatos que ainda não receberam nenhuma mensagem
        </CardDescription>
      </CardHeader>
      <CardContent>
        {contactsNeverMessaged.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Todos os contatos já receberam pelo menos uma mensagem
          </div>
        ) : (
          <div className="space-y-4">
            {contactsNeverMessaged.map((contact: any) => (
              <div key={contact.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{contact.name}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      {contact.email && <p>Email: {contact.email}</p>}
                      {contact.whatsapp && <p>WhatsApp: {contact.whatsapp}</p>}
                      {contact.courses && <p>Curso: {contact.courses.name}</p>}
                      {contact.events && <p>Evento: {contact.events.name}</p>}
                    </div>
                  </div>
                  {contact.lead_statuses && (
                    <Badge 
                      style={{ backgroundColor: contact.lead_statuses.color + '20', color: contact.lead_statuses.color }}
                    >
                      {contact.lead_statuses.name}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactsNeverMessaged;
