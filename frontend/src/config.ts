import { Configuration } from './api/runtime'; 

export const API_CONFIG = { 
  basePath: import.meta.env.VITE_API_URL || 'http://localhost:8000', 
};

export const createConfig = (token?: string | null): Configuration => { 
  const options: { 
    basePath: string; 
    accessToken?: string; 
  } = {
    basePath: API_CONFIG.basePath, 
  };
  
  if (token) { 
    options.accessToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`; 
  }
  
  return new Configuration(options); 
};

export const createBaseConfig = (): Configuration => createConfig(); 
export const createAuthConfig = (token: string): Configuration => createConfig(token); 