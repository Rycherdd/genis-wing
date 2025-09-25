import { useState } from "react";
import { Mail, Send, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useConvites } from "@/hooks/useConvites";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Email inválido"),
  role: z.enum(['aluno', 'professor'], { required_error: "Selecione um tipo" }),
});

interface ConviteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultRole?: 'aluno' | 'professor';
}

export function ConviteForm({ open, onOpenChange, defaultRole }: ConviteFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>(defaultRole || "");
  const [loading, setLoading] = useState(false);
  const { sendInvite } = useConvites();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = inviteSchema.parse({ email, role });
      setLoading(true);

      const userName = user?.user_metadata?.full_name || user?.email || "Sistema";
      
      await sendInvite(validatedData.email, validatedData.role, userName);
      
      // Reset form
      setEmail("");
      setRole(defaultRole || "");
      onOpenChange(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Convidar {role === 'aluno' ? 'Aluno' : role === 'professor' ? 'Professor' : 'Usuário'}
          </DialogTitle>
          <DialogDescription>
            Envie um convite por email para um novo {role === 'aluno' ? 'aluno' : role === 'professor' ? 'professor' : 'usuário'}.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Digite o email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Tipo</Label>
            <Select value={role} onValueChange={setRole} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aluno">Aluno</SelectItem>
                <SelectItem value="professor">Professor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !email || !role}>
              <Send className="h-4 w-4 mr-2" />
              {loading ? "Enviando..." : "Enviar Convite"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}