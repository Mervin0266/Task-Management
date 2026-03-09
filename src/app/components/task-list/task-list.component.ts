import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Category, Task, TaskPriority, TaskStatus } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

interface FilterState {
  search: string;
  categoryId?: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
}

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  tasks$!: Observable<Task[]>;
  categories$!: Observable<Category[]>;
  displayedColumns = ['select', 'title', 'category', 'priority', 'dueDate', 'progress', 'status', 'actions'];
  categoryNames: Record<string, string> = {};

  filters: FilterState = {
    search: '',
    status: 'all',
    priority: 'all'
  };

  selectedIds = new Set<string>();

  constructor(
    private readonly taskService: TaskService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.categories$ = this.taskService.categories;
    this.categories$.subscribe((cats: Category[]) => {
      this.categoryNames = cats.reduce((acc: Record<string, string>, category: Category) => {
        acc[category.id] = category.name;
        return acc;
      }, {} as Record<string, string>);
    });
    if (this.route.snapshot.data['completed']) {
      this.filters.status = 'completed';
    }
    this.tasks$ = this.taskService.tasks;
  }

  goToAdd(): void {
    this.router.navigate(['/tasks/add']);
  }

  viewTask(task: Task): void {
    this.router.navigate(['/tasks', task.id]);
  }

  editTask(task: Task): void {
    this.router.navigate(['/tasks', task.id, 'edit']);
  }

  markDone(task: Task): void {
    this.taskService.updateStatus(task.id, 'completed').subscribe();
  }

  deleteTask(task: Task): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Task',
        message: `Are you sure you want to delete "${task.title}"?`
      }
    });

    dialogRef.afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        this.taskService.deleteTask(task.id).subscribe();
      }
    });
  }

  getCategoryName(categoryId: string): string {
    return this.categoryNames[categoryId] || '—';
  }

  // ── Bulk selection ──────────────────────────────────────────────
  isSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }

  toggleSelect(id: string): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
    this.selectedIds = new Set(this.selectedIds); // trigger CD
  }

  selectAll(tasks: Task[]): void {
    if (this.selectedIds.size === tasks.length) {
      this.selectedIds = new Set();
    } else {
      this.selectedIds = new Set(tasks.map(t => t.id));
    }
  }

  allSelected(tasks: Task[]): boolean {
    return tasks.length > 0 && this.selectedIds.size === tasks.length;
  }

  bulkMarkDone(): void {
    const ids = Array.from(this.selectedIds);
    this.taskService.bulkUpdateStatus(ids, 'completed').subscribe(() => {
      this.snackBar.open(`${ids.length} task(s) marked as completed`, 'OK', { duration: 2500 });
      this.selectedIds = new Set();
    });
  }

  bulkDelete(): void {
    const ids = Array.from(this.selectedIds);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Selected',
        message: `Delete ${ids.length} selected task(s)? This cannot be undone.`
      }
    });
    dialogRef.afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        this.taskService.bulkDelete(ids).subscribe(() => {
          this.snackBar.open(`${ids.length} task(s) deleted`, 'OK', { duration: 2500 });
          this.selectedIds = new Set();
        });
      }
    });
  }

  exportCsv(): void {
    this.taskService.exportCsv();
    this.snackBar.open('CSV exported!', 'OK', { duration: 2000 });
  }

  clearSelection(): void {
    this.selectedIds = new Set();
  }
}


