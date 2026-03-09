import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { Category, Task, TaskPriority, TaskStatus, User } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly storageKey = 'task-tracker-tasks';
  private readonly categoryKey = 'task-tracker-categories';
  private readonly tasks$ = new BehaviorSubject<Task[]>([]);
  private readonly categories$ = new BehaviorSubject<Category[]>([]);
  private readonly users: User[] = [
    { id: 'u-1', name: 'Alex Johnson', role: 'Manager' },
    { id: 'u-2', name: 'Priya Singh', role: 'Engineer' },
    { id: 'u-3', name: 'Luis Martinez', role: 'Designer' }
  ];

  constructor(private readonly http: HttpClient) {
    this.hydrateFromStorage();
    this.ensureSeedData();
  }

  get tasks(): Observable<Task[]> {
    return this.tasks$.asObservable();
  }

  get categories(): Observable<Category[]> {
    return this.categories$.asObservable();
  }

  getUsers(): User[] {
    return this.users;
  }

  getTask(id: string): Observable<Task | undefined> {
    return this.tasks.pipe(map((items: Task[]) => items.find((t: Task) => t.id === id)));
  }

  addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Observable<Task> {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [...this.tasks$.value, newTask];
    this.persist(updated);
    return of(newTask);
  }

  updateTask(id: string, partial: Partial<Task>): Observable<Task | undefined> {
    const updatedList = this.tasks$.value.map((task: Task) =>
      task.id === id ? { ...task, ...partial, updatedAt: new Date().toISOString() } : task
    );
    this.persist(updatedList);
    return of(updatedList.find((t: Task) => t.id === id));
  }

  deleteTask(id: string): Observable<boolean> {
    const updatedList = this.tasks$.value.filter((task: Task) => task.id !== id);
    this.persist(updatedList);
    return of(true);
  }

  bulkDelete(ids: string[]): Observable<boolean> {
    const updatedList = this.tasks$.value.filter((task: Task) => !ids.includes(task.id));
    this.persist(updatedList);
    return of(true);
  }

  bulkUpdateStatus(ids: string[], status: TaskStatus): Observable<boolean> {
    const updatedList = this.tasks$.value.map((task: Task) =>
      ids.includes(task.id)
        ? { ...task, status, progress: status === 'completed' ? 100 : this.getProgressForStatus(status), updatedAt: new Date().toISOString() }
        : task
    );
    this.persist(updatedList);
    return of(true);
  }

  exportCsv(): void {
    const tasks = this.tasks$.value;
    const headers = ['Title', 'Description', 'Category', 'Priority', 'Status', 'Progress', 'Due Date', 'Tags', 'Created At'];
    const rows = tasks.map(t => [
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.categoryId,
      t.priority,
      t.status,
      t.progress,
      t.dueDate,
      `"${(t.tags || []).join('; ')}"`,
      t.createdAt
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `focusflow-tasks-${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  updateStatus(id: string, status: TaskStatus): Observable<Task | undefined> {
    return this.updateTask(id, {
      status,
      progress: status === 'completed' ? 100 : this.getProgressForStatus(status)
    });
  }

  filterTasks(filter: {
    search?: string;
    categoryId?: string;
    status?: TaskStatus | 'all';
    priority?: TaskPriority | 'all';
  }): Observable<Task[]> {
    return this.tasks.pipe(
      map((list: Task[]) =>
        list.filter((task: Task) => {
          const matchesSearch = filter.search
            ? task.title.toLowerCase().includes(filter.search.toLowerCase()) ||
              task.description.toLowerCase().includes(filter.search.toLowerCase())
            : true;
          const matchesCategory = filter.categoryId ? task.categoryId === filter.categoryId : true;
          const matchesStatus = filter.status && filter.status !== 'all' ? task.status === filter.status : true;
          const matchesPriority =
            filter.priority && filter.priority !== 'all' ? task.priority === filter.priority : true;
          return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
        })
      )
    );
  }

  setCategories(categories: Category[]): void {
    this.categories$.next(categories);
    localStorage.setItem(this.categoryKey, JSON.stringify(categories));
  }

  private persist(list: Task[]): void {
    this.tasks$.next(list);
    localStorage.setItem(this.storageKey, JSON.stringify(list));
  }

  private hydrateFromStorage(): void {
    const tasksRaw = localStorage.getItem(this.storageKey);
    const categoriesRaw = localStorage.getItem(this.categoryKey);
    if (tasksRaw) {
      this.tasks$.next(JSON.parse(tasksRaw));
    }
    if (categoriesRaw) {
      this.categories$.next(JSON.parse(categoriesRaw));
    }
  }

  private ensureSeedData(): void {
    if (this.tasks$.value.length && this.categories$.value.length) {
      return;
    }
    this.http
      .get<{ tasks: Task[]; categories: Category[] }>('assets/tasks.json')
      .pipe(
        catchError(() => of({ tasks: [], categories: [] })),
        tap((payload: { tasks: Task[]; categories: Category[] }) => {
          if (!this.categories$.value.length && payload.categories.length) {
            this.setCategories(payload.categories);
          }
          if (!this.tasks$.value.length && payload.tasks.length) {
            this.persist(payload.tasks);
          }
        })
      )
      .subscribe();
  }

  private getProgressForStatus(status: TaskStatus): number {
    if (status === 'pending') return 10;
    if (status === 'in-progress') return 50;
    return 100;
  }
}
