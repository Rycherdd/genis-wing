import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trash2, UserPlus } from "lucide-react";
import { useAlunos } from "@/hooks/useAlunos";
import { useMatriculas } from "@/hooks/useMatriculas";
import { MatriculaForm } from "./MatriculaForm";

interface GerenciarAlunosFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turmaId: string;
  turmaNome: string;
}

export function GerenciarAlunosForm({ open, onOpenChange, turmaId, turmaNome }: GerenciarAlunosFormProps) {
  const { alunos } = useAlunos();
  const { matriculas, deleteMatricula } = useMatriculas();
  const [matriculaFormOpen, setMatriculaFormOpen] = useState(false);

  // Buscar alunos matriculados nesta turma
  const matriculasDesturma = matriculas.filter(m => m.turma_id === turmaId);
  const alunosMatriculados = alunos.filter(aluno => 
    matriculasDesturma.some(m => m.aluno_id === aluno.id)
  );

  const handleRemoverMatricula = async (alunoId: string) => {
    const matricula = matriculasDesturma.find(m => m.aluno_id === alunoId);
    if (matricula) {
      await deleteMatricula(matricula.id);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Gerenciar Alunos - {turmaNome}</DialogTitle>
            <DialogDescription>
              Visualize e gerencie os alunos matriculados nesta turma.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {alunosMatriculados.length} alunos matriculados
                </Badge>
              </div>
              <Button 
                onClick={() => setMatriculaFormOpen(true)}
                size="sm"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Aluno
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {alunosMatriculados.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum aluno matriculado nesta turma.</p>
                  <p className="text-sm">Clique em "Adicionar Aluno" para começar.</p>
                </div>
              ) : (
                alunosMatriculados.map((aluno) => (
                  <div key={aluno.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {aluno.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{aluno.nome}</p>
                        <p className="text-sm text-muted-foreground">{aluno.email}</p>
                        {aluno.telefone && (
                          <p className="text-xs text-muted-foreground">{aluno.telefone}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoverMatricula(aluno.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <MatriculaForm 
        open={matriculaFormOpen}
        onOpenChange={setMatriculaFormOpen}
        turmaId={turmaId}
        turmaNome={turmaNome}
      />
    </>
  );
}