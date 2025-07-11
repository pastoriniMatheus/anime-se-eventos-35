
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Edit, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface EditableItemManagerProps {
  title: string;
  description: string;
  items: any[];
  onCreate: (data: any) => void;
  itemName: string;
  withColor?: boolean;
  tableName: string;
  queryKey: string[];
}

const EditableItemManager = ({ 
  title, 
  description, 
  items = [], 
  onCreate, 
  itemName, 
  withColor = false,
  tableName,
  queryKey
}: EditableItemManagerProps) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemColor, setNewItemColor] = useState('#3B82F6');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleCreate = () => {
    if (!newItemName.trim()) {
      toast({
        title: "Erro",
        description: `Nome do ${itemName} é obrigatório`,
        variant: "destructive",
      });
      return;
    }

    if (withColor) {
      onCreate({ name: newItemName.trim(), color: newItemColor });
    } else {
      onCreate(newItemName.trim());
    }

    setNewItemName('');
    setNewItemColor('#3B82F6');
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditColor(item.color || '#3B82F6');
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      toast({
        title: "Erro",
        description: `Nome do ${itemName} é obrigatório`,
        variant: "destructive",
      });
      return;
    }

    try {
      const updateData: any = { name: editName.trim() };
      if (withColor) {
        updateData.color = editColor;
      }

      const { error } = await supabase
        .from(tableName as any)
        .update(updateData)
        .eq('id', editingId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey });
      setEditingId(null);
      
      toast({
        title: `${itemName} atualizado`,
        description: `${itemName} atualizado com sucesso!`,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || `Erro ao atualizar ${itemName}`,
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditColor('');
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from(tableName as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey });
      
      toast({
        title: `${itemName} removido`,
        description: `${itemName} removido com sucesso!`,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || `Erro ao remover ${itemName}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor={`new-${itemName}`}>Nome do {itemName}</Label>
            <Input
              id={`new-${itemName}`}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={`Digite o nome do ${itemName}`}
            />
          </div>
          {withColor && (
            <div>
              <Label htmlFor={`new-${itemName}-color`}>Cor</Label>
              <Input
                id={`new-${itemName}-color`}
                type="color"
                value={newItemColor}
                onChange={(e) => setNewItemColor(e.target.value)}
                className="w-20"
              />
            </div>
          )}
          <div className="flex items-end">
            <Button onClick={handleCreate} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Itens existentes:</Label>
          <div className="flex flex-wrap gap-2">
            {items.map((item: any) => (
              <div key={item.id} className="flex items-center gap-1">
                {editingId === item.id ? (
                  <div className="flex items-center gap-1 p-1 border rounded">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-6 text-xs w-20"
                    />
                    {withColor && (
                      <Input
                        type="color"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="h-6 w-8 p-0"
                      />
                    )}
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      className="h-6 w-6 p-0"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Badge
                    style={withColor ? { backgroundColor: item.color, color: 'white' } : undefined}
                    className="flex items-center gap-1"
                  >
                    {item.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="h-4 w-4 p-0 ml-1 hover:bg-white/20"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="h-4 w-4 p-0 hover:bg-white/20"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
              </div>
            ))}
            {items.length === 0 && (
              <span className="text-sm text-muted-foreground">Nenhum {itemName} cadastrado</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditableItemManager;
