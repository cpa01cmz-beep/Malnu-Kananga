# Mobile Testing Guide

**Purpose**: Comprehensive guide for testing mobile optimization features on various devices

---

## Overview

This guide provides step-by-step instructions for testing mobile optimization features across different devices and browsers.

## Test Devices

### Recommended Test Devices

**Mobile Phones:**
- iPhone 12/13/14/15 (iOS)
- Samsung Galaxy S21/S22/S23 (Android)
- Google Pixel 6/7/8 (Android)
- Any budget Android device (e.g., Xiaomi, Oppo, Vivo)

**Tablets:**
- iPad (iOS)
- Samsung Galaxy Tab (Android)
- Any 7-10" Android tablet

**Desktop (for comparison):**
- Modern desktop browser (Chrome/Firefox/Safari)

## Test Browsers

- Chrome (Desktop & Android)
- Safari (Desktop & iOS)
- Firefox (Desktop & Android)
- Edge (Desktop & Android)
- Samsung Internet (Android)

---

## Feature Testing Checklist

### 1. Touch Gesture Recognition

#### Swipe Gestures
- [ ] Swipe left on dashboard cards
- [ ] Swipe right on notifications
- [ ] Swipe up on lists to refresh
- [ ] Swipe down to dismiss modal

**Expected Behavior:**
- Swipe threshold: 50px (configurable)
- Swipe direction correctly detected
- Distance and duration tracked
- Appropriate callback triggered

#### Pinch Gestures
- [ ] Pinch to zoom on images/charts
- [ ] Pinch in to缩小
- [ ] Pinch out to expand

**Expected Behavior:**
- Scale factor calculated (0.0-1.0 for缩小, >1.0 for扩展)
- Center point tracked
- Smooth scaling

#### Tap Gestures
- [ ] Single tap on buttons
- [ ] Tap on menu items
- [ ] Tap on list items

**Expected Behavior:**
- Tap detected on quick release (<300ms, <10px movement)
- Single tap (no double-tap)
- Touch feedback animation

#### Long Press Gestures
- [ ] Long press on dashboard items
- [ ] Long press on notifications
- [ ] Long press on list items

**Expected Behavior:**
- Long press detected after 500ms
- No movement threshold
- Context menu or action triggered

### 2. Haptic Feedback

**Test Scenarios:**
- [ ] Tap on button → Light vibration
- [ ] Success action (save, submit) → Success pattern
- [ ] Error action (validation fail) → Error pattern
- [ ] Warning action → Warning pattern
- [ ] Swipe gesture → Swipe pattern
- [ ] Pinch gesture → Scale pattern

**Expected Behavior:**
- Vibration patterns match constants:
  - Light: 10ms
  - Medium: 20ms
  - Heavy: 30ms
  - Success: [10, 30, 10]
  - Error: [50, 50, 50]
  - Warning: [20, 30]
- Feedback respects `enableHapticFeedback` setting

### 3. Mobile Detection

**Test Scenarios:**
- [ ] Open on mobile phone → isMobile: true
- [ ] Open on tablet → isMobile: true
- [ ] Open on desktop → isMobile: false
- [ ] Touch screen device → isTouchDevice: true
- [ ] Non-touch desktop → isTouchDevice: false

**Expected Behavior:**
- Accurate device detection via user agent
- Touch capability detection via `navigator.maxTouchPoints`
- Orientation detection (portrait/landscape)

### 4. Touch Target Optimization

**Test Scenarios:**
- [ ] Small buttons automatically padded
- [ ] Touch targets meet 44x44px minimum
- [ ] Custom min sizes respected
- [ ] Padding applied correctly

**Expected Behavior:**
- Elements < 44x44px get padded
- Padding applied to all sides
- Touch targets meet WCAG 2.1 AA standards
- Custom sizes override default

### 5. Performance Utilities

#### Debounce
- [ ] Scroll events debounced (150ms default)
- [ ] Resize events debounced (100ms default)
- [ ] Custom delays respected

**Expected Behavior:**
- Only last call executed within delay window
- Previous calls cancelled
- No performance degradation

#### Throttle
- [ ] Continuous touch moves throttled (100ms default)
- [ ] Updates limited to frequency
- [ ] Smooth animations maintained

**Expected Behavior:**
- At most one call per delay period
- First call executed immediately
- Subsequent calls within delay skipped

#### Prevent Double Tap
- [ ] Single tap triggers action
- [ ] Quick double tap triggers only one action
- [ ] 300ms delay respected

**Expected Behavior:**
- First tap executes
- Second tap within 300ms ignored
- Normal tap after delay works

### 6. Viewport & Keyboard

**Test Scenarios:**
- [ ] Keyboard appears on focus
- [ ] Viewport height adjusts correctly
- [ ] isKeyboardVisible detects state
- [ ] Layout adapts to keyboard

**Expected Behavior:**
- Visual viewport API used (if available)
- Keyboard detection works on mobile
- Height returned excludes keyboard (75% threshold)
- Smooth adjustment without jank

### 7. Orientation & Resize

**Test Scenarios:**
- [ ] Rotate from portrait to landscape
- [ ] Rotate from landscape to portrait
- [ ] Resize browser window
- [ ] Resize on mobile device

**Expected Behavior:**
- State updates within 150ms (debounced)
- Touch target sizes recalculated
- Layout reflows smoothly
- No layout shift

### 8. Mobile Performance Metrics

**Test Metrics:**
- [ ] Screen size detected correctly
- [ ] Device pixel ratio tracked
- [ ] Performance metrics collected
- [ ] Metrics update on resize/orientation

**Expected Behavior:**
- Accurate viewport dimensions
- Correct pixel ratio (1x, 2x, 3x)
- Real-time updates
- Low overhead (<1ms)

---

## Performance Benchmarks

### Mobile Performance Targets

- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Time to Interactive (TTI)**: < 3.8s
- **Cumulative Layout Shift (CLS)**: < 0.1

### JavaScript Bundle Size

- **Initial Bundle**: < 200KB gzipped
- **Route-based chunks**: < 100KB each
- **Vendor bundle**: < 150KB gzipped

### Interaction Latency

- **Touch response**: < 50ms
- **Gesture detection**: < 16ms (60fps)
- **Haptic feedback**: < 10ms

---

## Automated Testing

### Unit Tests

Run mobile optimization unit tests:
```bash
npm test -- mobileOptimization
npm test -- hapticFeedback
npm test -- useTouchGestures
npm test -- useMobileOptimization
```

### E2E Tests

Run Playwright mobile tests:
```bash
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

### Lighthouse Audits

Run Lighthouse on mobile:
```bash
npx lighthouse https://your-app.com --view --preset=mobile --quiet
```

**Target Scores:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

---

## Common Issues & Solutions

### Issue: Touch Events Not Working

**Symptoms:**
- Swipe/tap gestures not detected
- No callback triggered

**Solutions:**
1. Ensure `passive: true` event listeners
2. Check element has `touch-action: none` CSS
3. Verify element is in viewport (visible)
4. Check z-index (not behind other elements)

### Issue: Haptic Feedback Not Working

**Symptoms:**
- No vibration on actions
- Console errors

**Solutions:**
1. Check device supports vibration (`navigator.vibrate`)
2. Ensure `enableHapticFeedback` is true
3. Browser may block vibration (check permissions)
4. iOS doesn't support haptic feedback via API

### Issue: Double Tap Still Fires

**Symptoms:**
- Actions trigger twice
- Quick taps not prevented

**Solutions:**
1. Verify `preventDoubleTap` is attached to element
2. Check 300ms delay is respected
3. Ensure callback isn't attached multiple times
4. Check event bubbling (stop propagation)

### Issue: Performance Degradation

**Symptoms:**
- Janky animations
- Slow response
- High CPU usage

**Solutions:**
1. Ensure debounce/throttle is applied
2. Use `requestAnimationFrame` for animations
3. Reduce re-renders (React.memo)
4. Check for memory leaks (event listeners not cleaned up)

---

## Browser-Specific Notes

### Chrome/Android

- Full haptic feedback support
- Excellent touch event support
- Visual Viewport API available
- Consider Chrome DevTools Device Mode

### Safari/iOS

- **No haptic feedback** via Web API (use CSS :active for feedback)
- Touch events have 300ms delay (use fastclick or viewport meta)
- Visual Viewport API available (iOS 13+)
- Test on real device (simulator has differences)

### Firefox/Android

- Good touch event support
- Haptic feedback supported
- Similar to Chrome behavior
- Use Firefox Developer Tools for testing

---

## Testing Tools

### Chrome DevTools Device Mode

1. Open Chrome DevTools (F12)
2. Click Device Toolbar (Ctrl+Shift+M)
3. Select device from dropdown
4. Enable "Show device frame"
5. Test gestures and interactions

### Safari Web Inspector

1. Enable Developer menu in Safari preferences
2. Connect iOS device via USB
3. Open Safari > Develop > [Device]
4. Inspect and test on real device

### Android Debug Bridge (ADB)

```bash
# Enable USB debugging on Android device
# Connect via USB
adb devices
# View logs
adb logcat | grep -i touch
```

### Lighthouse

```bash
# Run Lighthouse mobile audit
npm run lighthouse:mobile
```

---

## Reporting Issues

When reporting mobile issues, include:

1. Device model and OS version
2. Browser version
3. Screen size and orientation
4. Steps to reproduce
5. Expected vs actual behavior
6. Screenshots or screen recordings
7. Console errors/logs
8. Network conditions (if applicable)

---

## Continuous Testing

### Pre-Release Checklist

- [ ] Test on at least 2 iOS devices
- [ ] Test on at least 2 Android devices
- [ ] Test on tablet (iOS and Android)
- [ ] Test in Chrome, Safari, Firefox
- [ ] Run Lighthouse mobile audit
- [ ] Verify all touch gestures work
- [ ] Check haptic feedback (Android)
- [ ] Verify performance benchmarks
- [ ] Test on slow 3G network
- [ ] Test with keyboard (form fields)

### Regression Testing

After any mobile-related changes:
1. Run all mobile optimization tests
2. Test on real devices
3. Verify no performance regression
4. Check Lighthouse scores

---

**Last Updated**: 2026-01-15
**Maintained By**: Autonomous System Guardian
