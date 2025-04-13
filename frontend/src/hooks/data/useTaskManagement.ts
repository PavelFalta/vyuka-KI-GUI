import { useCallback } from 'react'; 
import { useAuth } from '../../context/AuthContext'; 
import { useTasks } from './useTasks'; 
import { useTaskCompletions } from './useTaskCompletions'; 
import { useEnrollments } from './useEnrollments'; 
import { useCourses } from './useCourses'; 
import { useUsers } from './useUsers'; 

export interface TaskWithStatus { 
  task: any; 
  course: any; 
  status: 'notStarted' | 'pending' | 'completed'; 
  assignerId: number; 
  assignerName: string; 
  enrollmentId: number; 
  taskCompletionId?: number; 
}

export interface TaskToReview { 
  task: any; 
  course: any; 
  status: 'pending'; 
  assignerName: string; 
  taskCompletionId: number; 
  studentId: number; 
}

interface UseTaskManagementResult { 
  isLoading: boolean; 
  error: string | null; 
  getTasksByStatus: (status: 'notStarted' | 'pending' | 'completed') => TaskWithStatus[]; 
  getTasksToReview: () => TaskToReview[]; 
  completeTask: (taskId: number) => Promise<boolean>; 
  approveTask: (taskCompletionId: number) => Promise<boolean>; 
}

export const useTaskManagement = (): UseTaskManagementResult => { 
  const { user } = useAuth(); 
  
  const { tasks, isLoading: tasksLoading, error: tasksError } = useTasks(); 
  const { taskCompletions, completeTask: completeTaskCompletion, approveTask, isLoading: completionsLoading, error: completionsError } = useTaskCompletions(); 
  const { enrollments, isLoading: enrollmentsLoading, error: enrollmentsError } = useEnrollments(); 
  const { courses, isLoading: coursesLoading, error: coursesError } = useCourses(); 
  const { students, isLoading: studentsLoading, error: studentsError } = useUsers(); 
  
  const isLoading = tasksLoading || completionsLoading || enrollmentsLoading || coursesLoading || studentsLoading; 
  const error = tasksError || completionsError || enrollmentsError || coursesError || studentsError; 
  
  const getTasksByStatus = useCallback((status: 'notStarted' | 'pending' | 'completed'): TaskWithStatus[] => { 
    if (!user) return []; 
    
    const userEnrollments = enrollments.filter(e => e.studentId === user.userId && e.isActive !== false); 
    
    const result: TaskWithStatus[] = []; 
    
    for (const enrollment of userEnrollments) { 
      const course = courses.find(c => c.courseId === enrollment.courseId && c.isActive !== false); 
      if (!course) continue; 
      
      const courseTasks = tasks.filter(t => t.courseId === course.courseId && t.isActive !== false); 
      
      for (const task of courseTasks) { 
        const completion = taskCompletions.find(tc => 
          tc.taskId === task.taskId && tc.enrollmentId === enrollment.enrollmentId 
        );
        
        let taskStatus = 'notStarted'; 
        if (completion) { 
          taskStatus = completion.isActive ? 'completed' : 'pending'; 
        }
        
        if (taskStatus !== status) continue; 
        
        const assigner = students.find(s => s.userId === enrollment.assignerId); 
        const assignerName = assigner ? `${assigner.firstName} ${assigner.lastName}` : 'Unknown'; 
        
        result.push({ 
          task,
          course,
          status: taskStatus as 'notStarted' | 'pending' | 'completed',
          assignerId: enrollment.assignerId,
          assignerName,
          enrollmentId: enrollment.enrollmentId,
          taskCompletionId: completion?.taskCompletionId
        });
      }
    }
    
    return result; 
  }, [user, enrollments, courses, tasks, taskCompletions, students]); 
  
  const getTasksToReview = useCallback((): TaskToReview[] => { 
    if (!user) return []; 
    
    const result: TaskToReview[] = []; 
    
    for (const tc of taskCompletions) { 
      if (tc.isActive) continue; 
      
      const enrollment = enrollments.find(e => 
        e.enrollmentId === tc.enrollmentId && 
        e.isActive === true 
      );
      if (!enrollment || enrollment.assignerId !== user.userId) continue; 
      
      const task = tasks.find(t => t.taskId === tc.taskId && t.isActive !== false); 
      if (!task) continue; 
      
      const course = courses.find(c => c.courseId === task.courseId && c.isActive !== false); 
      if (!course) continue; 
      
      const student = students.find(s => s.userId === enrollment.studentId); 
      const studentName = student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'; 
      
      result.push({ 
        task,
        course,
        status: 'pending',
        assignerName: studentName,
        taskCompletionId: tc.taskCompletionId,
        studentId: enrollment.studentId
      });
    }
    
    return result; 
  }, [user, taskCompletions, enrollments, tasks, courses, students]); 
  
  const completeTask = useCallback(async (taskId: number): Promise<boolean> => { 
    if (!user) return false; 
    
    const task = tasks.find(t => t.taskId === taskId); 
    if (!task || !task.courseId) return false; 
    
    const enrollment = enrollments.find(e => 
      e.courseId === task.courseId && 
      e.studentId === user.userId && 
      e.isActive === true 
    );
    if (!enrollment) return false; 
    
    return await completeTaskCompletion(taskId, enrollment.enrollmentId); 
  }, [user, tasks, enrollments, completeTaskCompletion]); 
  
  return { 
    isLoading,
    error,
    getTasksByStatus,
    getTasksToReview,
    completeTask,
    approveTask
  };
};