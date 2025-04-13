import { Routes, Route, Navigate, useLocation } from 'react-router-dom'; 
import { AuthProvider } from './context'; 
import { AnimatePresence } from 'framer-motion'; 

import MainLayout from './components/layout/MainLayout'; 
import ProtectedRoute from './components/ProtectedRoute'; 

import LoginPage from './pages/auth/LoginPage'; 
import SignUpPage from './pages/auth/SignUpPage'; 
import { NotFoundPage, UnauthorizedPage } from './pages/ErrorPages'; 

import DashboardPage from './pages/DashboardPage'; 
import CourseManagementPage from './pages/course/CourseManagementPage'; 
import CourseAssignmentPage from './pages/course/CourseAssignmentPage'; 
import TaskManagementPage from './pages/TaskManagementPage'; 

function AnimatedRoutes() { 
  const location = useLocation(); 
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tasks" element={<TaskManagementPage />} />
            <Route path="/course-management" element={<CourseManagementPage />} />
            <Route path="/course-assignment" element={<CourseAssignmentPage />} />
          </Route>
        </Route>
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() { 
  return (
    <AuthProvider>
      <AnimatedRoutes />
    </AuthProvider>
  );
}

export default App; 
