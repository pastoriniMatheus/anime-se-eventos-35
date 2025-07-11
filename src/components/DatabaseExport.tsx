
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, Database, Info, Upload, FileUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DatabaseExportProps {
  className?: string;
}

const DatabaseExport: React.FC<DatabaseExportProps> = ({ className }) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPassword, setUploadPassword] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleExportDatabase = async () => {
    setIsExporting(true);

    try {
      console.log('🚀 Iniciando exportação do banco de dados...');
      
      const { data, error } = await supabase.functions.invoke('database-export', {
        body: {
          password: 'admin123' // Senha fixa para segurança
        }
      });

      if (error) {
        console.error('❌ Erro na exportação:', error);
        throw new Error(error.message || 'Erro ao exportar banco de dados');
      }

      // Criar arquivo de download
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `database_dump_${timestamp}.sql`;
      
      const blob = new Blob([data], { type: 'text/sql' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      toast({
        title: "Exportação concluída",
        description: `Banco de dados exportado com sucesso! Arquivo: ${filename}`,
      });

    } catch (error: any) {
      console.error('💥 Erro na exportação:', error);
      toast({
        title: "Erro na exportação",
        description: error.message || "Erro ao exportar banco de dados",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.sql')) {
      setSelectedFile(file);
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo .sql válido",
        variant: "destructive",
      });
    }
  };

  const handleUploadDatabase = async () => {
    if (!selectedFile || !uploadPassword.trim()) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, selecione um arquivo SQL e digite a senha",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileContent = await selectedFile.text();
      
      const { data, error } = await supabase.functions.invoke('database-import', {
        body: {
          password: uploadPassword,
          sqlContent: fileContent,
          filename: selectedFile.name
        }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao importar banco de dados');
      }

      toast({
        title: "Importação concluída",
        description: "Banco de dados importado com sucesso!",
      });

      setSelectedFile(null);
      setUploadPassword('');
      
    } catch (error: any) {
      console.error('💥 Erro na importação:', error);
      toast({
        title: "Erro na importação",
        description: error.message || "Erro ao importar banco de dados",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Exportar Banco */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <CardTitle>Exportar/Baixar Banco de Dados</CardTitle>
          </div>
          <CardDescription>
            Execute um dump completo do banco de dados para backup ou migração
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Informações sobre o Backup</p>
                <p>O arquivo SQL gerado contém todos os dados e estrutura do banco.</p>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• Backup completo de todas as tabelas</li>
                  <li>• Estrutura e dados preservados</li>
                  <li>• Compatível com PostgreSQL</li>
                  <li>• Arquivo compactado para download</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Como usar o arquivo exportado</p>
              <p className="mb-2">Para importar o dump em outro banco PostgreSQL, use o comando psql:</p>
              <Textarea
                readOnly
                value={`psql -h [HOST] -p [PORT] -U [USERNAME] -d [DATABASE] -f [ARQUIVO_DUMP].sql`}
                className="font-mono text-xs bg-amber-100 border-amber-300"
                rows={2}
              />
              <p className="mt-2 text-xs">
                Substitua os valores entre colchetes pelas informações do seu banco de destino
              </p>
            </div>
          </div>

          <Button 
            onClick={handleExportDatabase} 
            disabled={isExporting}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exportando...' : 'Baixar Dump do Banco'}
          </Button>
        </CardContent>
      </Card>

      {/* Importar Banco */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <CardTitle>Importar/Upload Banco de Dados</CardTitle>
          </div>
          <CardDescription>
            Envie um arquivo SQL para restaurar ou importar dados para este banco
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">⚠️ Atenção</p>
                <p>Esta operação pode sobrescrever dados existentes. Faça um backup antes de prosseguir.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sql-file">Arquivo SQL</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="sql-file"
                  type="file"
                  accept=".sql"
                  onChange={handleFileSelect}
                  className="flex-1"
                />
                <FileUp className="h-5 w-5 text-gray-400" />
              </div>
              {selectedFile && (
                <p className="text-xs text-green-600">
                  Arquivo selecionado: {selectedFile.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-password">Senha de Segurança *</Label>
              <Input
                id="upload-password"
                type="password"
                value={uploadPassword}
                onChange={(e) => setUploadPassword(e.target.value)}
                placeholder="Digite a senha de segurança"
              />
              <p className="text-xs text-muted-foreground">
                Esta senha é necessária para confirmar a operação de importação
              </p>
            </div>
          </div>

          <Button 
            onClick={handleUploadDatabase} 
            disabled={isUploading || !selectedFile || !uploadPassword.trim()}
            className="w-full"
            variant="destructive"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Importando...' : 'Importar Banco de Dados'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseExport;
