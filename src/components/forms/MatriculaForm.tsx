import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { useAlunosUnificado } from "@/hooks/useAlunosUnificado";
import { useMatriculas } from "@/hooks/useMatriculas";

interface MatriculaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turmaId: string;
  turmaNome: string;
}

export function MatriculaForm({ open, onOpenChange, turmaId, turmaNome }: MatriculaFormProps) {
  const { alunos } = useAlunosUnificado();
  const { createMatricula, matriculas } = useMatriculas();
  const [loading, setLoading] = useState(false);
  const [selectedAlunoId, setSelectedAlunoId] = useState("");

  console.log('MatriculaForm: Dados carregados', { 
    alunos: alunos.length, 
    matriculas: matriculas.length, 
    turmaId, 
    turmaNome 
  });

  // Filtrar alunos que já estão matriculados nesta turma
  const alunosMatriculados = matriculas
    .filter(m => m.turma_id === turmaId)
    .map(m => m.aluno_id);
  
  const alunosDisponiveis = alunos.filter(aluno => 
    !alunosMatriculados.includes(aluno.id)
  );

  console.log('MatriculaForm: Filtros aplicados', { 
    alunosMatriculados, 
    alunosDisponiveis: alunosDisponiveis.length 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit: Iniciado', { selectedAlunoId, turmaId });
    
    if (!selectedAlunoId) {
      console.log('handleSubmit: Nenhum aluno selecionado');
      return;
    }
    
    setLoading(true);

    try {
      console.log('handleSubmit: Chamando createMatricula');
      await createMatricula(selectedAlunoId, turmaId);
      console.log('handleSubmit: Matrícula criada com sucesso');
      setSelectedAlunoId("");
      onOpenChange(false);
    } catch (error) {
      console.error('handleSubmit: Erro ao matricular aluno:', error);
      alert('Erro ao matricular aluno: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Matricular Aluno</DialogTitle>
          <DialogDescription>
            Matricule um aluno na turma "{turmaNome}".
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aluno">Selecione o Aluno *</Label>
            <Select 
              value={selectedAlunoId} 
              onValueChange={setSelectedAlunoId}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Escolha um aluno" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                {alunosDisponiveis.map((aluno) => (
                  <SelectItem key={aluno.id} value={aluno.id} className="hover:bg-muted">
                    <div className="flex flex-col">
                      <span>{aluno.nome}</span>
                      <span className="text-xs text-muted-foreground">
                        {aluno.email} • {aluno.tipo === 'convite' ? 'Via Convite' : 'Cadastrado'}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {alunosDisponiveis.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Todos os alunos já estão matriculados nesta turma.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !selectedAlunoId || alunosDisponiveis.length === 0}
            >
              {loading ? "Matriculando..." : "Matricular Aluno"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}