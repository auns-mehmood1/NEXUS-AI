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

type Credentials = {
  username: string;
  password: string;
};

const APP_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const LOGIN_URL = `${APP_URL}/auth/login`;
const DASHBOARD_URL = `${APP_URL}/dashboard`;
const API_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';
const WORKBOOK_PATH = process.env.TEST_CASE_XLSX || 'test-case-dashboard.xlsx';
const AUTH_CREDENTIALS: Credentials = {
  username: process.env.DASHBOARD_USERNAME || 'ruqisegeje@yopmail.com',
  password: process.env.DASHBOARD_PASSWORD || 'imranZ321@',
};

test.use({
  channel: 'chrome',
  headless: false,
  launchOptions: {
    slowMo: 150,
  },
});

test.describe('Dashboard workbook automation', () => {
  test('executes dashboard test cases and writes results back to Excel', async ({ page, request }) => {
    test.setTimeout(10 * 60 * 1000);
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
    await resetBrowserState(page);
    const handlers: Record<string, () => Promise<CaseResult>> = {
      'TC-001': () => verifyValidLoginToDashboard(page),
      'TC-002': () => verifyAuthenticatedNavbar(page),
      'TC-003': () => verifySidebarLinks(page),
      'TC-004': () => verifyGreeting(page),
      'TC-005': () => verifySidebarEmail(page),
      'TC-006': () => verifyUsageSummaryCards(page),
      'TC-007': () => verifyRequestsChart(page),
      'TC-008': () => verifyTopModels(page),
      'TC-009': () => verifyChatHubCard(page),
      'TC-010': () => verifyQuickActionCards(page),
      'TC-011': () => verifyInvalidLoginBlocksDashboard(page),
      'TC-012': () => verifyDashboardRedirectsWithoutAuth(page),
      'TC-013': () => verifySignOut(page),
      'TC-014': () => verifyHistoryNavigation(page),
      'TC-015': () => verifySettingsNavigation(page),
      'TC-016': () => verifyBillingNavigation(page),
      'TC-017': () => verifyUsageFailureState(page),
      'TC-018': () => verifyEmptyUsageState(page),
      'TC-019': () => verifyMobileViewport(page, row),
      'TC-020': () => verifyDashboardConsoleHealth(page),
    };
    const handler = handlers[row.testId];
    if (!handler) return blocked(`No automation handler implemented yet for ${row.testId}.`);
    return await handler();
  } catch (error) {
    return fail(asMessage(error), `Unhandled execution error for ${row.testId}`);
  }
}

async function resetBrowserState(page: Page) {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await page.context().clearCookies();
  await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
}

function emailField(page: Page): Locator {
  return page.getByRole('textbox', { name: 'you@example.com' });
}

function passwordField(page: Page): Locator {
  return page.getByRole('textbox', { name: '••••••••' });
}

function signInButton(page: Page): Locator {
  return page.locator('main form').getByRole('button', { name: 'Sign In', exact: true });
}

function dashboardHeading(page: Page): Locator {
  return page.getByRole('heading', { level: 1 }).filter({ hasText: /Good (morning|afternoon),/ });
}

async function loginWithUi(page: Page, credentials: Credentials = AUTH_CREDENTIALS) {
  await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
  await emailField(page).fill(credentials.username);
  await passwordField(page).fill(credentials.password);
  await signInButton(page).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

async function loginThroughApi(request: APIRequestContext, credentials: Credentials = AUTH_CREDENTIALS) {
  const response = await request.post(`${API_URL}/auth/login`, {
    data: { email: credentials.username, password: credentials.password },
  });
  expect(response.ok()).toBeTruthy();
  return response.json();
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

function parseViewport(row: WorkbookRow) {
  const match = row.testData.match(/Viewport:\s*(\d+)x(\d+)/i);
  if (!match) return { width: 390, height: 844 };
  return { width: Number(match[1]), height: Number(match[2]) };
}

async function verifyValidLoginToDashboard(page: Page): Promise<CaseResult> {
  await loginWithUi(page);
  await expect(dashboardHeading(page)).toBeVisible();
  return pass('Valid credentials logged in successfully and dashboard loaded.');
}

async function verifyAuthenticatedNavbar(page: Page): Promise<CaseResult> {
  await loginWithUi(page);
  await expect(page.getByRole('button', { name: 'Dashboard', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign Out', exact: true })).toBeVisible();
  return pass('Authenticated navbar actions Dashboard and Sign Out are visible.');
}

async function verifySidebarLinks(page: Page): Promise<CaseResult> {
  await loginWithUi(page);
  for (const name of ['Overview', 'Chat History', 'Settings', 'Billing']) {
    await expect(page.getByRole('link', { name: new RegExp(name, 'i') })).toBeVisible();
  }
  return pass('Sidebar rendered Overview, Chat History, Settings, and Billing links.');
}

async function verifyGreeting(page: Page): Promise<CaseResult> {
  await loginWithUi(page);
  await expect(dashboardHeading(page)).toContainText('Quia');
  return pass(`Dashboard greeting rendered personalized heading: "${await dashboardHeading(page).innerText()}".`);
}

async function verifySidebarEmail(page: Page): Promise<CaseResult> {
  await loginWithUi(page);
  await expect(page.getByText(AUTH_CREDENTIALS.username, { exact: true })).toBeVisible();
  return pass(`Sidebar profile section showed the logged-in email ${AUTH_CREDENTIALS.username}.`);
}

async function verifyUsageSummaryCards(page: Page): Promise<CaseResult> {
  await loginWithUi(page);
  for (const label of ['Total Requests', 'Avg Latency', 'Total Cost', 'Models Used']) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }
  return pass('Usage summary cards rendered Total Requests, Avg Latency, Total Cost, and Models Used.');
}

async function verifyRequestsChart(page: Page): Promise<CaseResult> {
  await loginWithUi(page);
  await expect(page.getByText('Requests - Last 24h', { exact: true })).toBeVisible();
  await expect(page.getByText('24h ago', { exact: true })).toBeVisible();
  await expect(page.getByText('Now', { exact: true })).toBeVisible();
  return pass('Requests - Last 24h section rendered with chart labels and timeline markers.');
}

async function verifyTopModels(page: Page): Promise<CaseResult> {
  await loginWithUi(page);
  await expect(page.getByText('Top Models Used', { exact: true })).toBeVisible();
  await expect(page.getByText(/req$/).first()).toBeVisible();
  return pass('Top Models Used section rendered populated model usage rows.');
}

async function verifyChatHubCard(page: Page): Promise<CaseResult> {
  await loginWithUi(page);
  await expect(page.getByRole('link', { name: /Open Chat Hub/i }).first()).toBeVisible();
  return pass('Quick action card Open Chat Hub is visible on dashboard.');
}

async function verifyQuickActionCards(page: Page): Promise<CaseResult> {
  await loginWithUi(page);
  for (const name of ['Browse Models', 'Build Agent', 'View History']) {
    await expect(page.getByRole('link', { name: new RegExp(name, 'i') })).toBeVisible();
  }
  return pass('Quick action cards Browse Models, Build Agent, and View History are visible.');
}

async function verifyInvalidLoginBlocksDashboard(page: Page): Promise<CaseResult> {
  await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
  await emailField(page).fill(AUTH_CREDENTIALS.username);
  await passwordField(page).fill(`${AUTH_CREDENTIALS.password}-wrong`);
  await signInButton(page).click();
  await expect(page).not.toHaveURL(/\/dashboard$/);
  await expect(page.getByText(/Invalid credentials|Invalid email or password/i)).toBeVisible();
  return pass('Invalid credentials did not grant dashboard access and showed an auth error.');
}

async function verifyDashboardRedirectsWithoutAuth(page: Page): Promise<CaseResult> {
  await page.goto(DASHBOARD_URL, { waitUntil: 'networkidle' });
  await expect(page).toHaveURL(/\/auth\/login$/);
  return pass('Direct unauthenticated dashboard access redirected to login.');
}

async function verifySignOut(page: Page): Promise<CaseResult> {
  await loginWithUi(page);
  await page.getByRole('button', { name: 'Sign Out', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto(DASHBOARD_URL, { waitUntil: 'networkidle' });
  await expect(page).toHaveURL(/\/auth\/login$/);
  return pass('Sign Out cleared session and protected dashboard access redirected back to login.');
}

async function verifyHistoryNavigation(page: Page): Promise<CaseResult> {
  await loginWithUi(page);
  await page.getByRole('link', { name: /Chat History/i }).click();
  await expect(page).toHaveURL(/\/dashboard\/history$/);
  await expect(page.getByRole('heading', { name: 'Chat History', exact: true })).toBeVisible();
  return pass('Chat History sidebar link navigated to /dashboard/history successfully.');
}

async function verifySettingsNavigation(page: Page): Promise<CaseResult> {
  await loginWithUi(page);
  await page.getByRole('link', { name: /Settings/i }).click();
  await expect(page).toHaveURL(/\/dashboard\/settings$/);
  await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
  return pass('Settings sidebar link navigated to /dashboard/settings successfully.');
}

async function verifyBillingNavigation(page: Page): Promise<CaseResult> {
  await loginWithUi(page);
  await page.getByRole('link', { name: /Billing/i }).click();
  await expect(page).toHaveURL(/\/dashboard\/billing$/);
  await expect(page.getByRole('heading', { name: 'Billing & Plans', exact: true })).toBeVisible();
  return pass('Billing sidebar link navigated to /dashboard/billing successfully.');
}

async function verifyUsageFailureState(page: Page): Promise<CaseResult> {
  await loginWithUi(page);
  await page.route(/\/dashboard\/usage$/, async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'forced failure' }),
    });
  });
  await page.goto(DASHBOARD_URL, { waitUntil: 'networkidle' });
  await expect(page.getByText('Unable to load usage right now.', { exact: true })).toBeVisible();
  return pass('Dashboard showed a graceful error state when usage API failed.');
}

async function verifyEmptyUsageState(page: Page): Promise<CaseResult> {
  await loginWithUi(page);
  await page.route(/\/dashboard\/usage$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: 'null',
    });
  });
  await page.goto(DASHBOARD_URL, { waitUntil: 'networkidle' });
  await expect(page.getByText('No usage data available yet.', { exact: true })).toBeVisible();
  return pass('Dashboard handled empty usage payload with a friendly no-data state.');
}

async function verifyMobileViewport(page: Page, row: WorkbookRow): Promise<CaseResult> {
  const viewport = parseViewport(row);
  await page.setViewportSize(viewport);
  await loginWithUi(page);
  await expect(dashboardHeading(page)).toBeVisible();
  await expect(page.getByText('Total Requests', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /Open Chat Hub/i }).first()).toBeVisible();
  return pass(`Dashboard remained usable at mobile viewport ${viewport.width}x${viewport.height}.`);
}

async function verifyDashboardConsoleHealth(page: Page): Promise<CaseResult> {
  const errors: string[] = [];
  const listener = (msg: { type: () => string; text: () => string }) => {
    if (msg.type() === 'error') errors.push(msg.text());
  };
  page.on('console', listener);
  try {
    await loginWithUi(page);
  } finally {
    page.off('console', listener);
  }
  const critical = errors.filter((entry) => !entry.includes('webpack-hmr'));
  if (critical.length > 0) {
    return fail(`Observed dashboard console error: ${critical[0]}`, 'Dashboard emitted a critical runtime console error.');
  }
  return pass('Dashboard loaded without critical runtime console errors.');
}
