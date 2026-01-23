import { Pipe, PipeTransform } from '@angular/core';
import { Task, TaskPriority, TaskStatus } from '../models/task.model';

interface FilterOptions {
  search?: string;
  categoryId?: string;
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
}

@Pipe({
  name: 'taskFilter',
  standalone: true
})
export class TaskFilterPipe implements PipeTransform {
  transform(tasks: Task[], filters: FilterOptions): Task[] {
    if (!tasks) return [];
    return tasks.filter((task) => this.matches(task, filters));
  }

  private matches(task: Task, filters: FilterOptions): boolean {
    const matchesSearch = filters.search
      ? `${task.title} ${task.description}`.toLowerCase().includes(filters.search.toLowerCase())
      : true;
    const matchesCategory = filters.categoryId ? task.categoryId === filters.categoryId : true;
    const matchesStatus = filters.status && filters.status !== 'all' ? task.status === filters.status : true;
    const matchesPriority = filters.priority && filters.priority !== 'all' ? task.priority === filters.priority : true;
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  }
}
