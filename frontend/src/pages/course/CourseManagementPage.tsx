import { useState, useCallback } from 'react';
import { useCourses, useTasks, useCategories } from '../../hooks';
import LoadingSpinner from '../../components/LoadingSpinner';
import CourseCard from '../../components/course/CourseCard';
import NewCourseCard from '../../components/course/NewCourseCard';
import { CourseCreate, CourseResponse, CategoryCreate } from '../../api/models';
import Masonry from 'react-masonry-css';

const breakpointColumnsObj = {
  default: 3,
  1536: 3,
  1280: 2,
  1024: 2,
  768: 1,
};

const masonryStyles = `
  .masonry-grid {
    display: flex;
    margin-left: -24px; /* gutter size offset */
    width: auto;
  }
  .masonry-grid_column {
    padding-left: 24px; /* gutter size */
    background-clip: padding-box;
  }
  .masonry-grid_column > div {
    margin-bottom: 24px; /* gutter size */
  }
  /* Remove margin from the last item in each column */
  .masonry-grid_column > div:last-child {
    margin-bottom: 0;
  }
`;

const CourseManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    courses,
    createCourse,
    updateCourse,
    deleteCourse,
    refreshCourses,
    isLoading: coursesLoading,
    error: coursesError
  } = useCourses();

  const {
    tasks,
    createTask,
    deleteTask,
    isLoading: tasksLoading,
    error: tasksError
  } = useTasks();

  const {
    categories,
    createCategory,
    getCategoryById,
    isLoading: categoriesLoading,
    error: categoriesError
  } = useCategories();

  const isLoading = coursesLoading || tasksLoading || categoriesLoading;
  const error = coursesError || tasksError || categoriesError;

  const resetSearchForm = () => {
    setSearchTerm('');
  };

  const refreshAllData = useCallback(async () => {
    await Promise.all([
      refreshCourses()
    ]);
  }, [refreshCourses]);

  const handleEditCourse = () => {};

  const handleCategorySubmit = async (name: string, description: string | null) => {
    try {
      const categoryData: CategoryCreate = {
        name,
        description,
        isActive: true
      };
      
      const newCategory = await createCategory(categoryData);
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  };

  const handleCreateCourse = async (courseData: CourseCreate) => {
    try {
      await createCourse(courseData);
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  };

  const handleAddTask = async (course: CourseResponse, taskTitle: string, taskDescription: string) => {
    try {
      await createTask({
        title: taskTitle,
        description: taskDescription || null,
        courseId: course.courseId,
        isActive: true
      });
      return true;
    } catch (error) {
      console.error('Error creating task:', error);
      return false;
    }
  };

  const filteredCourses = courses
    .filter(course => 
      course.isActive !== false && 
      (searchTerm === '' || 
       course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .sort((a, b) => (b.courseId || 0) - (a.courseId || 0));

  const getCourseTasks = useCallback((courseId: number) => {
    return tasks.filter(task => task.courseId === courseId);
  }, [tasks]);

  const getCategoryName = useCallback((categoryId: number) => {
    const category = getCategoryById(categoryId);
    return category ? category.name : 'Unknown Category';
  }, [getCategoryById]);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600">
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p className="mb-4">
          There was an error loading the course data. Please try refreshing the page.
        </p>
        <button
          onClick={refreshAllData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <style>{masonryStyles}</style>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Course Management
        </h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
          {searchTerm && (
            <button
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              onClick={resetSearchForm}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="pb-6">
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          <NewCourseCard
            onCreateCourse={handleCreateCourse}
            handleCreateCategory={handleCategorySubmit}
            categories={categories}
          />

          {filteredCourses.length === 0 && searchTerm !== '' ? (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-center h-40">
              <p className="text-gray-500">No courses match your search.</p>
            </div>
          ) : (
            filteredCourses.map(course => (
              <CourseCard
                key={course.courseId}
                course={course}
                courseTasks={getCourseTasks(course.courseId)}
                handleEditCourse={handleEditCourse}
                handleAddTask={handleAddTask}
                categoryName={getCategoryName(course.categoryId)}
                updateCourse={updateCourse}
                categories={categories}
                deleteTask={deleteTask}
                deleteCourse={deleteCourse}
                handleCreateCategory={handleCategorySubmit}
              />
            ))
          )}
        </Masonry>
      </div>
    </div>
  );
};

export default CourseManagementPage; 