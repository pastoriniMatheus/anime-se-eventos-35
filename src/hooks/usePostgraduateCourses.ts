
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePostgraduateCourses = () => {
  return useQuery({
    queryKey: ['postgraduate_courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('postgraduate_courses')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });
};

export const useCreatePostgraduateCourse = () => {
  const { toast } = useToast(); 
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('postgraduate_courses')
        .insert([{ name }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postgraduate_courses'] });
      toast({
        title: "Pós-graduação adicionada",
        description: "Pós-graduação adicionada com sucesso!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar pós-graduação",
        variant: "destructive",
      });
    }
  });
};
