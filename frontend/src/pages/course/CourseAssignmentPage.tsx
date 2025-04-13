import { useState, useEffect, useMemo, useRef } from 'react';
import { useCourses, useEnrollments, useUsers } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import { CourseResponse, EnrollmentCreate } from '../../api/models';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const pageEntryVariant = {
  hidden: { 
    opacity: 0,
    y: 20 
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full">
        <div className="text-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-700 mb-6 text-center">
          {message}
        </p>
        <div className="flex justify-center space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const CourseAssignmentPage = () => {
  const location = useLocation();

  const { 
    courses, 
    isLoading: coursesLoading,
    error: coursesError
  } = useCourses();
  
  const {
    students,
    isLoading: usersLoading,
    error: usersError,
    refreshUsers,
    users
  } = useUsers();
  
  const {
    enrollments,
    createEnrollment,
    deleteEnrollment,
    isLoading: enrollmentsLoading,
    error: enrollmentsError
  } = useEnrollments();
  
  const isLoading = coursesLoading || usersLoading || enrollmentsLoading;
  const error = coursesError || usersError || enrollmentsError;
  
  const { user } = useAuth();
  
  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);
  
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [showStudentResults, setShowStudentResults] = useState(false);
  const [showCourseResults, setShowCourseResults] = useState(false);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<number | null>(null);
  
  const studentSearchRef = useRef<HTMLInputElement>(null);
  const courseSearchRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    try {
      if (location.state && 
          typeof location.state === 'object' && 
          'preSelectedStudentId' in location.state) {
        setSelectedStudent(location.state.preSelectedStudentId);
        const student = users.find(s => s.userId === location.state.preSelectedStudentId);
        if (student) {
          setStudentSearchQuery(`${student.firstName} ${student.lastName}`);
        }
      }
    } catch (error) {
      console.error("Error processing navigation state:", error);
    }
  }, [location.state, users]);
  
  const filteredStudents = useMemo(() => {
    if (!studentSearchQuery.trim()) {
      return users.filter(student => 
        student.isActive !== false && 
        student.userId !== user?.userId
      );
    }
    
    const query = studentSearchQuery.toLowerCase().trim();
    return users.filter(student => {
      return (
        student.isActive !== false &&
        student.userId !== user?.userId &&
        (
          `${student.firstName} ${student.lastName}`.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          (student.username && student.username.toLowerCase().includes(query))
        )
      );
    });
  }, [users, studentSearchQuery, user]);

  const filteredCourses = useMemo(() => {
    if (!courseSearchQuery.trim()) {
      return courses.filter(course => course.isActive !== false);
    }
    
    const query = courseSearchQuery.toLowerCase().trim();
    return courses.filter(course => {
      return (
        course.isActive !== false &&
        (
          course.title.toLowerCase().includes(query) ||
          (course.description && course.description.toLowerCase().includes(query))
        )
      );
    });
  }, [courses, courseSearchQuery]);

  const handleCreateEnrollment = async () => {
    if (!selectedCourse || !selectedStudent || !user) return;
    
    try {
      const enrollmentData: EnrollmentCreate = {
        courseId: selectedCourse,
        studentId: selectedStudent,
        assignerId: user.userId,
        isActive: true
      };
      
      await createEnrollment(enrollmentData);
      
      setSelectedCourse(null);
      setSelectedStudent(null);
      setCourseSearchQuery('');
      setStudentSearchQuery('');
    } catch (err) {
      console.error('Error assigning course:', err);
    }
  };
  
  const showDeleteConfirmation = (enrollmentId: number) => {
    setEnrollmentToDelete(enrollmentId);
    setIsDeleteModalOpen(true);
  };
  
  const handleDeleteEnrollment = async () => {
    if (!enrollmentToDelete) return;
    
    try {
      await deleteEnrollment(enrollmentToDelete);
      setIsDeleteModalOpen(false);
      setEnrollmentToDelete(null);
    } catch (err) {
      console.error('Error deleting enrollment:', err);
    }
  };
  
  const getCourseById = (courseId: number): CourseResponse | undefined => {
    return courses.find(course => course.courseId === courseId);
  };
  
  const getStudentNameById = (studentId: number): string => {
    const student = students.find(s => s.userId === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };
  
  const assignedCourses = enrollments.filter(
    enrollment => enrollment.assignerId === user?.userId && enrollment.isActive !== false
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div 
      className="animate-fade-in"
      variants={pageEntryVariant}
      initial="hidden"
      animate="visible"
    >
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Course Assignment
      </h1>
      
      <p className="text-lg text-gray-700 mb-6">Assign courses to students</p>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6" role="alert">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-visible mb-8">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Create New Assignment</h2>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
            <div className="relative">
              <input
                ref={studentSearchRef}
                type="text"
                value={studentSearchQuery}
                onChange={(e) => {
                  setStudentSearchQuery(e.target.value);
                  setShowStudentResults(true);
                }}
                onFocus={() => setShowStudentResults(true)}
                onBlur={() => {
                  setTimeout(() => setShowStudentResults(false), 100);
                }}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search for a student..."
              />
              {showStudentResults && (
                <div 
                  className="absolute max-h-60 w-full mt-1 bg-white rounded-lg shadow-lg overflow-auto z-10"
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                >
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map(student => (
                      <div
                        key={student.userId}
                        className={`p-3 hover:bg-gray-50 cursor-pointer ${
                          selectedStudent === student.userId ? 'bg-blue-50' : ''
                        }`}
                        onMouseDown={() => {
                          setSelectedStudent(student.userId);
                          setStudentSearchQuery(`${student.firstName} ${student.lastName}`);
                          setShowStudentResults(false);
                        }}
                      >
                        <div className="font-medium">{student.firstName} {student.lastName}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-gray-500">No students found</div>
                  )}
                </div>
              )}
            </div>
            {selectedStudent && (
              <div className="mt-2 text-sm text-gray-600">
                Selected: {getStudentNameById(selectedStudent)}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
            <div className="relative">
              <input
                ref={courseSearchRef}
                type="text"
                value={courseSearchQuery}
                onChange={(e) => {
                  setCourseSearchQuery(e.target.value);
                  setShowCourseResults(true);
                }}
                onFocus={() => setShowCourseResults(true)}
                onBlur={() => {
                  setTimeout(() => setShowCourseResults(false), 100);
                }}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search for a course..."
              />
              {showCourseResults && (
                <div 
                  className="absolute max-h-60 w-full mt-1 bg-white rounded-lg shadow-lg overflow-auto z-10"
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                >
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map(course => (
                      <div
                        key={course.courseId}
                        className={`p-3 hover:bg-gray-50 cursor-pointer ${
                          selectedCourse === course.courseId ? 'bg-blue-50' : ''
                        }`}
                        onMouseDown={() => {
                          setSelectedCourse(course.courseId);
                          setCourseSearchQuery(course.title);
                          setShowCourseResults(false);
                        }}
                      >
                        <div className="font-medium">{course.title}</div>
                        {course.description && (
                          <div className="text-sm text-gray-500">{course.description}</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-gray-500">No courses found</div>
                  )}
                </div>
              )}
            </div>
            {selectedCourse && (
              <div className="mt-2 text-sm text-gray-600">
                Selected: {getCourseById(selectedCourse)?.title || 'Unknown Course'}
              </div>
            )}
          </div>
          
          <div className="pt-4">
            <button
              onClick={handleCreateEnrollment}
              disabled={!selectedCourse || !selectedStudent}
              className={`px-4 py-2 rounded-lg ${
                !selectedCourse || !selectedStudent
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Assign Course
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Courses You've Assigned</h2>
        </div>
        <div className="overflow-x-auto">
          {assignedCourses.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              You haven't assigned any courses yet.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assignedCourses.map(enrollment => {
                  const course = getCourseById(enrollment.courseId);
                  const studentName = getStudentNameById(enrollment.studentId);
                  
                  return (
                    <tr key={enrollment.enrollmentId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{studentName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{course ? course.title : 'Unknown Course'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => showDeleteConfirmation(enrollment.enrollmentId)}
                          className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Confirm Removal"
        message="Are you sure you want to remove this course assignment? This action cannot be undone."
        onConfirm={handleDeleteEnrollment}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setEnrollmentToDelete(null);
        }}
      />
    </motion.div>
  );
};

export default CourseAssignmentPage; 