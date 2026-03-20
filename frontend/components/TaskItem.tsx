
import React, { useState, ChangeEvent } from 'react';
import api from '../services/api';
import { Task } from '../types';
import { Calendar, CheckCircle2, Circle, Clock, Trash2, Edit2, Save, X } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onTaskUpdated, onTaskDeleted }) => {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Task>({ ...task });
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleEditChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      // Fix: api.put expected 2 arguments but got 3. Removed redundant headers object as api handles it internally.
      const response = await api.put(`/tasks/${task._id}`, editData) as any;
      onTaskUpdated(response.data);
      setEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setDeleting(true);
    try {
      // Fix: api.delete expected 1 argument but got 2. Removed redundant headers object.
      await api.delete(`/tasks/${task._id}`);
      onTaskDeleted(task._id);
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setDeleting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-emerald-500';
      default: return 'bg-gray-400';
    }
  };

  if (editing) {
    return (
      <div className="glass-card p-5 relative border-2 border-[var(--color-primary)]">
        <div className="space-y-4">
          <input
            type="text"
            name="title"
            value={editData.title}
            onChange={handleEditChange}
            className="text-lg font-bold bg-[var(--bg-app)]"
          />
          <textarea
            name="description"
            value={editData.description}
            onChange={handleEditChange}
            className="w-full text-sm resize-none bg-[var(--bg-app)]"
            rows={3}
          />
          <div className="grid grid-cols-2 gap-3">
             <select name="status" value={editData.status} onChange={handleEditChange}>
               <option value="todo">To Do</option>
               <option value="in-progress">In Progress</option>
               <option value="done">Done</option>
             </select>
             <select name="priority" value={editData.priority} onChange={handleEditChange}>
               <option value="low">Low Priority</option>
               <option value="medium">Medium Priority</option>
               <option value="high">High Priority</option>
             </select>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setEditing(false)} className="btn btn-secondary flex items-center gap-2">
              <X size={16} /> Cancel
            </button>
            <button onClick={handleUpdate} disabled={updating} className="btn btn-primary flex items-center gap-2">
              <Save size={16} /> {updating ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 group relative overflow-hidden">
      {/* Priority Strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${getPriorityColor(task.priority)}`}></div>

      <div className="flex items-start justify-between gap-4 pl-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
             <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
               task.status === 'done' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
               task.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
               'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
             }`}>
               {task.status.replace('-', ' ')}
             </span>
             {task.dueDate && (
               <span className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
                 <Calendar size={12} /> {new Date(task.dueDate).toLocaleDateString()}
               </span>
             )}
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] leading-snug">{task.title}</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-2 line-clamp-2">{task.description}</p>
        </div>

        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
          <button onClick={() => setEditing(true)} className="p-2 hover:bg-[var(--bg-app)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors">
            <Edit2 size={16} />
          </button>
          <button onClick={handleDelete} disabled={deleting} className="p-2 hover:bg-red-50 rounded-lg text-[var(--text-secondary)] hover:text-red-500 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
