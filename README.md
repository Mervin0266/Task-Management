# Task Management & Productivity Tracker (Angular 17)

Modern task tracker built with Angular 17 and Angular Material. Includes CRUD flows, filtering, guards, theming, and local storage persistence.

## Features
- Task CRUD with details view and reactive form validation
- Filters by search, category, status, and priority (custom pipe)
- Priority/overdue highlighting (custom directive)
- Auth guard protecting edit routes (mock auth service)
- Angular Material UI with dark/light toggle
- Local storage persistence plus seed data from assets/tasks.json
- Error interceptor with snack bar notifications

## Stack
- Angular 17, TypeScript 5
- Angular Material, RxJS, SCSS

## Getting Started
1) Install dependencies: `npm install`
2) Dev server: `npm start` (or `ng serve`) then open http://localhost:4200
3) Production build: `npm run build` (output in `dist/task-tracker`)

## Project Structure
- `src/app/models` — Task, Category, User types
- `src/app/services` — TaskService (state + persistence), AuthService
- `src/app/guards` — AuthGuard for edit routes
- `src/app/interceptors` — ErrorInterceptor for HTTP errors
- `src/app/pipes` — TaskFilterPipe for list filtering
- `src/app/directives` — PriorityHighlightDirective for visual cues
- `src/app/components` — Navbar, TaskList, TaskForm, TaskDetail, ConfirmDialog
- `src/assets/tasks.json` — Seed data

## Scripts
- `npm start` — Run dev server
- `npm run build` — Production build
- `npm test` — Unit tests (Karma)

## Data & Persistence
- Tasks/categories stored in `localStorage` using keys `task-tracker-tasks` and `task-tracker-categories`
- On first load, falls back to seed data in `assets/tasks.json`

## Theming
- Angular Material theme with light/dark toggle from navbar
- PriorityHighlightDirective adds visual emphasis for overdue/high-priority tasks

## Notes
- Budgets in `angular.json` increased to accommodate current bundle size; tighten if you add further optimizations.
# Task-Management
