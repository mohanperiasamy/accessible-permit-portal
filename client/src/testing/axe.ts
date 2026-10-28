import axe from 'axe-core';

/**
 * Runs axe-core against a rendered component in jsdom.
 * Color contrast is skipped here because jsdom does not compute real styles;
 * it is covered by the browser-based check in scripts/a11y-check.mjs.
 */
export async function axeViolations(element: Element): Promise<axe.Result[]> {
  const results = await axe.run(element, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    rules: { 'color-contrast': { enabled: false } },
  });
  return results.violations;
}

export function describeViolations(violations: axe.Result[]): string {
  return violations.map((v) => `${v.id}: ${v.help}`).join('\n');
}
