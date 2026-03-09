import { Pipe, PipeTransform } from '@angular/core';

export interface DueDateInfo {
  label: string;
  overdue: boolean;
  daysLeft: number;
}

@Pipe({ name: 'dueDate', standalone: true })
export class DueDatePipe implements PipeTransform {
  transform(dueDate: string, status?: string): DueDateInfo {
    if (status === 'completed') {
      return { label: 'Completed', overdue: false, daysLeft: 0 };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffMs = due.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return { label: `${Math.abs(daysLeft)}d overdue`, overdue: true, daysLeft };
    } else if (daysLeft === 0) {
      return { label: 'Due today', overdue: false, daysLeft };
    } else if (daysLeft === 1) {
      return { label: 'Due tomorrow', overdue: false, daysLeft };
    } else {
      return { label: `${daysLeft}d left`, overdue: false, daysLeft };
    }
  }
}
