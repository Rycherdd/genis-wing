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
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user role from user_roles table
        if (session?.user) {
          setTimeout(async () => {
            try {
              const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .maybeSingle();
              
              console.log('Role check result:', { data, error, userId: session.user.id });
              
              // Se não encontrou role, usuário foi desativado - fazer logout
              if (!data) {
                console.log('❌ Usuário sem role ativa, fazendo logout...');
                await supabase.auth.signOut();
                setUserRole(null);
                setUser(null);
                setSession(null);
                toast({
                  title: "Acesso revogado",
                  description: "Sua conta foi desativada.",
                  variant: "destructive",
                });
              } else {
                console.log('✅ Usuário com role:', data.role);
                setUserRole(data.role);
              }
            } catch (error) {
              console.error('Error fetching user role:', error);
              await supabase.auth.signOut();
              setUserRole(null);
              setUser(null);
              setSession(null);
            }
          }, 0);
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session and check role
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Verificar role na inicialização
      if (session?.user) {
        try {
          const { data } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          console.log('Initial role check:', { data, userId: session.user.id });
          
          // Se não encontrou role, usuário foi desativado - fazer logout
          if (!data) {
            console.log('❌ Usuário sem role ativa na inicialização, fazendo logout...');
            await supabase.auth.signOut();
            setUserRole(null);
            setUser(null);
            setSession(null);
            toast({
              title: "Acesso revogado",
              description: "Sua conta foi desativada.",
              variant: "destructive",
            });
          } else {
            console.log('✅ Usuário inicializado com role:', data.role);
            setUserRole(data.role);
          }
        } catch (error) {
          console.error('Error fetching user role on init:', error);
          await supabase.auth.signOut();
          setUserRole(null);
          setUser(null);
          setSession(null);
        }
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

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