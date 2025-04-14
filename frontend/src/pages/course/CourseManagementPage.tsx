import { useState, useCallback } from 'react';
import { useCourses, useTasks, useCategories } from '../../hooks';
import LoadingSpinner from '../../components/LoadingSpinner';
import CourseCard from '../../components/course/CourseCard';
import NewCourseCard from '../../components/course/NewCourseCard';
import { CourseCreate, CourseResponse, CategoryCreate } from '../../api/models';
import Masonry from 'react-masonry-css';
import { NotFoundPage } from '../ErrorPages';

// SVG path definitions
const SEARCH_ICON_PATH_D = "M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z";
const CLEAR_SEARCH_ICON_PATH_D = "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z";

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
  return (
    <NotFoundPage /> // tohle dodelat pls do roku 2018
  );
};

export default CourseManagementPage; 