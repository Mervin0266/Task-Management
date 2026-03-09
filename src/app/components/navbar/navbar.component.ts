import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  @Output() themeToggled = new EventEmitter<boolean>();

  isDarkMode = false;
  isLoggedIn = false;

  private readonly themeKey = 'focusflow-dark-mode';

  constructor(private readonly auth: AuthService) {
    this.auth.isLoggedIn$.subscribe((state) => (this.isLoggedIn = state));
  }

  ngOnInit(): void {
    const saved = localStorage.getItem(this.themeKey);
    if (saved === 'true') {
      this.isDarkMode = true;
      document.body.classList.add('dark-theme');
      this.themeToggled.emit(true);
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-theme', this.isDarkMode);
    localStorage.setItem(this.themeKey, String(this.isDarkMode));
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

