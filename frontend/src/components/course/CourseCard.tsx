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

const CourseCard: React.FC<Partial<CourseCardProps>> = ({ course }) => {
  return (
    <div className="border rounded p-4 mb-3">
      <h3>{course?.title || 'Course has no title'}</h3>
      <p>{course?.description || 'Course has no description'}</p>
    </div>
  );
};

export default CourseCard; 