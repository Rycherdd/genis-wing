import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: 'admin' | 'professor' | 'aluno' | null;
  isAdmin: boolean;
  isProfessor: boolean;
  isAluno: boolean;
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'professor' | 'aluno' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user role from user_roles table
        if (session?.user) {
          setTimeout(async () => {
            try {
              const { data } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .single();
              setUserRole(data?.role || null);
            } catch (error) {
              console.error('Error fetching user role:', error);
              setUserRole(null);
            }
          }, 0);
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: string = 'professor') => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });
      
      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu email para confirmar a conta.",
        });
      }
      
      return { error };
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive",
        });
      }
      
      return { error };
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Erro ao sair",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isAdmin = userRole === 'admin';
  const isProfessor = userRole === 'professor';
  const isAluno = userRole === 'aluno';

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      userRole,
      isAdmin,
      isProfessor,
      isAluno,
      signUp,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}