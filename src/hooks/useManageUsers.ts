import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  full_name: string;
  user_role: string;
  created_at: string;
  status?: 'active' | 'inactive';
}

interface CreateUserData {
  email: string;
  password: string;
  fullName: string;
  userRole: string;
}

export function useManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUsers = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch users directly from profiles table since we have proper RLS policies
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, user_role, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Format the data to match our User interface
      const formattedUsers = data.map(profile => ({
        id: profile.user_id,
        email: 'N/A', // We can't access auth.users directly from frontend
        full_name: profile.full_name || 'N/A',
        user_role: profile.user_role || 'user',
        created_at: profile.created_at,
        status: 'active' as const // Default to active
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!user) return;

    try {
      setActionLoading(userId);
      
      // For now, we'll update the profile status instead of deleting from auth
      // since frontend can't delete auth users directly
      const { error } = await supabase
        .from('profiles')
        .update({ user_role: 'inactive' })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário desativado com sucesso!",
      });

      // Refresh the users list
      await fetchUsers();
      
      return { success: true };
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast({
        title: "Erro",
        description: "Não foi possível desativar o usuário.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setActionLoading(null);
    }
  };

  const activateUser = async (userId: string, newRole: string = 'user') => {
    if (!user) return;

    try {
      setActionLoading(userId);
      
      const { error } = await supabase
        .from('profiles')
        .update({ user_role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário ativado com sucesso!",
      });

      // Refresh the users list
      await fetchUsers();
      
      return { success: true };
    } catch (error) {
      console.error('Error activating user:', error);
      toast({
        title: "Erro",
        description: "Não foi possível ativar o usuário.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setActionLoading(null);
    }
  };

  const createUser = async (userData: CreateUserData) => {
    if (!user) return;

    try {
      setActionLoading('creating');
      
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'create',
          userData: userData
        },
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Usuário ${userData.email} criado com sucesso!`,
      });

      // Refresh the users list
      await fetchUsers();
      
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o usuário.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setActionLoading(null);
    }
  };

  // Add useEffect to fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, [user]);

  return {
    users,
    loading,
    actionLoading,
    deleteUser,
    activateUser,
    createUser,
    refetch: fetchUsers,
  };
}