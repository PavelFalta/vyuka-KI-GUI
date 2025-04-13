import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context';
import { useTaskManagement } from '../../hooks';

interface MenuItem {
  name: string;
  path: string;
  icon: string;
}

const createMenuItems = (): MenuItem[] => [
  { name: 'My Tasks', path: '/tasks', icon: '✅' },
  { name: 'Course Management', path: '/course-management', icon: '📋' },
  { name: 'Course Assignment', path: '/course-assignment', icon: '🎓' }
];

const MainLayout = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  
  const { getTasksToReview } = useTaskManagement();
  
  const menuItems = createMenuItems();

  useEffect(() => {
    if (user) {
      const tasksToReview = getTasksToReview();
      setPendingTasksCount(tasksToReview.length);
    }
  }, [user, getTasksToReview]);


  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserRoleName = () => {
    if (!user) return 'User';
    return user.role && typeof user.role === 'object' && 'name' in user.role 
      ? user.role.name || 'User' 
      : 'User';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className={`bg-white shadow-sm transform transition-all duration-300 fixed md:static inset-y-0 left-0 z-30 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'} md:flex flex-col w-64 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <span 
              onClick={() => navigate('/dashboard')}
              className="text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors"
            >
              {isSidebarOpen ? 'EduPlatform' : ''}
            </span>
          </div>
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none hidden md:block"
          >
            {isSidebarOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto pt-4">
          <ul className="px-2 space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center w-full px-3 py-2 text-left rounded-lg transition-colors relative ${
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  {isSidebarOpen && (
                    <span className="flex-1">{item.name}</span>
                  )}
                  
                  {item.path === '/tasks' && pendingTasksCount > 0 && (
                    <span className="flex items-center justify-center h-5 w-5 text-xs bg-red-500 text-white rounded-full">
                      {pendingTasksCount}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          {user && (
            <div className="flex items-center pb-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                {user.firstName?.charAt(0) || 'U'}
              </div>
              {isSidebarOpen && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-500">{getUserRoleName()}</p>
                </div>
              )}
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center w-full ${
              isSidebarOpen ? 'px-3 py-2' : 'justify-center py-2'
            } text-sm text-gray-700 hover:text-red-600 rounded-lg`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {isSidebarOpen && <span className="ml-2">Log out</span>}
          </button>
        </div>
      </div>

      <div className="md:hidden fixed top-4 left-4 z-40">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md text-gray-700 bg-white shadow-sm hover:bg-gray-100 focus:outline-none"
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="container mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;