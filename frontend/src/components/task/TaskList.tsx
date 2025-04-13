import TaskItem from './TaskItem';
import { TaskResponse, CourseResponse } from '../../api/models';

interface TaskItem {
  task: TaskResponse;
  course: CourseResponse;
  status: 'pending' | 'completed' | 'notStarted';
  assignerId?: number;
  assignerName?: string;
}

interface TaskListProps {
  tasks: TaskItem[];
  title: string;
  emptyMessage: string;
  onRequestApproval?: (taskId: number) => Promise<void>;
  onApprove?: (taskId: number) => Promise<void>;
  onComplete?: (taskId: number) => Promise<void>;
}

const TaskList = ({ tasks, title, emptyMessage, onRequestApproval, onApprove, onComplete }: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
          <p className="text-gray-500 text-lg">{emptyMessage}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-6">
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <span className="ml-2 px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
          {tasks.length}
        </span>
      </div>
      
      <div className="space-y-4">
        {tasks.map((taskItem, index) => (
          <TaskItem
            key={`${taskItem.task.taskId}-${index}`}
            task={taskItem.task}
            course={taskItem.course}
            status={taskItem.status}
            assignerId={taskItem.assignerId}
            assignerName={taskItem.assignerName}
            onRequestApproval={onRequestApproval ? () => onRequestApproval(taskItem.task.taskId) : undefined}
            onApprove={onApprove ? () => onApprove(taskItem.task.taskId) : undefined}
            onComplete={onComplete ? () => onComplete(taskItem.task.taskId) : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskList;