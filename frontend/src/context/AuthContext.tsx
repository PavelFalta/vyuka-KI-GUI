import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthApi } from '../api/apis/AuthApi';
import { createAuthConfig, createBaseConfig } from '../config';
import { UserResponse } from '../api/models';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserResponse | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }
    
    setToken(storedToken);
    setIsAuthenticated(true);
    
    const authApi = new AuthApi(createAuthConfig(storedToken));
    authApi.readUsersMeAuthUsersMeGet()
      .then(userData => {
        setUser(userData);
        setIsLoading(false);
      })
      .catch(() => {
        logout();
      });
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    
    try {
      const authApi = new AuthApi(createBaseConfig());
      const response = await authApi.loginForAccessTokenAuthTokenPost({ username, password });
      const accessToken = response.accessToken;
      
      localStorage.setItem('token', accessToken);
      setToken(accessToken);
      setIsAuthenticated(true);
      
      const userApi = new AuthApi(createAuthConfig(accessToken));
      const userData = await userApi.readUsersMeAuthUsersMeGet();
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    token,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};