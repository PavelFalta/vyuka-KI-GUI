import { useNavigate } from 'react-router-dom';
import { useTaskManagement } from '../hooks';

const FEATURES = [
  { 
    title: "My Tasks", 
    description: "View, complete, and approve tasks", 
    icon: "✅", 
    path: "/tasks"
  },
  { 
    title: "Course Management", 
    description: "Create and manage courses with tasks", 
    icon: "📋", 
    path: "/course-management"
  },
  { 
    title: "Course Assignment", 
    description: "Assign courses to students", 
    icon: "🎓", 
    path: "/course-assignment"
  }
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const { getTasksToReview } = useTaskManagement();
  const tasksToReviewCount = getTasksToReview().length;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map(feature => (
          <div 
            key={feature.path}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 relative hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(feature.path)}
          >
            {feature.path === '/tasks' && tasksToReviewCount > 0 && (
              <span className="absolute -top-2 -right-2 flex items-center justify-center h-6 w-6 text-xs bg-red-500 text-white rounded-full border-2 border-white">
                {tasksToReviewCount}
              </span>
            )}
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h2>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage; 