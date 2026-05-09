import { createContext, useState, type PropsWithChildren } from 'react';
import { login as loginRequest } from '../api/authApi';
import type { AuthRole, AuthSession } from '../types/auth';
import { clearSession, loadSession, saveSession } from '../utils/authStorage';

type AuthContextValue = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  login: (role: AuthRole, email: string, password: string) => Promise<AuthSession>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(() => loadSession());

  async function login(role: AuthRole, email: string, password: string) {
    const nextSession = await loginRequest(role, {
      user: email,
      password,
    });

    setSession(nextSession);
    saveSession(nextSession);
    return nextSession;
  }

  function logout() {
    setSession(null);
    clearSession();
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: Boolean(session?.accessToken),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
