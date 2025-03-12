import React, { createContext, useState, useEffect, useContext } from 'react';
import { User } from '../types';
import { getCurrentUser, login, logout } from '../services/auth';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (cpf: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const updateUser = async (): Promise<void> => {
    try {
      const updatedUser = await getCurrentUser();
      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
    }
  };

  useEffect(() => {
    async function loadStorageData() {
      try {
        const user = await getCurrentUser();

        if (user) {
          setUser(user);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();
  }, []);

  const signIn = async (cpf: string, password: string): Promise<boolean> => {
    try {
      const user = await login(cpf, password);

      if (user) {
        setUser(user);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return false;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signOut, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}
