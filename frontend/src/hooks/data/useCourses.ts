import { useState, useEffect, useCallback } from 'react'; 
import { useApiClient } from '../useApiClient'; 
import { 
  CourseResponse, 
  CourseCreate, 
  CourseUpdate 
} from '../../api/models'; 

interface UseCoursesResult { 
  courses: CourseResponse[]; 
  isLoading: boolean; 
  error: string | null; 
  
  refreshCourses: () => Promise<CourseResponse[]>; 
  
  createCourse: (courseData: CourseCreate) => Promise<CourseResponse>; 
  updateCourse: (courseId: number, courseData: CourseUpdate) => Promise<void>; 
  deleteCourse: (courseId: number) => Promise<void>; 
}

export const useCourses = (): UseCoursesResult => { 
  const apiClient = useApiClient(); 
  
  const [courses, setCourses] = useState<CourseResponse[]>([]); 
  
  const [isLoading, setIsLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null); 
  
  const refreshCourses = useCallback(async () => { 
    setIsLoading(true); 
    try {
      const data = await apiClient.courses.getCourses(); 
      setCourses(data); 
      setError(null); 
      return data; 
    } catch (err) { 
      console.error('Error fetching courses:', err); 
      setError('Failed to load courses'); 
      return []; 
    } finally {
      setIsLoading(false); 
    }
  }, [apiClient.courses]); 
  
  const createCourse = useCallback(async (courseData: CourseCreate): Promise<CourseResponse> => { 
    try {
      const newCourse = await apiClient.courses.createCourses({ 
        courseCreate: courseData 
      });
      
      setCourses(prevCourses => [...prevCourses, newCourse]); 
      
      return newCourse; 
    } catch (err) { 
      console.error('Error creating course:', err); 
      setError('Failed to create course'); 
      throw err; 
    }
  }, [apiClient.courses]); 

  const updateCourse = useCallback(async (courseId: number, courseData: CourseUpdate): Promise<void> => { 
    try {
      await apiClient.courses.updateCourse({ 
        courseId, 
        courseUpdate: courseData 
      });
      
      await refreshCourses(); 
    } catch (err) { 
      console.error('Error updating course:', err); 
      setError('Failed to update course'); 
      throw err; 
    }
  }, [apiClient.courses, refreshCourses]); 

  const deleteCourse = useCallback(async (courseId: number): Promise<void> => { 
    try {
      await apiClient.courses.deleteCourse({ 
        courseId 
      });
      
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.courseId === courseId 
            ? { ...course, isActive: false } 
            : course 
        )
      );
    } catch (err) { 
      console.error('Error deleting course:', err); 
      setError('Failed to delete course'); 
      throw err; 
    }
  }, [apiClient.courses]); 
  
  useEffect(() => { 
    refreshCourses(); 
  }, [refreshCourses]); 
  
  return { 
    courses, 
    isLoading, 
    error, 
    
    refreshCourses, 
    createCourse, 
    updateCourse, 
    deleteCourse
  };
}; 