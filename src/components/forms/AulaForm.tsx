import { useState } from "react";
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
}

export function AulaForm({ open, onOpenChange }: AulaFormProps) {
  const { createAula } = useAulas();
  const { professores } = useProfessores();
  const { turmas } = useTurmas();
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
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

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Erro",
          description: "Por favor, selecione apenas arquivos PDF.",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "Erro",
          description: "O arquivo deve ter no máximo 10MB.",
          variant: "destructive",
        });
        return;
      }
      setPdfFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let pdfUrl = formData.pdf_url;
      let uploadedFileName = '';

      // Upload PDF if there's a file selected
      if (pdfFile) {
        setUploadingPdf(true);
        const fileExt = pdfFile.name.split('.').pop();
        uploadedFileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('aula-pdfs')
          .upload(`temp/${uploadedFileName}`, pdfFile);

        if (uploadError) throw uploadError;
        
        pdfUrl = `temp/${uploadedFileName}`;
      }

      const newAula = await createAula({
        titulo: formData.titulo,
        descricao: formData.descricao || null,
        professor_id: formData.professor_id,
        turma_id: formData.turma_id,
        data: formData.data,
        horario_inicio: formData.horario_inicio,
        horario_fim: formData.horario_fim,
        local: formData.local || null,
        status: formData.status,
        pdf_url: pdfUrl,
      });

      // Move PDF to proper folder if uploaded
      if (pdfFile && newAula && pdfUrl && uploadedFileName) {
        const newFileName = `${newAula.id}/${uploadedFileName}`;
        
        await supabase.storage
          .from('aula-pdfs')
          .move(pdfUrl, newFileName);

        // Update aula with correct path
        await supabase
          .from('aulas_agendadas')
          .update({ pdf_url: newFileName })
          .eq('id', newAula.id);
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
      setPdfFile(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao criar aula:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a aula. Tente novamente.",
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
          <DialogTitle>Nova Aula</DialogTitle>
          <DialogDescription>
            Agende uma nova aula no sistema.
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
            <Label htmlFor="pdf">Material da Aula (PDF)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="pdf"
                type="file"
                accept=".pdf"
                onChange={handlePdfChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('pdf')?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {pdfFile ? pdfFile.name : "Selecionar PDF"}
              </Button>
              {pdfFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setPdfFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {pdfFile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Aula"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}