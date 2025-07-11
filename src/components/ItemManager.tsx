
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ItemManagerProps {
  title: string;
  description: string;
  items: any[];
  onCreate: (data: any) => void;
  itemName: string;
  withColor?: boolean;
}

const ItemManager = ({ title, description, items = [], onCreate, itemName, withColor = false }: ItemManagerProps) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemColor, setNewItemColor] = useState('#3B82F6');
  const { toast } = useToast();

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
              <Badge
                key={item.id}
                style={withColor ? { backgroundColor: item.color, color: 'white' } : undefined}
                className="flex items-center gap-1"
              >
                {item.name}
              </Badge>
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

export default ItemManager;
