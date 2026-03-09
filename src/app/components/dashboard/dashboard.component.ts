import { Component, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

export interface DashboardStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  completionRate: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats$!: Observable<DashboardStats>;
  recentTasks$!: Observable<Task[]>;

  constructor(private readonly taskService: TaskService) {}

  ngOnInit(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.stats$ = this.taskService.tasks.pipe(
      map((tasks: Task[]) => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const inProgress = tasks.filter(t => t.status === 'in-progress').length;
        const pending = tasks.filter(t => t.status === 'pending').length;
        const overdue = tasks.filter(t => {
          const due = new Date(t.dueDate);
          return t.status !== 'completed' && due < today;
        }).length;
        const highPriority = tasks.filter(t => t.priority === 'high').length;
        const mediumPriority = tasks.filter(t => t.priority === 'medium').length;
        const lowPriority = tasks.filter(t => t.priority === 'low').length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, inProgress, pending, overdue, highPriority, mediumPriority, lowPriority, completionRate };
      })
    );

    this.recentTasks$ = this.taskService.tasks.pipe(
      map((tasks: Task[]) =>
        [...tasks]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5)
      )
    );
  }

  getStatusPercent(count: number, total: number): number {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  getCircumference(r: number): number {
    return 2 * Math.PI * r;
  }

  getDashOffset(value: number, total: number, r: number): number {
    const pct = total > 0 ? value / total : 0;
    return this.getCircumference(r) * (1 - pct);
  }
}
