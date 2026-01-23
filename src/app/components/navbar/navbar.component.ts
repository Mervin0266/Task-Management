import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @Output() themeToggled = new EventEmitter<boolean>();

  isDarkMode = false;
  isLoggedIn = false;

  constructor(private readonly router: Router, private readonly auth: AuthService) {
    this.auth.isLoggedIn$.subscribe((state) => (this.isLoggedIn = state));
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-theme', this.isDarkMode);
    this.themeToggled.emit(this.isDarkMode);
  }

  toggleAuth(): void {
    if (this.isLoggedIn) {
      this.auth.logout();
    } else {
      this.auth.login().subscribe();
    }
  }
}
