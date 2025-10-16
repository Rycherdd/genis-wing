import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAulas } from "@/hooks/useAulas";
import { useProfessores } from "@/hooks/useProfessores";
import { useTurmas } from "@/hooks/useTurmas";

interface AulaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aula?: any;
}

export function AulaForm({ open, onOpenChange, aula }: AulaFormProps) {
  const { createAula, updateAula } = useAulas();
  const { professores } = useProfessores();
  const { turmas } = useTurmas();
  const [loading, setLoading] = useState(false);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    professor_id: "",
    turma_id: "",
    data: "",
    horario_inicio: "",
    horario_fim: "",
    local: "",
    status: "agendada" as "agendada" | "em-andamento" | "concluida" | "cancelada",
    pdf_url: null as string | null,
  });

  // Update form data when aula prop changes
  useEffect(() => {
    if (aula) {
      setFormData({
        titulo: aula.titulo || "",
        descricao: aula.descricao || "",
        professor_id: aula.professor_id || "",
        turma_id: aula.turma_id || "",
        data: aula.data || "",
        horario_inicio: aula.horario_inicio || "",
        horario_fim: aula.horario_fim || "",
        local: aula.local || "",
        status: aula.status || "agendada",
        pdf_url: aula.pdf_url || null,
      });
    } else {
      setFormData({
        titulo: "",
        descricao: "",
        professor_id: "",
        turma_id: "",
        data: "",
        horario_inicio: "",
        horario_fim: "",
        local: "",
        status: "agendada",
        pdf_url: null,
      });
      setPdfFiles([]);
    }
  }, [aula]);

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    for (const file of files) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Erro",
          description: `${file.name}: Por favor, selecione um arquivo PDF ou uma imagem (JPG, PNG, GIF, WEBP).`,
          variant: "destructive",
        });
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: `${file.name}: O arquivo deve ter no máximo 10MB.`,
          variant: "destructive",
        });
        continue;
      }
    }
    
    const validFiles = files.filter(file => {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      return allowedTypes.includes(file.type) && file.size <= 10 * 1024 * 1024;
    });
    
    setPdfFiles(prev => [...prev, ...validFiles]);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setPdfFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let pdfUrls: string[] = [];
      let uploadedFileNames: string[] = [];

      // Upload PDFs if there are files selected
      if (pdfFiles.length > 0) {
        setUploadingPdf(true);
        
        for (const file of pdfFiles) {
          const fileExt = file.name.split('.').pop();
          const uploadedFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('aula-pdfs')
            .upload(`temp/${uploadedFileName}`, file);

          if (uploadError) throw uploadError;
          
          pdfUrls.push(`temp/${uploadedFileName}`);
          uploadedFileNames.push(uploadedFileName);
        }
      }

      // Combinar URLs existentes com novas (se editando)
      let finalPdfUrl = pdfUrls.length > 0 ? pdfUrls.join(',') : formData.pdf_url;

      const aulaData = {
        titulo: formData.titulo,
        descricao: formData.descricao || null,
        professor_id: formData.professor_id,
        turma_id: formData.turma_id,
        data: formData.data,
        horario_inicio: formData.horario_inicio,
        horario_fim: formData.horario_fim,
        local: formData.local || null,
        status: formData.status,
        pdf_url: finalPdfUrl,
      };

      if (aula) {
        // Update existing aula
        await updateAula(aula.id, aulaData);
        
        // Move PDFs to proper folder if uploaded
        if (pdfFiles.length > 0 && uploadedFileNames.length > 0) {
          const newFileNames: string[] = [];
          
          for (let i = 0; i < uploadedFileNames.length; i++) {
            const newFileName = `${aula.id}/${uploadedFileNames[i]}`;
            
            await supabase.storage
              .from('aula-pdfs')
              .move(pdfUrls[i], newFileName);
            
            newFileNames.push(newFileName);
          }

          // Combinar com URLs existentes
          const existingUrls = formData.pdf_url ? formData.pdf_url.split(',') : [];
          const allUrls = [...existingUrls, ...newFileNames].join(',');

          // Update aula with correct paths
          await supabase
            .from('aulas_agendadas')
            .update({ pdf_url: allUrls })
            .eq('id', aula.id);
        }
      } else {
        // Create new aula
        const newAula = await createAula(aulaData);

        // Move PDFs to proper folder if uploaded
        if (pdfFiles.length > 0 && newAula && uploadedFileNames.length > 0) {
          const newFileNames: string[] = [];
          
          for (let i = 0; i < uploadedFileNames.length; i++) {
            const newFileName = `${newAula.id}/${uploadedFileNames[i]}`;
            
            await supabase.storage
              .from('aula-pdfs')
              .move(pdfUrls[i], newFileName);
            
            newFileNames.push(newFileName);
          }

          // Update aula with correct paths
          await supabase
            .from('aulas_agendadas')
            .update({ pdf_url: newFileNames.join(',') })
            .eq('id', newAula.id);
        }
      }
      
      // Reset form
      setFormData({
        titulo: "",
        descricao: "",
        professor_id: "",
        turma_id: "",
        data: "",
        horario_inicio: "",
        horario_fim: "",
        local: "",
        status: "agendada",
        pdf_url: null,
      });
      setPdfFiles([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar aula:', error);
      toast({
        title: "Erro",
        description: `Não foi possível ${aula ? 'atualizar' : 'criar'} a aula. Tente novamente.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploadingPdf(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{aula ? "Editar Aula" : "Nova Aula"}</DialogTitle>
          <DialogDescription>
            {aula ? "Edite as informações da aula." : "Agende uma nova aula no sistema."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título da Aula *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ex: Introdução à Comunicação"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descrição da aula..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="professor_id">Professor *</Label>
              <Select 
                value={formData.professor_id} 
                onValueChange={(value) => setFormData({ ...formData, professor_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um professor" />
                </SelectTrigger>
                <SelectContent>
                  {professores.map((professor) => (
                    <SelectItem key={professor.id} value={professor.id}>
                      {professor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="turma_id">Turma *</Label>
              <Select 
                value={formData.turma_id} 
                onValueChange={(value) => setFormData({ ...formData, turma_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma turma" />
                </SelectTrigger>
                <SelectContent>
                  {turmas.map((turma) => (
                    <SelectItem key={turma.id} value={turma.id}>
                      {turma.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data">Data da Aula *</Label>
            <Input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="horario_inicio">Horário de Início *</Label>
              <Input
                id="horario_inicio"
                type="time"
                value={formData.horario_inicio}
                onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="horario_fim">Horário de Fim *</Label>
              <Input
                id="horario_fim"
                type="time"
                value={formData.horario_fim}
                onChange={(e) => setFormData({ ...formData, horario_fim: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="local">Local</Label>
            <Input
              id="local"
              value={formData.local}
              onChange={(e) => setFormData({ ...formData, local: e.target.value })}
              placeholder="Ex: Sala 101, Online, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => 
                setFormData({ ...formData, status: value as "agendada" | "em-andamento" | "concluida" | "cancelada" })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agendada">Agendada</SelectItem>
                <SelectItem value="em-andamento">Em Andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdf">Materiais da Aula (PDF ou Imagem)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="pdf"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                onChange={handlePdfChange}
                className="hidden"
                multiple
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('pdf')?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Adicionar Arquivos ({pdfFiles.length})
              </Button>
            </div>
            {pdfFiles.length > 0 && (
              <div className="space-y-2">
                {pdfFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between gap-2 p-2 bg-muted rounded-md">
                    <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{file.name}</span>
                      <span className="text-muted-foreground flex-shrink-0">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : aula ? "Atualizar Aula" : "Salvar Aula"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}