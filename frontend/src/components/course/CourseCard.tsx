import React, { useState } from 'react';
import { CourseResponse, CourseCreate, TaskResponse } from '../../api/models';
import { useAuth } from '../../context/AuthContext';

interface CourseCardProps {
  course: CourseResponse;
  courseTasks: TaskResponse[];
  handleEditCourse: (course: CourseResponse) => void;
  handleAddTask: (course: CourseResponse, taskTitle: string, taskDescription: string) => Promise<boolean>;
  categoryName: string;
  updateCourse: (courseId: number, courseData: CourseCreate) => Promise<void>;
  categories: { categoryId: number; name: string }[];
  deleteTask: (taskId: number) => Promise<void>;
  deleteCourse: (courseId: number) => Promise<void>;
  handleCreateCategory: (name: string, description: string | null) => Promise<any>;
}

const CourseCard = ({ 
  course, 
  courseTasks, 
  handleAddTask, 
  categoryName,
  updateCourse,
  categories,
  deleteTask,
  deleteCourse,
  handleCreateCategory
}: CourseCardProps) => {
  const { user } = useAuth();
  const isOwner = user?.userId === course.teacherId;
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(course.title);
  const [editDescription, setEditDescription] = useState(course.description || '');
  const [editCategoryId, setEditCategoryId] = useState(course.categoryId);
  const [editDeadline, setEditDeadline] = useState(course.deadlineInDays || 30);
  
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  
  const [confirmingDeleteTaskId, setConfirmingDeleteTaskId] = useState<number | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');

  const clearTaskForm = () => {
    setTaskTitle('');
    setTaskDescription('');
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || taskTitle.trim().length < 3) return;
    
    const success = await handleAddTask(course, taskTitle, taskDescription);
    
    if (success) {
      clearTaskForm();
    }
  };
  
  const handleSaveEdit = async () => {
    if (!editTitle.trim() || editTitle.trim().length < 3 || !editCategoryId) return;
    
    try {
      await updateCourse(course.courseId, {
        title: editTitle,
        description: editDescription || null,
        categoryId: editCategoryId,
        teacherId: course.teacherId,
        deadlineInDays: editDeadline,
        isActive: true
      });

      setIsEditing(false);
    } catch (err) {
      console.error('Error updating course:', err);
    }
  };
  
  const handleCancelEdit = () => {
    setEditTitle(course.title);
    setEditDescription(course.description || '');
    setEditCategoryId(course.categoryId);
    setEditDeadline(course.deadlineInDays || 30);
    clearTaskForm();
    setIsEditing(false);
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask(taskId);
      setConfirmingDeleteTaskId(null);
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };
  
  const handleCreateCategoryLocal = async () => {
    if (newCategoryName.trim().length < 3) return;
    
    try {
      const newCategory = await handleCreateCategory(
        newCategoryName,
        newCategoryDescription || null
      );
      
      setEditCategoryId(newCategory.categoryId);
      setShowCategoryModal(false);
      setNewCategoryName('');
      setNewCategoryDescription('');
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
      {isEditing ? (
        <div className="mb-4">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Course title"
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <div className="flex items-center">
              <select
                value={editCategoryId}
                onChange={(e) => setEditCategoryId(Number(e.target.value))}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="ml-2 px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 flex-shrink-0"
              >
                + New
              </button>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Course description (optional)"
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (days)</label>
            <input
              type="number"
              min="1"
              max="365"
              value={editDeadline}
              onChange={(e) => setEditDeadline(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="mb-4 border-t border-gray-100 pt-4 mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tasks ({courseTasks.length})</label>
            
            {courseTasks.length > 0 && (
              <div className="space-y-2 mb-4">
                {courseTasks.map((task) => (
                  <div 
                    key={task.taskId} 
                    className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-800 truncate">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{task.description}</p>
                      )}
                    </div>
                    
                    <div>
                      {confirmingDeleteTaskId === task.taskId ? (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => setConfirmingDeleteTaskId(null)}
                            className="p-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.taskId)}
                            className="p-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingDeleteTaskId(task.taskId)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Add New Task</h4>
              <form onSubmit={handleTaskSubmit}>
                <div className="mb-2">
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Task title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="mb-2">
                  <textarea
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Task description (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!taskTitle.trim() || taskTitle.trim().length < 3}
                    className={`px-3 py-1.5 text-sm rounded-md ${
                      !taskTitle.trim() || taskTitle.trim().length < 3
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 transition-colors'
                    }`}
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-gray-800">{course.title}</h2>
            {isOwner && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
              {categoryName}
            </span>
            {isOwner && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                Owner
              </span>
            )}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
              {course.deadlineInDays} days deadline
            </span>
          </div>
          
          {course.description && (
            <p className="text-sm text-gray-600 mb-4">
              {course.description}
            </p>
          )}
          
          <div className="border-t border-gray-100 pt-4 mt-3">
            <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Tasks
              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
                {courseTasks.length}
              </span>
            </h3>
            
            {courseTasks.length > 0 ? (
              <div className="space-y-2">
                {courseTasks.map((task) => (
                  <div 
                    key={task.taskId} 
                    className="flex items-center p-3 bg-white border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-800 truncate">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{task.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm text-gray-500">No tasks yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Category</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter category name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Enter category description"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategoryLocal}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && isOwner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full">
            <div className="text-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Course Deletion</h3>
            </div>
            <p className="text-gray-700 mb-6 text-center">
              Are you sure you want to delete this course? This action cannot be undone, and all associated tasks will be deleted.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setConfirmDelete(false);
                  await deleteCourse(course.courseId);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCard; 