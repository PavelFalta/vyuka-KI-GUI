import { useState, useEffect, useCallback } from 'react'; 
import { useApiClient } from '../useApiClient'; 
import { useAuth } from '../../context/AuthContext'; 
import { 
  TaskCompletionResponse
} from '../../api/models'; 

interface UseTaskCompletionsResult { 
  taskCompletions: TaskCompletionResponse[]; 
  isLoading: boolean; 
  error: string | null; 
  
  refreshTaskCompletions: () => Promise<TaskCompletionResponse[]>; 
  
  completeTask: (taskId: number, enrollmentId: number) => Promise<boolean>; 
  approveTask: (taskCompletionId: number) => Promise<boolean>; 
}

export const useTaskCompletions = (): UseTaskCompletionsResult => { 
  const apiClient = useApiClient(); 
  const { user } = useAuth(); 
  
  const [taskCompletions, setTaskCompletions] = useState<TaskCompletionResponse[]>([]); 
  
  const [isLoading, setIsLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null); 
  
  const refreshTaskCompletions = useCallback(async () => { 
    if (!user) return []; 
    
    setIsLoading(true); 
    try {
      const data = await apiClient.taskCompletions.getTaskCompletions(); 
      setTaskCompletions(data); 
      setError(null); 
      return data; 
    } catch (err) { 
      console.error('Error fetching task completions:', err); 
      setError('Failed to load task completions'); 
      return []; 
    } finally {
      setIsLoading(false); 
    }
  }, [apiClient.taskCompletions, user]); 
  
  const completeTask = useCallback(async (taskId: number, enrollmentId: number): Promise<boolean> => { 
    if (!user) return false; 
    
    try {
      console.log(`Completing task ${taskId} for enrollment ${enrollmentId}`); 
      
      await apiClient.taskCompletions.createTaskCompletion({ 
        taskCompletionCreate: { 
          enrollmentId, 
          taskId, 
          isActive: false, 
          completedAt: null 
        }
      });
      
      await refreshTaskCompletions(); 
      return true; 
    } catch (err) { 
      console.error('Error completing task:', err); 
      setError('Failed to complete task'); 
      return false; 
    }
  }, [user, apiClient.taskCompletions, refreshTaskCompletions]); 
  
  const approveTask = useCallback(async (taskCompletionId: number): Promise<boolean> => { 
    try {
      console.log(`Attempting to approve task completion: ${taskCompletionId}`); 

      const completion = taskCompletions.find(tc => tc.taskCompletionId === taskCompletionId); 
      if (!completion) { 
        console.error(`Task completion with ID ${taskCompletionId} not found`); 
        return false; 
      }
      
      console.log(`Found task completion:`, completion); 
      
      await apiClient.taskCompletions.updateTaskCompletion({ 
        taskCompletionId, 
        taskCompletionCreate: { 
          enrollmentId: completion.enrollmentId, 
          taskId: completion.taskId, 
          isActive: true, 
          completedAt: new Date() 
        }
      });
      
      await refreshTaskCompletions(); 
      return true; 
    } catch (err) { 
      console.error('Error approving task:', err); 
      setError('Failed to approve task'); 
      return false; 
    }
  }, [taskCompletions, apiClient.taskCompletions, refreshTaskCompletions]); 
  
  useEffect(() => { 
    refreshTaskCompletions(); 
  }, [refreshTaskCompletions]); 
  
  return { 
    taskCompletions, 
    isLoading, 
    error, 
    
    refreshTaskCompletions, 
    completeTask, 
    approveTask
  };
};