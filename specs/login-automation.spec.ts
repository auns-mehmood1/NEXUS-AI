import { test, expect, type APIRequestContext, type Locator, type Page } from '@playwright/test';
import * as XLSX from 'xlsx';
import * as path from 'path';

type WorkbookRow = {
  testId: string;
  testTitle: string;
  scenarioType: string;
  layer: string;
  preconditions: string;
  testSteps: string;
  testData: string;
  expectedResult: string;
  actualResult?: string;
  testStatus?: string;
  executionStatus?: string;
  notes?: string;
  executedOn?: string;
};

type CaseResult = {
  status: 'Pass' | 'Fail' | 'Blocked';
  actualResult: string;
  notes?: string;
};

const APP_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const LOGIN_URL = `${APP_URL}/auth/login`;
const API_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';
const WORKBOOK_PATH = process.env.TEST_CASE_XLSX || 'test-case-login.xlsx';

test.use({
  channel: 'chrome',
  headless: false,
  launchOptions: {
    slowMo: 150,
  },
});

test.describe('Login workbook automation', () => {
  test('executes supported login test cases and writes results back to Excel', async ({ page, request }) => {
    test.setTimeout(8 * 60 * 1000);
    const workbook = XLSX.readFile(WORKBOOK_PATH);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<WorkbookRow>(sheet, { defval: '' });
    const updatedRows: WorkbookRow[] = [];

    for (const row of rows) {
      const result = await test.step(`${row.testId} ${row.testTitle}`, async () => executeCase(row, page, request));
      updatedRows.push({
        ...row,
        actualResult: result.actualResult,
        testStatus: result.status,
        executionStatus: result.status,
        notes: result.notes || '',
        executedOn: new Date().toISOString(),
      });
    }

    const headers = [
      'testId',
      'testTitle',
      'scenarioType',
      'layer',
      'preconditions',
      'testSteps',
      'testData',
      'expectedResult',
      'actualResult',
      'testStatus',
      'executionStatus',
      'notes',
      'executedOn',
    ];
    workbook.Sheets[sheetName] = XLSX.utils.json_to_sheet(updatedRows, { header: headers });
    writeWorkbookWithFallback(workbook, WORKBOOK_PATH);
  });
});

async function executeCase(row: WorkbookRow, page: Page, request: APIRequestContext): Promise<CaseResult> {
  try {
    await resetLoginPage(page);
    const handlers: Record<string, () => Promise<CaseResult>> = {
      'TC-001': () => verifyPageLoads(page),
      'TC-002': () => verifyFieldTypes(page),
      'TC-003': () => verifyNavigationLinks(page),
      'TC-004': () => verifySuccessfulLogin(page, request),
      'TC-005': () => verifyTokensStored(page, request),
      'TC-006': () => verifyInvalidPassword(page, request),
      'TC-007': () => verifyUnknownEmail(page),
      'TC-008': () => verifyEmptySubmission(page),
      'TC-009': () => verifyInvalidEmail(page),
      'TC-010': () => verifyLoadingState(page),
      'TC-011': () => verifyFallbackErrorMessage(page),
      'TC-012': () => verifyGuestMigrationAttempt(page, request),
      'TC-013': () => verifyGuestMigrationFailureNonBlocking(page, request),
      'TC-014': () => verifyLoginApiMissingFields(request),
      'TC-015': () => verifyLoginApiResponseShape(request),
      'TC-016': () => verifyEnterKeySubmission(page, request),
      'TC-017': () => verifyRefreshClearsFields(page),
      'TC-018': () => verifyPasswordMask(page),
      'TC-019': () => verifyMobileViewport(page),
      'TC-020': () => verifyPageInteractive(page),
    };
    const handler = handlers[row.testId];
    if (!handler) return blocked(`No automation handler implemented yet for ${row.testId}.`);
    return await handler();
  } catch (error) {
    return fail(asMessage(error), `Unhandled execution error for ${row.testId}`);
  }
}

async function resetLoginPage(page: Page) {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await page.context().clearCookies();
  await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
}

function emailField(page: Page): Locator {
  return page.locator('xpath=//label[normalize-space(.)="Email"]/following-sibling::input[1]');
}

function passwordField(page: Page): Locator {
  return page.locator('xpath=//label[normalize-space(.)="Password"]/following-sibling::input[1]');
}

function submitButton(page: Page): Locator {
  return page.locator('main form').getByRole('button', { name: 'Sign In', exact: true });
}

async function fillLoginForm(page: Page, data: { email?: string; password?: string }) {
  if (data.email !== undefined) await emailField(page).fill(data.email);
  if (data.password !== undefined) await passwordField(page).fill(data.password);
}

function makeUser(overrides?: Partial<{ name: string; email: string; password: string }>) {
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  return {
    name: 'Login User',
    email: `login+${stamp}@example.com`,
    password: 'securePass123!',
    ...overrides,
  };
}

async function ensureUser(request: APIRequestContext, overrides?: Partial<{ name: string; email: string; password: string }>) {
  const user = makeUser(overrides);
  const response = await request.post(`${API_URL}/auth/signup`, { data: user });
  expect(response.ok()).toBeTruthy();
  return user;
}

function pass(actualResult: string, notes?: string): CaseResult {
  return { status: 'Pass', actualResult, notes };
}

function fail(actualResult: string, notes?: string): CaseResult {
  return { status: 'Fail', actualResult, notes };
}

function blocked(actualResult: string, notes?: string): CaseResult {
  return { status: 'Blocked', actualResult, notes };
}

function asMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

function writeWorkbookWithFallback(workbook: XLSX.WorkBook, workbookPath: string) {
  try {
    XLSX.writeFile(workbook, workbookPath);
  } catch {
    const outputPath = workbookPath.replace(/\.xlsx$/i, `.updated${path.extname(workbookPath) || '.xlsx'}`);
    XLSX.writeFile(workbook, outputPath);
  }
}

async function verifyPageLoads(page: Page): Promise<CaseResult> {
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  await expect(emailField(page)).toBeVisible();
  await expect(passwordField(page)).toBeVisible();
  await expect(submitButton(page)).toBeVisible();
  await expect(page.getByRole('link', { name: /Continue as guest/ })).toBeVisible();
  return pass('Login page loaded with heading, inputs, submit button, and guest link visible.');
}

async function verifyFieldTypes(page: Page): Promise<CaseResult> {
  expect(await emailField(page).getAttribute('type')).toBe('email');
  expect(await passwordField(page).getAttribute('type')).toBe('password');
  expect(await emailField(page).evaluate((el) => (el as HTMLInputElement).required)).toBeTruthy();
  expect(await passwordField(page).evaluate((el) => (el as HTMLInputElement).required)).toBeTruthy();
  return pass('Email and password fields expose correct types and required attributes.');
}

async function verifyNavigationLinks(page: Page): Promise<CaseResult> {
  await page.locator('main').getByRole('link', { name: 'Create one free', exact: true }).click();
  await expect(page).toHaveURL(/\/auth\/signup$/);
  await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: /Continue as guest/ }).click();
  await expect(page).toHaveURL(/\/chat$/);
  return pass('Signup and guest links route to /auth/signup and /chat.');
}

async function verifySuccessfulLogin(page: Page, request: APIRequestContext): Promise<CaseResult> {
  const user = await ensureUser(request);
  await fillLoginForm(page, { email: user.email, password: user.password });
  await submitButton(page).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  return pass(`Valid credentials for ${user.email} redirected successfully to dashboard.`);
}

async function verifyTokensStored(page: Page, request: APIRequestContext): Promise<CaseResult> {
  const user = await ensureUser(request);
  await fillLoginForm(page, { email: user.email, password: user.password });
  await submitButton(page).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  const storage = await page.evaluate(() => ({
    access: localStorage.getItem('nexus_access_token'),
    refresh: localStorage.getItem('nexus_refresh_token'),
  }));
  expect(storage.access).toBeTruthy();
  expect(storage.refresh).toBeTruthy();
  return pass('Access and refresh tokens were written to localStorage after login.');
}

async function verifyInvalidPassword(page: Page, request: APIRequestContext): Promise<CaseResult> {
  const user = await ensureUser(request);
  await fillLoginForm(page, { email: user.email, password: 'wrong-password' });
  await submitButton(page).click();
  await expect(page.getByText('Invalid credentials')).toBeVisible();
  return pass('Incorrect password is rejected with backend invalid-credentials message.');
}

async function verifyUnknownEmail(page: Page): Promise<CaseResult> {
  await fillLoginForm(page, { email: `unknown-${Date.now()}@example.com`, password: 'securePass123!' });
  await submitButton(page).click();
  await expect(page.getByText('Invalid credentials')).toBeVisible();
  return pass('Unregistered email is rejected and user stays on login form.');
}

async function verifyEmptySubmission(page: Page): Promise<CaseResult> {
  await submitButton(page).click();
  const validity = await emailField(page).evaluate((el) => (el as HTMLInputElement).validationMessage);
  expect(validity.length).toBeGreaterThan(0);
  return pass('Required field validation prevents empty login submission.');
}

async function verifyInvalidEmail(page: Page): Promise<CaseResult> {
  await fillLoginForm(page, { email: 'invalid-email', password: 'securePass123!' });
  const valid = await emailField(page).evaluate((el) => (el as HTMLInputElement).checkValidity());
  expect(valid).toBeFalsy();
  return pass('Malformed email fails native browser validation.');
}

async function verifyLoadingState(page: Page): Promise<CaseResult> {
  const user = makeUser({ email: 'loading@example.com', password: 'securePass123!' });
  await page.route(`${API_URL}/auth/login`, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { _id: 'loading-user', name: user.name, email: user.email },
        accessToken: 'fake-access',
        refreshToken: 'fake-refresh',
      }),
    });
  });
  await fillLoginForm(page, { email: user.email, password: user.password });
  await submitButton(page).click();
  await expect(page.locator('main form').getByRole('button', { name: 'Signing in...', exact: true })).toBeDisabled();
  return pass('Submit button enters disabled loading state while login request is pending.');
}

async function verifyFallbackErrorMessage(page: Page): Promise<CaseResult> {
  await page.route(`${API_URL}/auth/login`, async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'server exploded' }),
    });
  });
  await fillLoginForm(page, { email: 'fallback@example.com', password: 'securePass123!' });
  await submitButton(page).click();
  await expect(page.getByText('Invalid email or password. Please try again.')).toBeVisible();
  return pass('Fallback login error message appears when backend response does not provide a message field.');
}

async function verifyGuestMigrationAttempt(page: Page, request: APIRequestContext): Promise<CaseResult> {
  const user = await ensureUser(request);
  let migrateCalled = false;
  await page.evaluate(() => {
    localStorage.setItem(
      'nexus_guest_history',
      JSON.stringify({
        guestId: 'guest-login-test',
        sessionId: 'session-login-test',
        modelId: 'gpt5',
        messages: [],
        expiresAt: Date.now() + 3600000,
        createdAt: Date.now(),
      }),
    );
  });
  await page.route(`${API_URL}/chat/migrate`, async (route) => {
    migrateCalled = true;
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });
  await fillLoginForm(page, { email: user.email, password: user.password });
  await submitButton(page).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  expect(migrateCalled).toBeTruthy();
  const guestStorage = await page.evaluate(() => localStorage.getItem('nexus_guest_history'));
  expect(guestStorage).toBeNull();
  return pass('Successful login triggered guest migration and cleared stored guest session.');
}

async function verifyGuestMigrationFailureNonBlocking(page: Page, request: APIRequestContext): Promise<CaseResult> {
  const user = await ensureUser(request);
  await page.evaluate(() => {
    localStorage.setItem(
      'nexus_guest_history',
      JSON.stringify({
        guestId: 'guest-login-fail',
        sessionId: 'session-login-fail',
        modelId: 'gpt5',
        messages: [],
        expiresAt: Date.now() + 3600000,
        createdAt: Date.now(),
      }),
    );
  });
  await page.route(`${API_URL}/chat/migrate`, async (route) => {
    await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'failed' }) });
  });
  await fillLoginForm(page, { email: user.email, password: user.password });
  await submitButton(page).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  return pass('Login still redirected to dashboard even when guest migration request failed.');
}

async function verifyLoginApiMissingFields(request: APIRequestContext): Promise<CaseResult> {
  const response = await request.post(`${API_URL}/auth/login`, { data: { email: 'missing@example.com' } });
  expect(response.status()).toBeGreaterThanOrEqual(400);
  return pass(`Login API rejected incomplete payload with HTTP ${response.status()}.`);
}

async function verifyLoginApiResponseShape(request: APIRequestContext): Promise<CaseResult> {
  const user = await ensureUser(request);
  const response = await request.post(`${API_URL}/auth/login`, { data: { email: user.email, password: user.password } });
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.user).toBeTruthy();
  expect(body.user.email).toBe(user.email);
  expect(body.user.password).toBeUndefined();
  expect(body.accessToken).toBeTruthy();
  expect(body.refreshToken).toBeTruthy();
  return pass('Login API returned safe user fields plus access and refresh tokens.');
}

async function verifyEnterKeySubmission(page: Page, request: APIRequestContext): Promise<CaseResult> {
  const user = await ensureUser(request);
  await fillLoginForm(page, { email: user.email, password: user.password });
  await passwordField(page).press('Enter');
  await expect(page).toHaveURL(/\/dashboard$/);
  return pass('Pressing Enter in the password field submits login successfully.');
}

async function verifyRefreshClearsFields(page: Page): Promise<CaseResult> {
  await fillLoginForm(page, { email: 'temp@example.com', password: 'tempPass123' });
  await page.reload({ waitUntil: 'networkidle' });
  await expect(emailField(page)).toHaveValue('');
  await expect(passwordField(page)).toHaveValue('');
  return pass('Refreshing the page clears unsaved email and password values.');
}

async function verifyPasswordMask(page: Page): Promise<CaseResult> {
  expect(await passwordField(page).getAttribute('type')).toBe('password');
  await passwordField(page).fill('secretPass123');
  await expect(passwordField(page)).toHaveValue('secretPass123');
  return pass('Password input remains of type password while accepting typed characters.');
}

async function verifyMobileViewport(page: Page): Promise<CaseResult> {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  await expect(submitButton(page)).toBeVisible();
  return pass('Login page remained usable at a mobile viewport of 390x844.');
}

async function verifyPageInteractive(page: Page): Promise<CaseResult> {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
  await expect(emailField(page)).toBeEditable();
  await expect(passwordField(page)).toBeEditable();
  const critical = errors.filter((entry) => !entry.includes('webpack-hmr'));
  expect(critical).toEqual([]);
  return pass('Login page rendered interactively without critical console errors blocking the form.');
}
