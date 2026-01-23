import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss']
})
export class TaskDetailComponent {
  task$!: Observable<Task | undefined>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly taskService: TaskService,
    private readonly router: Router
  ) {
    this.task$ = this.route.paramMap.pipe(
      switchMap((params) => this.taskService.getTask(params.get('id') || ''))
    );
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }

  markComplete(task: Task): void {
    this.taskService.updateStatus(task.id, 'completed').subscribe();
  }

  edit(task: Task): void {
    this.router.navigate(['/tasks', task.id, 'edit']);
  }
}
