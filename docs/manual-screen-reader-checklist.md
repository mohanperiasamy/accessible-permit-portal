# Manual screen-reader and keyboard checklist

Automated tools such as axe find only part of all accessibility issues. Use this checklist for the manual checks.
**It has not been filled in yet.** Tick each item only after checking it yourself, and note the browser and screen reader versions you used.

Tested with: ____________ (e.g. JAWS + Chrome, NVDA + Firefox)   Date: ________

## Whole site
- [ ] The first Tab press shows "Skip to main content", and Enter moves focus to the main content.
- [ ] The page title is announced after each navigation (for example "Submit a request | Service Requests").
- [ ] Landmarks are listed correctly (banner, navigation "Main", main, contentinfo).
- [ ] The current page link in the navigation is announced as "current page".
- [ ] Everything works at 200% and 400% zoom without horizontal scrolling (except the data table region).
- [ ] The focus outline is visible on every interactive element.

## Service requests list
- [ ] The status filter is announced with its label ("Filter by status") and current value.
- [ ] Changing the filter announces the new result count (for example "1 request shown").
- [ ] Table navigation announces the caption, column headers and row headers (reference number).
- [ ] On a narrow screen (cards layout), each value is still read with its label.

## Submit a request form
- [ ] Each field is announced with its label, "required", and any hint text.
- [ ] The "About the request" and "Your contact details" groups are announced.
- [ ] Submitting the empty form moves focus to the error summary, and the summary is read out.
- [ ] Each link in the error summary moves focus to the matching field.
- [ ] Each invalid field announces its error message.
- [ ] After a successful submit, the confirmation and reference number are announced.

## Request details
- [ ] The details list reads each label with its value.
- [ ] Saving a new status announces "Status changed to …".
- [ ] A rejected status change (for example, an invalid transition) is announced as an alert.
