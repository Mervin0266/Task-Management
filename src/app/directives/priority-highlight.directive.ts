import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';
import { Task } from '../models/task.model';

@Directive({
  selector: '[appPriorityHighlight]'
})
export class PriorityHighlightDirective implements OnChanges {
  @Input() appPriorityHighlight?: Task;

  constructor(private readonly el: ElementRef, private readonly renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appPriorityHighlight']) {
      this.applyStyles();
    }
  }

  private applyStyles(): void {
    const task = this.appPriorityHighlight;
    if (!task) return;

    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
    const highPriority = task.priority === 'high';

    const outline = isOverdue ? '#d32f2f' : highPriority ? '#f57c00' : '#e0e0e0';
    this.renderer.setStyle(this.el.nativeElement, 'border-left', `6px solid ${outline}`);
    this.renderer.setStyle(this.el.nativeElement, 'border-radius', '8px');
    this.renderer.setStyle(this.el.nativeElement, 'padding', '8px 12px');
    if (isOverdue) {
      this.renderer.setStyle(this.el.nativeElement, 'box-shadow', '0 0 0 2px rgba(211,47,47,0.15)');
    }
  }
}
