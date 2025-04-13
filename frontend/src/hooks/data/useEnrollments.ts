import { useState, useEffect, useCallback } from 'react'; 
import { useApiClient } from '../useApiClient'; 
import { useAuth } from '../../context/AuthContext'; 
import { 
  EnrollmentResponse,
  EnrollmentCreate
} from '../../api/models'; 

interface UseEnrollmentsResult { 
  enrollments: EnrollmentResponse[]; 
  isLoading: boolean; 
  error: string | null; 
  
  refreshEnrollments: () => Promise<EnrollmentResponse[]>; 
  
  createEnrollment: (enrollmentData: EnrollmentCreate) => Promise<EnrollmentResponse>; 
  updateEnrollment: (enrollmentId: number, enrollmentData: any) => Promise<void>; 
  deleteEnrollment: (enrollmentId: number) => Promise<void>; 
  
  getUserEnrollments: () => EnrollmentResponse[]; 
  getEnrollmentsByCourseId: (courseId: number) => EnrollmentResponse[]; 
}

export const useEnrollments = (): UseEnrollmentsResult => { 
  const apiClient = useApiClient(); 
  const { user } = useAuth(); 
  
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]); 
  
  const [isLoading, setIsLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null); 
  
  const refreshEnrollments = useCallback(async () => { 
    setIsLoading(true); 
    try {
      const data = await apiClient.enrollments.getEnrollments(); 
      setEnrollments(data); 
      setError(null); 
      return data; 
    } catch (err) { 
      console.error('Error fetching enrollments:', err); 
      setError('Failed to load enrollments'); 
      return []; 
    } finally {
      setIsLoading(false); 
    }
  }, [apiClient.enrollments]); 
  
  const createEnrollment = useCallback(async (enrollmentData: EnrollmentCreate): Promise<EnrollmentResponse> => { 
    try {
      const newEnrollment = await apiClient.enrollments.createEnrollment({ 
        enrollmentCreate: enrollmentData 
      });
      
      setEnrollments(prevEnrollments => [...prevEnrollments, newEnrollment]); 
      
      return newEnrollment; 
    } catch (err) { 
      console.error('Error creating enrollment:', err); 
      setError('Failed to create enrollment'); 
      throw err; 
    }
  }, [apiClient.enrollments]); 

  const updateEnrollment = useCallback(async (enrollmentId: number, enrollmentData: any): Promise<void> => { 
    try {
      await apiClient.enrollments.updateEnrollment({ 
        enrollmentId, 
        enrollmentUpdate: enrollmentData 
      });
      
      await refreshEnrollments(); 
    } catch (err) { 
      console.error('Error updating enrollment:', err); 
      setError('Failed to update enrollment'); 
      throw err; 
    }
  }, [apiClient.enrollments, refreshEnrollments]); 

  const deleteEnrollment = useCallback(async (enrollmentId: number): Promise<void> => { 
    try {
      await apiClient.enrollments.deleteEnrollment({ 
        enrollmentId 
      });
      
      setEnrollments(prevEnrollments => 
        prevEnrollments.filter(enrollment => enrollment.enrollmentId !== enrollmentId) 
      );
    } catch (err) { 
      console.error('Error deleting enrollment:', err); 
      setError('Failed to delete enrollment'); 
      throw err; 
    }
  }, [apiClient.enrollments]); 
  
  const getUserEnrollments = useCallback(() => { 
    if (!user) return []; 
    return enrollments.filter(e => e.studentId === user.userId); 
  }, [enrollments, user]); 
  
  const getEnrollmentsByCourseId = useCallback((courseId: number) => { 
    return enrollments.filter(e => e.courseId === courseId); 
  }, [enrollments]); 
  
  useEffect(() => { 
    refreshEnrollments(); 
  }, [refreshEnrollments]); 
  
  return { 
    enrollments, 
    isLoading, 
    error, 
    
    refreshEnrollments, 
    
    createEnrollment, 
    updateEnrollment, 
    deleteEnrollment, 
    
    getUserEnrollments, 
    getEnrollmentsByCourseId 
  };
};