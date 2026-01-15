/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, type Page } from '@playwright/test';

export type TestOptions = {
  baseURL: string;
};

export const test = base.extend<TestOptions>({
  baseURL: async (_context, use) => {
    const url = process.env.BASE_URL || 'http://localhost:5173';
    await use(url);
  },
});

export const expect = base.expect;

export async function performLogin(
  page: Page,
  username: string,
  password: string
) {
  await page.click('button:has-text("Masuk")');
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button:has-text("Login")');
}

export async function waitForNavigation(
  page: Page,
  urlPattern: RegExp
) {
  await page.waitForURL(urlPattern);
}

export async function waitForElement(
  page: Page,
  selector: string,
  timeout = 5000
) {
  await page.waitForSelector(selector, { timeout });
}

export async function takeScreenshot(
  page: Page,
  name: string
) {
  await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
}
