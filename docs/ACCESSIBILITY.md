# Accessibility Guidelines

This document provides comprehensive accessibility guidelines for MA Malnu Kananga development.

## Overview

MA Malnu Kananga is committed to ensuring accessibility (a11y) for all users, including those with disabilities. We follow WCAG 2.1 AA standards and aim for a high accessibility score on all metrics.

## WCAG 2.1 AA Compliance

Our accessibility implementation follows the Web Content Accessibility Guidelines (WCAG) 2.1 AA level, which includes:

1. **Perceivable**: Information and UI components must be presentable in ways users can perceive.
2. **Operable**: UI components and navigation must be operable.
3. **Understandable**: Information and the operation of the UI must be understandable.
4. **Robust**: Content must be robust enough to be interpreted by a wide variety of user agents, including assistive technologies.

## Key Accessibility Features

### 1. Skip Links

**Implementation**: `src/components/ui/SkipLink.tsx`

Skip links allow keyboard users to bypass repetitive content and navigate directly to main content.

**Usage**:
```tsx
<SkipLink
  targets={[
    { id: 'main-nav', label: 'Langsung ke navigasi utama' },
    { id: 'main-content', label: 'Langsung ke konten utama' },
    { id: 'footer', label: 'Langsung ke footer' },
  ]}
/>
```

**Best Practices**:
- Place skip links at the top of the page
- Ensure target elements have matching IDs
- Provide clear, descriptive labels
- Make skip links visible on focus

### 2. Keyboard Navigation

All interactive elements must be keyboard accessible:

**Tab Order**:
- Logical tab flow following DOM order
- Skip links for content sections
- Focus trapping in modals

**Keyboard Shortcuts**:
- `Enter`: Activate buttons/links
- `Space`: Toggle checkboxes/radio buttons
- `Escape`: Close modals/dropdowns
- `Tab`: Move focus forward
- `Shift + Tab`: Move focus backward
- Arrow keys: Navigate within components (lists, grids)

**Implementation**: Use `useFocusTrap` hook for modals

### 3. ARIA Attributes

Use ARIA attributes to enhance accessibility when semantic HTML isn't sufficient.

**Key ARIA Attributes**:
- `role`: Defines element's purpose
- `aria-label`: Provides accessible name for icon-only buttons
- `aria-labelledby`: Associates element with text label
- `aria-describedby`: Associates element with descriptive text
- `aria-hidden`: Hides decorative content from screen readers
- `aria-live`: Announces dynamic content changes
- `aria-modal`: Identifies modal dialogs
- `aria-expanded`: Indicates expanded/collapsed state
- `aria-current`: Identifies current item in navigation

**Constants**: Use `src/config/accessibility.ts` for ARIA constants

### 4. Forms

**Label Association**:
```tsx
<label htmlFor="email">Email</label>
<input type="email" id="email" required />
```

**Error Messages**:
```tsx
<label htmlFor="password">Password</label>
<input
  type="password"
  id="password"
  aria-invalid="true"
  aria-describedby="password-error"
/>
<span id="password-error" role="alert">
  Password must be at least 8 characters
</span>
```

**Form Groups**:
```tsx
<fieldset>
  <legend>Choose your role</legend>
  <label>
    <input type="radio" name="role" value="student" />
    Student
  </label>
</fieldset>
```

### 5. Images

**Decorative Images**:
```tsx
<img src="icon.svg" alt="" role="presentation" />
```

**Informative Images**:
```tsx
<img src="chart.png" alt="Student grade distribution chart" />
```

**Complex Images**:
```tsx
<figure>
  <img src="complex-chart.png" alt="" />
  <figcaption>Detailed description of the chart</figcaption>
</figure>
```

### 6. Color and Contrast

Ensure sufficient color contrast:

- **Normal text** (below 18pt): 4.5:1 contrast ratio
- **Large text** (18pt and above, or 14pt bold): 3.0:1 contrast ratio
- Never rely on color alone to convey information
- Provide text alternatives for color-coded information

**Constants**: See `WCAG_2_1_AA_LEVELS` in `src/config/accessibility.ts`

### 7. Dynamic Content (Live Regions)

Use live regions to announce dynamic content changes:

```tsx
<div role="log" aria-live="polite" aria-atomic="true">
  {messages.map(message => (
    <div key={message.id}>{message.text}</div>
  ))}
</div>
```

**Politeness Levels**:
- `polite`: Wait until user is idle to announce (for non-critical updates)
- `assertive`: Interrupt immediately (for critical errors/notifications)

**Implementation**: Use `useAnnouncer` hook

### 8. Modals and Dialogs

**Requirements**:
- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby` (if dialog has title)
- `aria-describedby` (if dialog has description)
- Focus trapping
- Escape key to close
- Return focus to trigger element

**Implementation**: Use `Modal` component from `src/components/ui/Modal.tsx`

### 9. Focus Management

**Visible Focus Indicators**:
```tsx
<button className="focus:outline-none focus:ring-2 focus:ring-primary-500">
  Click me
</button>
```

**Focus Trapping**:
Use `useFocusTrap` hook for modals and dropdowns

**Focus Restoration**:
Always restore focus to the element that triggered a modal/dialog when closing

### 10. Screen Reader Support

**Semantic HTML**: Use appropriate HTML elements
- `<nav>` for navigation
- `<main>` for main content
- `<section>` for content sections
- `<article>` for self-contained content
- `<aside>` for complementary content
- `<footer>` for footer information
- `<header>` for header content

**Heading Hierarchy**:
- Use `<h1>` for page title (one per page)
- Use `<h2>`-`<h6>` for section headings (skip levels)
- Maintain logical heading hierarchy

## Accessibility Testing

### Automated Testing

We use `jest-axe` for automated accessibility testing:

```bash
npm run test:run -- accessibility
```

**Test Files**:
- `src/components/__tests__/accessibility.audit.test.tsx`: Comprehensive accessibility audit
- `src/components/ui/__tests__/SkipLink.test.tsx`: Skip link component tests

### Manual Testing

1. **Keyboard Navigation**: Test all functionality with keyboard only
2. **Screen Reader**: Test with NVDA (Windows), VoiceOver (Mac), or TalkBack (Android)
3. **Color Contrast**: Use contrast checker tools
4. **Zoom/Resize**: Test at 200% zoom and different screen sizes
5. **Browser Tools**: Use Lighthouse accessibility audit

### Lighthouse Score

Target scores:
- **Accessibility**: > 95
- **Performance**: > 90
- **Best Practices**: > 90

## Accessibility Hooks

We provide several custom hooks for accessibility:

### `useAnnouncer`

Announces messages to screen readers.

```tsx
const { announce } = useAnnouncer();

// Announce non-critical update
announce('New message received', 'polite');

// Announce critical error
announce('Form submission failed', 'assertive');
```

### `useFocusContainment`

Manages focus trapping for modals and dialogs.

```tsx
const containerRef = useFocusContainment(isModalOpen, handleClose);

<div ref={containerRef}>
  {/* Modal content */}
</div>
```

### `useKeyboardNavigation`

Handles keyboard navigation within interactive components.

```tsx
const { handleKeyDown } = useKeyboardNavigation(items, {
  orientation: 'vertical',
  loop: true,
  onEnter: handleSelect,
});

<div onKeyDown={handleKeyDown}>
  {items.map(item => (
    <button key={item.id} ref={item.ref}>
      {item.label}
    </button>
  ))}
</div>
```

### `useReducedMotion`

Detects user's reduced motion preference.

```tsx
const prefersReducedMotion = useReducedMotion();

<div className={prefersReducedMotion ? 'no-animation' : 'animated'}>
  Content
</div>
```

### `usePrefersColorScheme`

Detects user's color scheme preference.

```tsx
const prefersColorScheme = usePrefersColorScheme();

// Force dark mode based on user preference
if (prefersColorScheme === 'dark') {
  enableDarkMode();
}
```

## Accessibility Checklist

When developing new features, ensure:

- [ ] All interactive elements are keyboard accessible
- [ ] Visible focus indicators on all focusable elements
- [ ] Proper ARIA labels for icon-only buttons
- [ ] Form fields have associated labels
- [ ] Error messages use `role="alert"` and are associated with inputs
- [ ] Images have appropriate alt text
- [ ] Color contrast meets WCAG AA standards
- [ ] Dynamic content uses live regions for screen readers
- [ ] Modals trap focus and restore it on close
- [ ] Semantic HTML elements used appropriately
- [ ] Heading hierarchy is logical
- [ ] Skip links provided for content sections
- [ ] Tables have proper headers (`<th>` with `scope`)
- [ ] Links have descriptive text (not "click here")
- [ ] Motion respects `prefers-reduced-motion`
- [ ] Automated accessibility tests pass

## Resources

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Tools
- [axe DevTools](https://www.deque.com/axe/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WAVE](https://wave.webaim.org/)
- [Color Contrast Analyzer](https://webaim.org/resources/contrastchecker/)
- [VoiceOver Utility](https://www.paciellogroup.com/resources/voicetool/)

### Browser Testing
- Test with screen readers: NVDA, VoiceOver, TalkBack
- Test with keyboard: Tab, Arrow keys, Enter, Space, Escape
- Test with zoom: 200%, 400%
- Test color schemes: Light, dark, high contrast

## Contributing to Accessibility

When contributing to MA Malnu Kananga:

1. **Write Accessible Code**: Follow the guidelines in this document
2. **Test with Tools**: Run automated tests with jest-axe
3. **Manual Testing**: Test with keyboard and screen reader
4. **Update Documentation**: Update this document if you introduce new patterns
5. **Review Accessibility**: Ensure code review includes accessibility review

## Accessibility Support

For accessibility issues or questions, please:
- Create an issue with the `accessibility` label
- Provide detailed steps to reproduce
- Include browser and assistive technology information
- Attach screenshots if applicable

---

**Last Updated**: 2026-01-15
**Maintained By**: Autonomous System Guardian
