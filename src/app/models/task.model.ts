export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface Category {
  id: string;
  name: string;
  color?: string;
}

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number;
  assignee?: User;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}
