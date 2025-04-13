import { useState, useEffect, useCallback } from 'react'; 
import { useApiClient } from '../useApiClient'; 
import { 
  TaskResponse, 
  TaskCreate, 
  TaskUpdate 
} from '../../api/models'; 

interface UseTasksResult { 
  tasks: TaskResponse[]; 
  isLoading: boolean; 
  error: string | null; 
  
  refreshTasks: () => Promise<TaskResponse[]>; 
  
  createTask: (taskData: TaskCreate) => Promise<TaskResponse>; 
  updateTask: (taskId: number, taskData: TaskUpdate) => Promise<void>; 
  deleteTask: (taskId: number) => Promise<void>; 
  getTasksByCourseId: (courseId: number) => TaskResponse[]; 
}

export const useTasks = (): UseTasksResult => { 
  const apiClient = useApiClient(); 
  
  const [tasks, setTasks] = useState<TaskResponse[]>([]); 
  
  const [isLoading, setIsLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null); 
  
  const refreshTasks = useCallback(async () => { 
    setIsLoading(true); 
    try {
      const data = await apiClient.tasks.getTasks(); 
      setTasks(data); 
      setError(null); 
      return data; 
    } catch (err) { 
      console.error('Error fetching tasks:', err); 
      setError('Failed to load tasks'); 
      return []; 
    } finally {
      setIsLoading(false); 
    }
  }, [apiClient.tasks]); 
  
  const createTask = useCallback(async (taskData: TaskCreate): Promise<TaskResponse> => { 
    try {
      const newTask = await apiClient.tasks.createTasks({ 
        taskCreate: taskData 
      });
      
      setTasks(prevTasks => [...prevTasks, newTask]); 
      
      return newTask; 
    } catch (err) { 
      console.error('Error creating task:', err); 
      setError('Failed to create task'); 
      throw err; 
    }
  }, [apiClient.tasks]); 

  const updateTask = useCallback(async (taskId: number, taskData: TaskUpdate): Promise<void> => { 
    try {
      await apiClient.tasks.updateTask({ 
        taskId, 
        taskUpdate: taskData 
      });
      
      await refreshTasks(); 
    } catch (err) { 
      console.error('Error updating task:', err); 
      setError('Failed to update task'); 
      throw err; 
    }
  }, [apiClient.tasks, refreshTasks]); 

  const deleteTask = useCallback(async (taskId: number): Promise<void> => { 
    try {
      await apiClient.tasks.deleteTask({ 
        taskId 
      });
      
      setTasks(prevTasks => 
        prevTasks.filter(task => task.taskId !== taskId) 
      );
    } catch (err) { 
      console.error('Error deleting task:', err); 
      setError('Failed to delete task'); 
      throw err; 
    }
  }, [apiClient.tasks]); 

  const getTasksByCourseId = useCallback((courseId: number): TaskResponse[] => { 
    return tasks.filter(task => task.courseId === courseId); 
  }, [tasks]); 
  
  useEffect(() => { 
    refreshTasks(); 
  }, [refreshTasks]); 
  
  return { 
    tasks, 
    
    isLoading, 
    error, 
    
    refreshTasks, 
    
    createTask, 
    updateTask, 
    deleteTask, 
    getTasksByCourseId 
  };
};