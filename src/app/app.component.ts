import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @HostBinding('class.dark-theme') darkTheme = false;

  handleThemeToggle(enabled: boolean): void {
    this.darkTheme = enabled;
  }
}
