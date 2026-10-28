import { LiveAnnouncer } from '@angular/cdk/a11y';
import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

/**
 * Single-page apps do not reload the page, so screen-reader users get no signal that
 * the view changed. After each navigation we move focus to the page heading and
 * announce the new page title.
 */
@Injectable({ providedIn: 'root' })
export class PageFocus {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly announcer = inject(LiveAnnouncer);

  focusMainHeading(): void {
    // Wait a tick so the routed component has rendered.
    setTimeout(() => {
      const heading = this.document.querySelector<HTMLElement>('main h1');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus();
      }
      this.announcer.announce(this.title.getTitle(), 'polite');
    });
  }
}
