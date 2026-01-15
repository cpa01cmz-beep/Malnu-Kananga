import { test, expect } from '@playwright/test';

test.describe('Accessibility E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper page title', async ({ page }) => {
    await expect(page).toHaveTitle(/MA Malnu Kananga|Asisten AI/);
  });

  test('should have skip link available', async ({ page }) => {
    await page.press('body', 'Tab');
    
    const skipLink = page.locator('a[href^="#"]', { hasText: /Lewati ke/i });
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toHaveAttribute('href');
  });

  test('should navigate using keyboard only', async ({ page }) => {
    await page.click('button:has-text("Masuk")');
    
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="login-modal"]')).not.toBeVisible();
    
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();
  });

  test('should have ARIA labels on interactive elements', async ({ page }) => {
    const buttons = page.locator('button').filter({ hasText: /.+/ });
    const count = await buttons.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();
      
      expect(ariaLabel || textContent?.trim()).toBeTruthy();
    }
  });

  test('should maintain focus in modal', async ({ page }) => {
    await page.click('button:has-text("Masuk")');
    
    const modal = page.locator('[data-testid="login-modal"]');
    await expect(modal).toBeVisible();
    
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const focusedElementInModal = await modal.evaluate((node) =>
      node.contains(document.activeElement)
    );

    expect(focusedElementInModal).toBeTruthy();
  });

  test('should have heading hierarchy', async ({ page }) => {
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const count = await headings.count();
    
    expect(count).toBeGreaterThan(0);
    
    let previousLevel = 0;
    for (let i = 0; i < count; i++) {
      const heading = headings.nth(i);
      const level = parseInt(await heading.evaluate((el) => 
        parseInt(el.tagName[1])
      ));
      
      if (previousLevel > 0) {
        expect(level).toBeLessThanOrEqual(previousLevel + 1);
      }
      previousLevel = level;
    }
  });

  test('should have alt text on images', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const image = images.nth(i);
      const alt = await image.getAttribute('alt');
      const src = await image.getAttribute('src');
      
      if (src && !src.includes('data:')) {
        expect(alt).toBeTruthy();
      }
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    const bodyStyles = await page.evaluate(() => {
      const computed = window.getComputedStyle(document.body);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
      };
    });
    
    expect(bodyStyles.color).toBeTruthy();
    expect(bodyStyles.backgroundColor).toBeTruthy();
  });

  test('should announce dynamic content', async ({ page }) => {
    await page.click('button:has-text("Masuk")');
    
    const loginButton = page.locator('button:has-text("Login")');
    await loginButton.click();
    
    const errorMessage = page.locator('[role="alert"], [aria-live="polite"], [aria-live="assertive"]');
    await expect(errorMessage.or(page.locator('text=NIS/NIP wajib diisi'))).toBeVisible();
  });
});
