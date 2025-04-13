import { useState, useEffect, useCallback } from 'react'; 
import { useApiClient } from '../useApiClient'; 
import { UserResponse } from '../../api/models'; 

interface UseUsersResult { 
  users: UserResponse[]; 
  students: UserResponse[]; 
  
  isLoading: boolean; 
  error: string | null; 
  
  refreshUsers: () => Promise<UserResponse[]>; 
  
  getUserById: (userId: number) => UserResponse | undefined; 
}

export const useUsers = (): UseUsersResult => { 
  const apiClient = useApiClient(); 
  
  const [users, setUsers] = useState<UserResponse[]>([]); 
  const [students, setStudents] = useState<UserResponse[]>([]); 
  
  const [isLoading, setIsLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null); 
  
  const refreshUsers = useCallback(async () => { 
    setIsLoading(true); 
    try {
      const data = await apiClient.users.getUsers(); 
      
      if (!data) { 
        setError('No data returned from API'); 
        return []; 
      }
      
      if (!Array.isArray(data)) { 
        setError('Invalid data format returned from API'); 
        return []; 
      }
      
      setUsers(data); 
      
      const filteredStudents = data; 
      
      setStudents(filteredStudents); 
      
      setError(null); 
      return data; 
    } catch (err) { 
      setError('Failed to load users'); 
      return []; 
    } finally {
      setIsLoading(false); 
    }
  }, [apiClient.users]); 
  
  const getUserById = useCallback((userId: number): UserResponse | undefined => { 
    return users.find(user => user.userId === userId); 
  }, [users]); 
  
  useEffect(() => { 
    refreshUsers(); 
  }, [refreshUsers]); 
  
  return { 
    users, 
    students, 
    
    isLoading, 
    error, 
    
    refreshUsers, 
    
    getUserById 
  };
}; 