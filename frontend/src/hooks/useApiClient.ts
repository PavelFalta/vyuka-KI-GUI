import { useAuth } from '../context/AuthContext'; 
import { createAuthConfig, createBaseConfig } from '../config'; 
import { 
  AuthApi, 
  CategoriesApi, 
  CoursesApi, 
  EnrollmentsApi, 
  RolesApi, 
  TaskCompletionApi, 
  TasksApi, 
  UsersApi 
} from '../api/apis'; 
import { useMemo } from 'react'; 

export const useApiClient = () => {
  const { token } = useAuth(); 
  
  return useMemo(() => { 
    const config = token ? createAuthConfig(token) : createBaseConfig(); 
    
    return { 
      auth: new AuthApi(config), 
      categories: new CategoriesApi(config), 
      courses: new CoursesApi(config), 
      enrollments: new EnrollmentsApi(config), 
      roles: new RolesApi(config), 
      taskCompletions: new TaskCompletionApi(config), 
      tasks: new TasksApi(config), 
      users: new UsersApi(config), 
    };
  }, [token]); 
}; 