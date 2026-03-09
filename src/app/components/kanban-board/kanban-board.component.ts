import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Task, TaskStatus } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss']
})
export class KanbanBoardComponent implements OnInit {
  pendingTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  completedTasks: Task[] = [];

  constructor(private readonly taskService: TaskService) {}

  ngOnInit(): void {
    this.taskService.tasks.subscribe((tasks: Task[]) => {
      this.pendingTasks = tasks.filter(t => t.status === 'pending');
      this.inProgressTasks = tasks.filter(t => t.status === 'in-progress');
      this.completedTasks = tasks.filter(t => t.status === 'completed');
    });
  }

  drop(event: CdkDragDrop<Task[]>, newStatus: TaskStatus): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.taskService.updateStatus(task.id, newStatus).subscribe();
    }
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority}`;
  }
}
