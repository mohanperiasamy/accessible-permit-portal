import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App shell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('has a skip link that targets the focusable main region', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    const skip = el.querySelector<HTMLAnchorElement>('a.skip-link')!;
    const main = el.querySelector<HTMLElement>('main')!;

    expect(skip.textContent?.trim()).toBe('Skip to main content');
    expect(skip.getAttribute('href')).toBe('#main-content');
    expect(main.id).toBe('main-content');
    expect(main.getAttribute('tabindex')).toBe('-1');
    // The skip link must be the first focusable element on the page.
    expect(el.querySelector('a, button, input, select, textarea')).toBe(skip);
  });

  it('labels the main navigation landmark', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const nav = (fixture.nativeElement as HTMLElement).querySelector('nav');
    expect(nav?.getAttribute('aria-label')).toBe('Main');
  });
});
