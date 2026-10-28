import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, skip } from 'rxjs';
import { PageFocus } from './core/page-focus';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly pageFocus = inject(PageFocus);

  constructor() {
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        skip(1), // Leave focus alone on first load; move it on every later navigation.
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => this.pageFocus.focusMainHeading());
  }

  skipToMain(event: Event): void {
    event.preventDefault();
    document.getElementById('main-content')?.focus();
  }
}
