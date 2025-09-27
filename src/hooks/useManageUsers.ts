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
      
      // Fetch users from profiles table and their roles from user_roles table separately
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles for all users
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine profiles with roles data
      const usersWithRoles = profilesData.map(profile => {
        const userRole = rolesData.find(role => role.user_id === profile.user_id);
        return {
          id: profile.user_id,
          user_id: profile.user_id,
          full_name: profile.full_name || 'Usuário sem nome',
          email: '', // We'll need to get this from auth.users if needed
          user_role: userRole?.role || 'inactive',
          created_at: profile.created_at,
        };
      });

      // Also include users who have roles but no profiles
      const usersWithoutProfiles = rolesData
        .filter(role => !profilesData.find(profile => profile.user_id === role.user_id))
        .map(role => ({
          id: role.user_id,
          user_id: role.user_id,
          full_name: 'Usuário sem perfil',
          email: '',
          user_role: role.role,
          created_at: new Date().toISOString(),
        }));

      const allUsers = [...usersWithRoles, ...usersWithoutProfiles];
      setUsers(allUsers);
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
      
      // For now, we'll remove the user's role instead of deleting from auth
      // since frontend can't delete auth users directly
      const { error } = await supabase
        .from('user_roles')
        .delete()
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
        .from('user_roles')
        .insert([
          { user_id: userId, role: newRole as 'admin' | 'professor' | 'aluno' }
        ]);

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