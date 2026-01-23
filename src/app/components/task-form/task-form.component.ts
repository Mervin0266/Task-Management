import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable, map, switchMap, tap } from 'rxjs';
import { Category, Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  categories$!: Observable<Category[]>;
  isEdit = false;
  taskId?: string;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.maxLength(500)]],
    categoryId: ['', Validators.required],
    priority: ['medium', Validators.required],
    status: ['pending', Validators.required],
    dueDate: ['', Validators.required],
    tags: [''],
    progress: [25, [Validators.min(0), Validators.max(100)]]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly taskService: TaskService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.categories$ = this.taskService.categories;
    this.route.paramMap
      .pipe(
        tap((params: ParamMap) => {
          const id = params.get('id');
          if (id) {
            this.isEdit = true;
            this.taskId = id;
          }
        }),
        switchMap((params: ParamMap) => this.taskService.getTask(params.get('id') || '')),
        tap((task: Task | undefined) => {
          if (task) {
            this.form.patchValue({
              title: task.title,
              description: task.description,
              categoryId: task.categoryId,
              priority: task.priority,
              status: task.status,
              dueDate: task.dueDate,
              tags: (task.tags || []).join(', '),
              progress: task.progress
            });
          }
        })
      )
      .subscribe();
  }

  backToList(): void {
    this.router.navigate(['/tasks']);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const dueValue = value.dueDate as unknown;
    const dueDate = dueValue instanceof Date ? dueValue.toISOString() : value.dueDate || '';

    const payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: value.title!,
      description: value.description!,
      categoryId: value.categoryId!,
      priority: value.priority as Task['priority'],
      status: value.status as Task['status'],
      dueDate,
      progress: value.progress ?? 0,
      tags: value.tags ? value.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
    };

    const save$ = this.isEdit && this.taskId
      ? this.taskService.updateTask(this.taskId, payload)
      : this.taskService.addTask(payload);

    save$?.subscribe(() => this.router.navigate(['/tasks']));
  }

  getError(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control || !control.touched || !control.errors) return '';
    if (control.hasError('required')) return 'This field is required';
    if (control.hasError('minlength')) return 'Must be at least 3 characters';
    if (control.hasError('maxlength')) return 'Exceeds maximum length';
    if (control.hasError('min')) return 'Value is too low';
    if (control.hasError('max')) return 'Value is too high';
    return 'Invalid value';
  }
}
