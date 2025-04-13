import { useState, useMemo } from 'react';
import { useTaskManagement } from '../hooks';
import LoadingSpinner from '../components/LoadingSpinner';
import TaskList from '../components/task/TaskList';

type TabType = 'assignedTasks' | 'pendingApprovals' | 'completedTasks' | 'approvalsToReview';

const TABS: {id: TabType, label: string, emoji: string}[] = [
  { id: 'assignedTasks', label: 'To Do', emoji: '📋' },
  { id: 'pendingApprovals', label: 'Pending', emoji: '⏳' },
  { id: 'completedTasks', label: 'Completed', emoji: '✅' },
  { id: 'approvalsToReview', label: 'To Review', emoji: '👀' }
];

const EMPTY_MESSAGES = {
  assignedTasks: '🎉 You have no tasks to complete. Enjoy your free time!',
  pendingApprovals: '⌛ None of your tasks are pending approval right now.',
  completedTasks: '🏆 Completed tasks will show up here. Keep up the good work!',
  approvalsToReview: '📭 No tasks waiting for your review at the moment.'
};

const TaskManagementPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('assignedTasks');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { 
    isLoading, 
    error, 
    getTasksByStatus,
    getTasksToReview,
    completeTask,
    approveTask
  } = useTaskManagement();

  const taskCounts = useMemo(() => ({
    assignedTasks: getTasksByStatus('notStarted').length,
    pendingApprovals: getTasksByStatus('pending').length,
    completedTasks: getTasksByStatus('completed').length,
    approvalsToReview: getTasksToReview().length
  }), [getTasksByStatus, getTasksToReview]);

  const handleCompleteTask = async (taskId: number) => {
    const success = await completeTask(taskId);
    showToast(success ? '✅ Task completed and sent for approval!' : '❌ Failed to complete task');
  };

  const handleApproveTask = async (taskId: number) => {
    if (activeTab === 'approvalsToReview') {
      const tasksToReview = getTasksToReview();
      const taskToApprove = tasksToReview.find(t => t.task.taskId === taskId);
      
      if (taskToApprove) {
        console.log(`Approving task completion: ${taskToApprove.taskCompletionId}`);
        const success = await approveTask(taskToApprove.taskCompletionId);
        showToast(success ? '👍 Task approved successfully!' : '❌ Failed to approve task');
        return;
      }
    }
    
    showToast('❌ Failed to approve task: Could not find task completion ID');
  };

  const showToast = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };
  
  const getTasksForTab = () => {
    switch (activeTab) {
      case 'assignedTasks': return getTasksByStatus('notStarted');
      case 'pendingApprovals': return getTasksByStatus('pending');
      case 'completedTasks': return getTasksByStatus('completed');
      case 'approvalsToReview': return getTasksToReview();
      default: return [];
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-600 p-4">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
      </div>
      
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-md p-4 bg-white rounded-lg shadow-lg border-l-4 border-green-500 animate-fade-in-down">
          <p className="text-gray-700">{successMessage}</p>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm mb-6 p-1">
        <nav className="flex">
          {TABS.map(tab => {
            const count = taskCounts[tab.id];
            return (
              <button
                key={tab.id}
                className={`flex-1 flex items-center justify-center py-3 px-1 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-50 text-gray-600'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="mr-2">{tab.emoji}</span>
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
      
      <TaskList
        tasks={getTasksForTab()}
        title={`${TABS.find(t => t.id === activeTab)?.emoji || ''} ${TABS.find(t => t.id === activeTab)?.label || ''}`}
        emptyMessage={EMPTY_MESSAGES[activeTab]}
        onComplete={activeTab === 'assignedTasks' ? handleCompleteTask : undefined}
        onApprove={activeTab === 'approvalsToReview' ? handleApproveTask : undefined}
      />
    </div>
  );
};

export default TaskManagementPage; 