
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useQRCodes = () => {
  return useQuery({
    queryKey: ['qr_codes'],
    queryFn: async () => {
      console.log('🔍 Buscando QR codes...');
      
      const { data, error } = await supabase
        .from('qr_codes')
        .select(`
          *,
          event:events(name, whatsapp_number)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Erro ao buscar QR codes:', error);
        throw error;
      }
      
      console.log('📋 QR codes encontrados:', data?.length || 0);
      console.log('📋 Dados dos QR codes:', data?.map(qr => ({ 
        id: qr.id, 
        short_url: qr.short_url,
        scans: qr.scans,
        tracking_id: qr.tracking_id,
        type: qr.type 
      })) || []);
      
      return data;
    },
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 60 * 1000, // Refetch a cada 60 segundos para atualizar contadores
  });
};
