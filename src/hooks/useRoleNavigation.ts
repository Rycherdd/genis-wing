import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface NavigationItem {
  label: string;
  icon: string;
  url?: string;
  subItems?: NavigationItem[];
}

export function useRoleNavigation() {
  const { userRole, loading } = useAuth();

  const getNavigationItems = (): NavigationItem[] => {
    if (userRole === 'aluno') {
      return [
        { label: 'Meu Progresso', icon: 'CheckCircle', url: '/meu-progresso' },
        { label: 'Gamificação', icon: 'Trophy', url: '/gamificacao' },
        { label: 'Conteúdos Complementares', icon: 'BookOpen', url: '/conteudos' },
        { label: 'Próximas Aulas', icon: 'Calendar', url: '/aulas-aluno' },
        { label: 'Minhas Presenças', icon: 'CheckSquare', url: '/minhas-presencas' },
        { label: 'Turmas', icon: 'Users', url: '/turmas-aluno' },
        { label: 'Formulários', icon: 'FileText', url: '/formularios-aluno' },
        { label: 'Avisos', icon: 'Bell', url: '/avisos' },
      ];
    }
    
    if (userRole === 'professor') {
      return [
        { label: 'Dashboard', icon: 'Home', url: '/' },
        { label: 'Alunos', icon: 'Users', url: '/alunos' },
        { label: 'Gerenciar Turmas', icon: 'BookOpen', url: '/turmas' },
        { label: 'Visualizar Turmas', icon: 'GraduationCap', url: '/turmas-aluno' },
        { label: 'Aulas', icon: 'Calendar', url: '/aulas' },
        { label: 'Presença', icon: 'CheckSquare', url: '/presenca' },
        { label: 'Formulários', icon: 'FileText', url: '/formularios' },
        { label: 'Conteúdos', icon: 'BookOpen', url: '/gerenciar-conteudos' },
        { label: 'Gamificação', icon: 'Trophy', url: '/gamificacao' },
        { label: 'Agenda', icon: 'CalendarDays', url: '/agenda' },
        { label: 'Avisos', icon: 'Bell', url: '/avisos' },
      ];
    }
    
    if (userRole === 'admin') {
      return [
        { label: 'Dashboard', icon: 'Home', url: '/' },
        { 
          label: 'Gestão de Usuários', 
          icon: 'UserCog',
          subItems: [
            { label: 'Gerenciar Usuários', icon: 'Settings', url: '/gerenciar-usuarios' },
            { label: 'Gerenciar Convites', icon: 'Mail', url: '/gerenciar-convites' },
            { label: 'Mentores', icon: 'Users', url: '/professores' },
            { label: 'Alunos', icon: 'Users', url: '/alunos' },
          ]
        },
        { 
          label: 'Gestão de Turmas', 
          icon: 'GraduationCap',
          subItems: [
            { label: 'Gerenciar Turmas', icon: 'BookOpen', url: '/turmas' },
            { label: 'Visualizar Turmas', icon: 'GraduationCap', url: '/turmas-aluno' },
            { label: 'Aulas', icon: 'Calendar', url: '/aulas' },
            { label: 'Presença', icon: 'CheckSquare', url: '/presenca' },
          ]
        },
        { 
          label: 'Conteúdo', 
          icon: 'BookOpen',
          subItems: [
            { label: 'Formulários', icon: 'FileText', url: '/formularios' },
            { label: 'Conteúdos', icon: 'BookOpen', url: '/gerenciar-conteudos' },
            { label: 'Gamificação', icon: 'Trophy', url: '/gamificacao' },
          ]
        },
        { 
          label: 'Comunicação', 
          icon: 'Bell',
          subItems: [
            { label: 'Agenda', icon: 'CalendarDays', url: '/agenda' },
            { label: 'Avisos', icon: 'Bell', url: '/avisos' },
          ]
        },
      ];
    }
    
    return [];
  };

  return {
    navigationItems: getNavigationItems(),
    userRole,
    loading
  };
}