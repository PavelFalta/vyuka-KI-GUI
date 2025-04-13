import { TaskResponse, CourseResponse } from '../../api/models';

interface TaskItemProps {
  task: TaskResponse;
  course: CourseResponse;
  status: 'pending' | 'completed' | 'notStarted';
  assignerId?: number;
  assignerName?: string;
  onRequestApproval?: () => Promise<void>;
  onApprove?: () => Promise<void>;
  onComplete?: () => Promise<void>;
}

const STATUS_CONFIG = {
  notStarted: {
    text: 'Not Started',
    emoji: '🔷',
    classes: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  pending: {
    text: 'Pending Approval',
    emoji: '⏳',
    classes: 'bg-yellow-50 text-yellow-700 border-yellow-200'
  },
  completed: {
    text: 'Completed',
    emoji: '✅',
    classes: 'bg-green-50 text-green-700 border-green-200'
  }
};

const TaskItem = ({ task, course, status, assignerName, onApprove, onComplete }: TaskItemProps) => {
  const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG.notStarted;
  
  const ActionButton = () => {
    if (status === 'notStarted' && onComplete) {
      return (
        <button
          onClick={onComplete}
          className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span className="mr-1">✓</span> Complete
        </button>
      );
    }
    
    if (status === 'pending' && onApprove) {
      return (
        <button
          onClick={onApprove}
          className="flex items-center px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <span className="mr-1">👍</span> Approve
        </button>
      );
    }
    
    return null;
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-4 hover:shadow-md transition-shadow duration-200"> 
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">{task.title}</h3>
          
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-gray-50 text-gray-600">
              📚 {course.title}
            </span>
            
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.classes}`}>
              {statusInfo.emoji} {statusInfo.text}
            </span>
          </div>
          
          {assignerName && (
            <div className="text-xs text-gray-500 mt-3 flex items-center">
              <span className="mr-1">👤</span> Assigned by: {assignerName}
            </div>
          )}
          
          {task.description && (
            <div className="text-sm text-gray-600 mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
              {task.description}
            </div>
          )}
        </div>
        
        <div className="ml-4">
          <ActionButton />
        </div>
      </div>
    </div>
  );
};

export default TaskItem;