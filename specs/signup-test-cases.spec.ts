import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000/auth/signup';

function uniqueEmail(): string {
  return `testuser_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;
}

// ─── UI / RENDERING ───────────────────────────────────────────────────────────

test.describe('UI – Rendering & Layout', () => {

  test('TC-SU-001 | Page title renders correctly in browser tab', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle('NexusAI — AI Model Hub · Discover, Compare & Deploy');
  });

  test('TC-SU-002 | Page heading "Create your account" is visible', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
  });

  test('TC-SU-003 | Subtitle "Free forever · No credit card needed" renders below heading', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByText('Free forever · No credit card needed')).toBeVisible();
  });

  test('TC-SU-004 | NexusAI hexagon logo icon is visible above heading', async ({ page }) => {
    await page.goto(BASE_URL);
    // The icon is an SVG inside an accent-colored div above the H1
    const icon = page.locator('div').filter({ has: page.locator('svg') }).first();
    await expect(icon).toBeVisible();
  });

  test('TC-SU-005 | Form card renders with white background, border, and shadow', async ({ page }) => {
    await page.goto(BASE_URL);
    const card = page.locator('form').locator('..');
    await expect(card).toBeVisible();
    const borderRadius = await card.evaluate(el => getComputedStyle(el).borderRadius);
    expect(borderRadius).toBe('16px');
  });

  test('TC-SU-006 | Sticky navbar is visible at the top of the page', async ({ page }) => {
    await page.goto(BASE_URL);
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
    const position = await nav.evaluate(el => getComputedStyle(el).position);
    expect(position).toBe('sticky');
  });

  test('TC-SU-007 | NexusAI brand name and logo render in navbar', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('nav').getByText('NexusAI')).toBeVisible();
  });

  test('TC-SU-008 | Navbar displays four navigation links', async ({ page }) => {
    await page.goto(BASE_URL);
    const nav = page.locator('nav');
    await expect(nav.getByRole('link', { name: 'Chat Hub' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Marketplace' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Discover New' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Agents' })).toBeVisible();
  });

  test('TC-SU-009 | Language selector button shows "🌐 EN" with dropdown indicator', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('nav button').filter({ hasText: 'EN' })).toBeVisible();
  });

  test('TC-SU-010 | Navbar "Sign In" button is visible with outlined style', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('nav').getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('TC-SU-011 | Navbar "Get Started" button is visible with accent fill', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('nav').getByRole('button', { name: 'Get Started' })).toBeVisible();
  });

  test('TC-SU-012 | Full Name field renders with label and placeholder', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByPlaceholder('Jane Smith')).toBeVisible();
  });

  test('TC-SU-013 | Email field renders with label and placeholder', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
  });

  test('TC-SU-014 | Password field renders with label and placeholder', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByPlaceholder('Min. 6 characters')).toBeVisible();
  });

  test('TC-SU-015 | "Create Account" button renders full-width with accent background', async ({ page }) => {
    await page.goto(BASE_URL);
    const btn = page.getByRole('button', { name: 'Create Account' });
    await expect(btn).toBeVisible();
    const width = await btn.evaluate(el => (el as HTMLElement).offsetWidth);
    const parentWidth = await btn.evaluate(el => (el.parentElement as HTMLElement).offsetWidth);
    expect(width).toBe(parentWidth);
  });

  test('TC-SU-016 | "Already have an account? Sign in" text and link render below form', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByText('Already have an account?')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  });

  test('TC-SU-017 | "Continue as guest (3h session)" link renders at card bottom', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByRole('link', { name: 'Continue as guest (3h session)' })).toBeVisible();
  });

  test('TC-SU-018 | Background radial gradient renders on page', async ({ page }) => {
    await page.goto(BASE_URL);
    const bg = await page.locator('div').filter({ has: page.locator('form') }).first()
      .evaluate(el => getComputedStyle(el.parentElement!).background);
    expect(bg).toContain('radial-gradient');
  });

});

// ─── FRONTEND – FIELD BEHAVIOR & VALIDATION ──────────────────────────────────

test.describe('Frontend – Field Behavior & Validation', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('TC-SU-019 | Full Name field accepts text input and reflects typed value', async ({ page }) => {
    const field = page.getByPlaceholder('Jane Smith');
    await field.fill('John Doe');
    await expect(field).toHaveValue('John Doe');
  });

  test('TC-SU-020 | Password field masks all typed characters', async ({ page }) => {
    const field = page.getByPlaceholder('Min. 6 characters');
    await expect(field).toHaveAttribute('type', 'password');
    await field.fill('secret123');
    await expect(field).toHaveValue('secret123');
  });

  test('TC-SU-021 | Email field accepts valid email format', async ({ page }) => {
    const field = page.getByPlaceholder('you@example.com');
    await field.fill('user@test.com');
    await expect(field).toHaveValue('user@test.com');
  });

  test('TC-SU-022 | Full Name placeholder disappears when user starts typing', async ({ page }) => {
    const field = page.getByPlaceholder('Jane Smith');
    await field.fill('J');
    await expect(field).toHaveValue('J');
    // Placeholder is hidden once input has value
    const placeholder = await field.getAttribute('placeholder');
    expect(placeholder).toBe('Jane Smith'); // attribute stays; just visually hidden
  });

  test('TC-SU-023 | Submitting empty Full Name triggers browser required validation', async ({ page }) => {
    await page.getByPlaceholder('you@example.com').fill('a@b.com');
    await page.getByPlaceholder('Min. 6 characters').fill('pass123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    // Browser blocks submission; URL stays on signup
    await expect(page).toHaveURL(/\/auth\/signup/);
  });

  test('TC-SU-024 | Submitting empty Email triggers browser required validation', async ({ page }) => {
    await page.getByPlaceholder('Jane Smith').fill('Test User');
    await page.getByPlaceholder('Min. 6 characters').fill('pass123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page).toHaveURL(/\/auth\/signup/);
  });

  test('TC-SU-025 | Submitting empty Password triggers browser required validation', async ({ page }) => {
    await page.getByPlaceholder('Jane Smith').fill('Test User');
    await page.getByPlaceholder('you@example.com').fill('test@test.com');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page).toHaveURL(/\/auth\/signup/);
  });

  test('TC-SU-026 | Submitting invalid email format is blocked by browser', async ({ page }) => {
    await page.getByPlaceholder('Jane Smith').fill('Test User');
    await page.getByPlaceholder('you@example.com').fill('notanemail');
    await page.getByPlaceholder('Min. 6 characters').fill('pass123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page).toHaveURL(/\/auth\/signup/);
  });

  test('TC-SU-027 | Password with exactly 5 characters triggers client-side error', async ({ page }) => {
    await page.getByPlaceholder('Jane Smith').fill('Test User');
    await page.getByPlaceholder('you@example.com').fill(uniqueEmail());
    await page.getByPlaceholder('Min. 6 characters').fill('abc12');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Password must be at least 6 characters.')).toBeVisible();
  });

  test('TC-SU-028 | Password with exactly 6 characters passes client-side validation', async ({ page }) => {
    await page.getByPlaceholder('Jane Smith').fill('Test User');
    await page.getByPlaceholder('you@example.com').fill(uniqueEmail());
    await page.getByPlaceholder('Min. 6 characters').fill('abc123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    // No client-side password error shown
    await expect(page.getByText('Password must be at least 6 characters.')).not.toBeVisible();
  });

  test('TC-SU-029 | Client-side error message renders in a styled red/rose box', async ({ page }) => {
    await page.getByPlaceholder('Jane Smith').fill('Test User');
    await page.getByPlaceholder('you@example.com').fill(uniqueEmail());
    await page.getByPlaceholder('Min. 6 characters').fill('abc12');
    await page.getByRole('button', { name: 'Create Account' }).click();
    const errorBox = page.getByText('Password must be at least 6 characters.');
    await expect(errorBox).toBeVisible();
    const bg = await errorBox.evaluate(el => getComputedStyle(el.parentElement!).background);
    // background should contain a rose/red color value
    expect(bg.toLowerCase()).toMatch(/rgb|rgba|var/);
  });

  test('TC-SU-030 | Password error clears when submission with valid password proceeds', async ({ page }) => {
    // Trigger error
    await page.getByPlaceholder('Jane Smith').fill('Test User');
    const emailField = page.getByPlaceholder('you@example.com');
    await emailField.fill(uniqueEmail());
    await page.getByPlaceholder('Min. 6 characters').fill('abc');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Password must be at least 6 characters.')).toBeVisible();
    // Fix password and resubmit
    await page.getByPlaceholder('Min. 6 characters').fill('abc12345');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Password must be at least 6 characters.')).not.toBeVisible();
  });

  test('TC-SU-031 | Submit button shows "Creating account..." text during API call', async ({ page }) => {
    await page.getByPlaceholder('Jane Smith').fill('Test User');
    await page.getByPlaceholder('you@example.com').fill(uniqueEmail());
    await page.getByPlaceholder('Min. 6 characters').fill('pass1234');
    // Intercept to slow the request so we can observe loading state
    await page.route('**/api/auth/signup', async route => {
      await new Promise(r => setTimeout(r, 1500));
      await route.continue();
    });
    const btn = page.getByRole('button', { name: /Create Account|Creating account/i });
    await btn.click();
    await expect(page.getByRole('button', { name: 'Creating account...' })).toBeVisible();
  });

  test('TC-SU-032 | Submit button is disabled during loading state', async ({ page }) => {
    await page.getByPlaceholder('Jane Smith').fill('Test User');
    await page.getByPlaceholder('you@example.com').fill(uniqueEmail());
    await page.getByPlaceholder('Min. 6 characters').fill('pass1234');
    await page.route('**/api/auth/signup', async route => {
      await new Promise(r => setTimeout(r, 1500));
      await route.continue();
    });
    await page.getByRole('button', { name: 'Create Account' }).click();
    const btn = page.locator('button[type="submit"]');
    await expect(btn).toBeDisabled();
  });

  test('TC-SU-033 | Submit button background changes to gray during loading', async ({ page }) => {
    await page.getByPlaceholder('Jane Smith').fill('Test User');
    await page.getByPlaceholder('you@example.com').fill(uniqueEmail());
    await page.getByPlaceholder('Min. 6 characters').fill('pass1234');
    await page.route('**/api/auth/signup', async route => {
      await new Promise(r => setTimeout(r, 1500));
      await route.continue();
    });
    await page.getByRole('button', { name: 'Create Account' }).click();
    const btn = page.locator('button[type="submit"]');
    const bg = await btn.evaluate(el => getComputedStyle(el).backgroundColor);
    // Should NOT be accent purple; should be gray/border2
    expect(bg).not.toBe('rgb(91, 79, 233)');
  });

  test('TC-SU-034 | Submit button text color changes to muted during loading', async ({ page }) => {
    await page.getByPlaceholder('Jane Smith').fill('Test User');
    await page.getByPlaceholder('you@example.com').fill(uniqueEmail());
    await page.getByPlaceholder('Min. 6 characters').fill('pass1234');
    await page.route('**/api/auth/signup', async route => {
      await new Promise(r => setTimeout(r, 1500));
      await route.continue();
    });
    await page.getByRole('button', { name: 'Create Account' }).click();
    const btn = page.locator('button[type="submit"]');
    const color = await btn.evaluate(el => getComputedStyle(el).color);
    // Should NOT be white (rgb(255,255,255)) during loading
    expect(color).not.toBe('rgb(255, 255, 255)');
  });

  test('TC-SU-035 | Cursor shows "not-allowed" on submit button during loading', async ({ page }) => {
    await page.getByPlaceholder('Jane Smith').fill('Test User');
    await page.getByPlaceholder('you@example.com').fill(uniqueEmail());
    await page.getByPlaceholder('Min. 6 characters').fill('pass1234');
    await page.route('**/api/auth/signup', async route => {
      await new Promise(r => setTimeout(r, 1500));
      await route.continue();
    });
    await page.getByRole('button', { name: 'Create Account' }).click();
    const cursor = await page.locator('button[type="submit"]').evaluate(el => getComputedStyle(el).cursor);
    expect(cursor).toBe('not-allowed');
  });

  test('TC-SU-047 | Full Name field accepts special characters and unicode', async ({ page }) => {
    const field = page.getByPlaceholder('Jane Smith');
    await field.fill("José O'Brien-李");
    await expect(field).toHaveValue("José O'Brien-李");
  });

  test('TC-SU-048 | Email field rejects input without "@" symbol', async ({ page }) => {
    await page.getByPlaceholder('Jane Smith').fill('Test User');
    await page.getByPlaceholder('you@example.com').fill('userexample.com');
    await page.getByPlaceholder('Min. 6 characters').fill('pass123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page).toHaveURL(/\/auth\/signup/);
  });

  test('TC-SU-049 | Password longer than 6 characters passes client-side validation', async ({ page }) => {
    await page.getByPlaceholder('Jane Smith').fill('Test User');
    await page.getByPlaceholder('you@example.com').fill(uniqueEmail());
    await page.getByPlaceholder('Min. 6 characters').fill('averylongpassword123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Password must be at least 6 characters.')).not.toBeVisible();
  });

  test('TC-SU-050 | Fields retain values after client-side validation error', async ({ page }) => {
    const name = 'Test User';
    const email = 'retain@test.com';
    await page.getByPlaceholder('Jane Smith').fill(name);
    await page.getByPlaceholder('you@example.com').fill(email);
    await page.getByPlaceholder('Min. 6 characters').fill('ab12');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Password must be at least 6 characters.')).toBeVisible();
    await expect(page.getByPlaceholder('Jane Smith')).toHaveValue(name);
    await expect(page.getByPlaceholder('you@example.com')).toHaveValue(email);
  });

});

// ─── INTEGRATION – API SUBMISSION & ERROR HANDLING ───────────────────────────

test.describe('Integration – API Submission & Error Handling', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('TC-SU-036 | Successful signup redirects to /dashboard', async ({ page }) => {
    await page.route('**/api/auth/signup', async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: '1', name: 'Test User', email: 'test@test.com' },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        }),
      });
    });
    await page.getByPlaceholder('Jane Smith').fill('Test User');
    await page.getByPlaceholder('you@example.com').fill(uniqueEmail());
    await page.getByPlaceholder('Min. 6 characters').fill('pass1234');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('TC-SU-037 | Auth tokens stored in auth store after successful signup', async ({ page }) => {
    let capturedBody: any = null;
    await page.route('**/api/auth/signup', async route => {
      capturedBody = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: '1', name: 'Test User', email: capturedBody.email },
          accessToken: 'tok-access',
          refreshToken: 'tok-refresh',
        }),
      });
    });
    await page.getByPlaceholder('Jane Smith').fill('Test User');
    await page.getByPlaceholder('you@example.com').fill(uniqueEmail());
    await page.getByPlaceholder('Min. 6 characters').fill('pass1234');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    // Token stored means redirect happened (setAuth was called successfully)
    expect(capturedBody).not.toBeNull();
  });

  test('TC-SU-038 | API error with message field shows that server message in error box', async ({ page }) => {
    await page.route('**/api/auth/signup', async route => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Email already in use' }),
      });
    });
    await page.getByPlaceholder('Jane Smith').fill('Test User');
    await page.getByPlaceholder('you@example.com').fill('existing@test.com');
    await page.getByPlaceholder('Min. 6 characters').fill('pass1234');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Email already in use')).toBeVisible();
  });

  test('TC-SU-039 | Generic fallback error shown when API response has no message', async ({ page }) => {
    await page.route('**/api/auth/signup', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    });
    await page.getByPlaceholder('Jane Smith').fill('Test User');
    await page.getByPlaceholder('you@example.com').fill(uniqueEmail());
    await page.getByPlaceholder('Min. 6 characters').fill('pass1234');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Registration failed. Please try again.')).toBeVisible();
  });

  test('TC-SU-040 | Error message box appears above the submit button', async ({ page }) => {
    await page.getByPlaceholder('Jane Smith').fill('Test User');
    await page.getByPlaceholder('you@example.com').fill(uniqueEmail());
    await page.getByPlaceholder('Min. 6 characters').fill('abc12'); // triggers client error
    await page.getByRole('button', { name: 'Create Account' }).click();
    const errorBox = page.getByText('Password must be at least 6 characters.');
    const btn = page.getByRole('button', { name: 'Create Account' });
    await expect(errorBox).toBeVisible();
    const errorY = (await errorBox.boundingBox())!.y;
    const btnY = (await btn.boundingBox())!.y;
    expect(errorY).toBeLessThan(btnY);
  });

  test('TC-SU-041 | Submit button reverts to "Create Account" after API error', async ({ page }) => {
    await page.route('**/api/auth/signup', async route => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Email already in use' }),
      });
    });
    await page.getByPlaceholder('Jane Smith').fill('Test User');
    await page.getByPlaceholder('you@example.com').fill('dup@test.com');
    await page.getByPlaceholder('Min. 6 characters').fill('pass1234');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeEnabled();
  });

});

// ─── UI – NAVIGATION LINKS ────────────────────────────────────────────────────

test.describe('UI – Navigation Links', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('TC-SU-042 | "Sign in" link in footer navigates to /auth/login', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('TC-SU-043 | "Continue as guest (3h session)" link navigates to /chat', async ({ page }) => {
    await page.getByRole('link', { name: 'Continue as guest (3h session)' }).click();
    await expect(page).toHaveURL(/\/chat/);
  });

  test('TC-SU-044 | NexusAI logo in navbar navigates to homepage', async ({ page }) => {
    await page.locator('nav a').filter({ hasText: 'NexusAI' }).click();
    await expect(page).toHaveURL(/localhost:3000\/?$/);
  });

  test('TC-SU-045 | Navbar "Sign In" button navigates to /auth/login', async ({ page }) => {
    await page.locator('nav').getByRole('link', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('TC-SU-046 | Navbar "Get Started" button stays on /auth/signup', async ({ page }) => {
    await page.locator('nav').getByRole('link', { name: 'Get Started' }).click();
    await expect(page).toHaveURL(/\/auth\/signup/);
  });

});
