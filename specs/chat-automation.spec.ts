import { test, expect, type Locator, type Page } from '@playwright/test';
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
const CHAT_URL = `${APP_URL}/chat`;
const DASHBOARD_URL = `${APP_URL}/dashboard`;
const API_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';
const WORKBOOK_PATH = process.env.TEST_CASE_XLSX || 'test-case-chat.xlsx';
const AUTH_CREDENTIALS: Credentials = {
  username: process.env.CHAT_USERNAME || 'ruqisegeje@yopmail.com',
  password: process.env.CHAT_PASSWORD || 'imranZ321@',
};

test.use({
  channel: 'chrome',
  headless: false,
  launchOptions: {
    slowMo: 150,
  },
});

test.describe('Chat workbook automation', () => {
  test('executes chat test cases and writes results back to Excel', async ({ page }) => {
    test.setTimeout(15 * 60 * 1000);

    const workbook = XLSX.readFile(WORKBOOK_PATH);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<WorkbookRow>(sheet, { defval: '' });
    const updatedRows: WorkbookRow[] = [];

    for (const row of rows) {
      const result = await test.step(`${row.testId} ${row.testTitle}`, async () => executeCase(page, row));
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

async function executeCase(page: Page, row: WorkbookRow): Promise<CaseResult> {
  try {
    await resetChatPage(page);
    const handlers: Record<string, () => Promise<CaseResult>> = {
      'TC-001': () => verifyLoggedInAccess(page),
      'TC-002': () => verifyAuthenticatedNavbar(page),
      'TC-003': () => verifyModelSearchVisible(page),
      'TC-004': () => verifyModelCatalog(page),
      'TC-005': () => verifyActiveModelHeader(page),
      'TC-006': () => verifyPromptTabs(page),
      'TC-007': () => verifyPromptSuggestionSend(page),
      'TC-008': () => verifyComposerControls(page),
      'TC-009': () => verifyGoDisabledWhenEmpty(page),
      'TC-010': () => verifyEnterSendsMessage(page),
      'TC-011': () => verifyShiftEnterAddsNewline(page),
      'TC-012': () => verifyModelSwitchUpdatesContext(page),
      'TC-013': () => verifyModelSearchFiltering(page),
      'TC-014': () => verifyRightSidebarMetadata(page),
      'TC-015': () => verifyUsageStartsZero(page),
      'TC-016': () => verifyQuickActionGroups(page),
      'TC-017': () => verifyNavigationQuickActionBehavior(page),
      'TC-018': () => verifyAuthMe401DoesNotBreakUi(page),
      'TC-019': () => verifyAuthMeShouldNot401(page),
      'TC-020': () => verifyMobileViewport(page, row),
      'TC-021': () => verifyGoButtonSend(page),
      'TC-022': () => verifyWhitespaceOnlyBlocked(page),
      'TC-023': () => verifyAttachmentEnablesSend(page),
      'TC-024': () => verifyRemoveAttachment(page),
      'TC-025': () => verifyVoiceUnsupportedFallback(page),
      'TC-026': () => verifyMicPermissionDenied(page),
      'TC-027': () => verifyCameraPermissionDenied(page),
      'TC-028': () => verifyVideoPermissionDenied(page),
      'TC-029': () => verifyPromptPanelToggle(page),
      'TC-030': () => verifyPromptTabChange(page),
      'TC-031': () => verifyReadAloudWithoutAssistant(page),
      'TC-032': () => verifyReadAloudWithAssistant(page),
      'TC-033': () => verifyComposerModelLabelUpdates(page),
      'TC-034': () => verifyQuickActionPromptSend(page),
      'TC-035': () => verifyChatFailureFallback(page),
      'TC-036': () => verifyLatestMessageVisible(page),
      'TC-037': () => verifyUsageCountersUpdate(page),
      'TC-038': () => verifyOpenDashboardQuickAction(page),
      'TC-039': () => verifyNavbarChatLink(page),
      'TC-040': () => verifyAuthPersistsDashboardToChat(page),
    };
    const handler = handlers[row.testId];
    if (!handler) return blocked(`No automation handler implemented for ${row.testId}.`);
    return await handler();
  } catch (error) {
    return fail(asMessage(error), `Unhandled execution error for ${row.testId}`);
  }
}

async function resetChatPage(page: Page) {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await page.context().clearCookies();
  await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
}

function emailField(page: Page): Locator {
  return page.locator('input[type="email"]');
}

function passwordField(page: Page): Locator {
  return page.locator('input[type="password"]');
}

function signInButton(page: Page): Locator {
  return page.locator('main form').getByRole('button', { name: 'Sign In', exact: true });
}

function leftSidebar(page: Page): Locator {
  return page.locator('main > div > aside').first();
}

function rightSidebar(page: Page): Locator {
  return page.locator('main > div > aside').nth(1);
}

function chatTextarea(page: Page): Locator {
  return page.locator('textarea[placeholder^="Message "]');
}

function goButton(page: Page): Locator {
  return page.getByRole('button', { name: 'Go', exact: true });
}

function promptToggle(page: Page): Locator {
  return page.getByRole('button', { name: 'Prompt suggestions' });
}

async function loginToChat(page: Page) {
  await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
  await emailField(page).fill(AUTH_CREDENTIALS.username);
  await passwordField(page).fill(AUTH_CREDENTIALS.password);
  await signInButton(page).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto(CHAT_URL, { waitUntil: 'networkidle' });
  await expect(chatTextarea(page)).toBeVisible();
}

async function mockSuccessfulChat(page: Page, reply = 'Mocked assistant response.', sessionId = '507f1f77bcf86cd799439011') {
  await page.route(/\/chat\/send$/, async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        sessionId,
        message: { content: reply },
      }),
    });
  });
}

async function trackAuthMe401(page: Page, action: () => Promise<void>) {
  let saw401 = false;
  const listener = (response: { url: () => string; status: () => number }) => {
    if (response.url().includes('/auth/me') && response.status() === 401) {
      saw401 = true;
    }
  };
  page.on('response', listener);
  try {
    await action();
  } finally {
    page.off('response', listener);
  }
  return saw401;
}

function parseViewport(row: WorkbookRow) {
  const match = row.testData.match(/Viewport:\s*(\d+)x(\d+)/i);
  if (!match) return { width: 390, height: 844 };
  return { width: Number(match[1]), height: Number(match[2]) };
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

async function verifyLoggedInAccess(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  return pass('Logged-in user reached Chat Hub successfully.');
}

async function verifyAuthenticatedNavbar(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await expect(page.getByRole('button', { name: 'Dashboard', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign Out', exact: true })).toBeVisible();
  return pass('Authenticated navbar showed Dashboard and Sign Out actions.');
}

async function verifyModelSearchVisible(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await expect(page.getByRole('textbox', { name: 'Search 400+ models...' })).toBeVisible();
  return pass('Model search field rendered in the left sidebar.');
}

async function verifyModelCatalog(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await expect(leftSidebar(page).getByRole('button').first()).toBeVisible();
  await expect(leftSidebar(page).getByRole('button', { name: /Claude Sonnet 4\.6/i })).toBeVisible();
  return pass('Model catalog rendered multiple selectable model buttons.');
}

async function verifyActiveModelHeader(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await expect(page.getByRole('heading', { name: /Chat with Claude Sonnet 4\.6/i })).toBeVisible();
  return pass('Active chat header rendered selected model information.');
}

async function verifyPromptTabs(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  for (const name of ['Use Cases', 'Create', 'Analyze', 'Prototype', 'Business', 'Monitor', 'Learn']) {
    await expect(page.getByRole('button', { name, exact: true })).toBeVisible();
  }
  return pass('Prompt suggestion tabs rendered correctly.');
}

async function verifyPromptSuggestionSend(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await mockSuccessfulChat(page, 'Use GPT-5 for broad capability and Claude for balanced reasoning.');
  const promptText = 'Help me find the best AI model for my project';
  await page.getByRole('button', { name: promptText, exact: true }).click();
  await expect(page.getByText(promptText, { exact: true })).toBeVisible();
  await expect(page.getByText('Use GPT-5 for broad capability and Claude for balanced reasoning.', { exact: true })).toBeVisible();
  return pass('Prompt suggestion click created user and assistant messages.');
}

async function verifyComposerControls(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await expect(chatTextarea(page)).toBeVisible();
  for (const name of ['Prompt suggestions', 'Voice input', 'Read aloud', 'Record voice message', 'Camera photo', 'Record video message', 'Attach file']) {
    await expect(page.getByRole('button', { name })).toBeVisible();
  }
  await expect(goButton(page)).toBeVisible();
  return pass('Composer rendered textarea, Go button, and all media/action controls.');
}

async function verifyGoDisabledWhenEmpty(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await expect(goButton(page)).toBeDisabled();
  return pass('Go button stayed disabled when no text or attachments were present.');
}

async function verifyEnterSendsMessage(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await mockSuccessfulChat(page, 'Enter key reply.');
  await chatTextarea(page).fill('Hello NexusAI');
  await chatTextarea(page).press('Enter');
  await expect(page.getByText('Hello NexusAI', { exact: true })).toBeVisible();
  await expect(page.getByText('Enter key reply.', { exact: true })).toBeVisible();
  return pass('Pressing Enter sent the typed message successfully.');
}

async function verifyShiftEnterAddsNewline(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await chatTextarea(page).fill('Line one');
  await chatTextarea(page).press('Shift+Enter');
  await chatTextarea(page).type('Line two');
  await expect(chatTextarea(page)).toHaveValue('Line one\nLine two');
  return pass('Shift+Enter inserted a new line without sending the message.');
}

async function verifyModelSwitchUpdatesContext(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await leftSidebar(page).getByRole('button', { name: /GPT-5 Turbo/i }).click();
  await expect(chatTextarea(page)).toHaveAttribute('placeholder', /Message GPT-5 Turbo/i);
  await expect(rightSidebar(page).getByText('GPT-5 Turbo', { exact: true })).toBeVisible();
  return pass('Switching models updated active model context in composer and sidebar.');
}

async function verifyModelSearchFiltering(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  const search = page.getByRole('textbox', { name: 'Search 400+ models...' });
  await search.fill('GPT');
  await expect(leftSidebar(page).getByRole('button', { name: /GPT/i }).first()).toBeVisible();
  await expect(leftSidebar(page).getByRole('button', { name: /Claude Sonnet 4\.6/i })).toHaveCount(0);
  await search.clear();
  await expect(leftSidebar(page).getByRole('button', { name: /Claude Sonnet 4\.6/i })).toBeVisible();
  return pass('Model search filtered results correctly and restored on clear.');
}

async function verifyRightSidebarMetadata(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  for (const label of ['Context', 'Rating', 'Pricing', 'Reviews']) {
    await expect(rightSidebar(page).getByText(label, { exact: true })).toBeVisible();
  }
  return pass('Right sidebar showed active model metadata and pricing details.');
}

async function verifyUsageStartsZero(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  const usageText = await rightSidebar(page).getByText('Usage Overview', { exact: true }).locator('..').textContent();
  if (!usageText?.includes('0') || !usageText.includes('Requests')) {
    return fail('Usage Overview did not start at zero as expected.');
  }
  return pass('Usage Overview started with zero requests, replies, and files.');
}

async function verifyQuickActionGroups(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  for (const group of ['Navigation & Tools', 'Create & Generate', 'Analyze & Write']) {
    await expect(rightSidebar(page).getByText(group, { exact: true })).toBeVisible();
  }
  return pass('Quick action buttons rendered under grouped categories.');
}

async function verifyNavigationQuickActionBehavior(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await mockSuccessfulChat(page, 'Marketplace guidance reply.');
  await rightSidebar(page).getByRole('button', { name: 'Go to Marketplace', exact: true }).click();
  const url = page.url();
  if (url.includes('/marketplace')) {
    return pass('Go to Marketplace quick action navigated to marketplace.');
  }
  return fail(`Go to Marketplace quick action did not navigate; current URL remained ${url}.`);
}

async function verifyAuthMe401DoesNotBreakUi(page: Page): Promise<CaseResult> {
  const saw401 = await trackAuthMe401(page, async () => {
    await loginToChat(page);
  });
  await expect(chatTextarea(page)).toBeVisible();
  if (!saw401) {
    return fail('Expected to observe /auth/me 401 based on current behavior, but none was captured.');
  }
  return pass('Observed /auth/me 401 while chat UI still remained usable.');
}

async function verifyAuthMeShouldNot401(page: Page): Promise<CaseResult> {
  const saw401 = await trackAuthMe401(page, async () => {
    await loginToChat(page);
  });
  if (saw401) {
    return fail('Observed /auth/me returning 401 Unauthorized for a valid logged-in user.');
  }
  return pass('No /auth/me 401 was observed for the valid authenticated session.');
}

async function verifyMobileViewport(page: Page, row: WorkbookRow): Promise<CaseResult> {
  const viewport = parseViewport(row);
  await page.setViewportSize(viewport);
  await loginToChat(page);
  await expect(chatTextarea(page)).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Search 400+ models...' })).toBeVisible();
  return pass(`Chat Hub remained usable at viewport ${viewport.width}x${viewport.height}.`);
}

async function verifyGoButtonSend(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await mockSuccessfulChat(page, 'Go button reply.');
  await chatTextarea(page).fill('Tell me about this model');
  await goButton(page).click();
  await expect(page.getByText('Tell me about this model', { exact: true })).toBeVisible();
  await expect(page.getByText('Go button reply.', { exact: true })).toBeVisible();
  return pass('Go button sent the typed message and rendered the assistant reply.');
}

async function verifyWhitespaceOnlyBlocked(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await chatTextarea(page).fill('   ');
  await expect(goButton(page)).toBeDisabled();
  return pass('Whitespace-only input did not enable or send a message.');
}

async function verifyAttachmentEnablesSend(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await page.locator('input[type="file"]').setInputFiles(path.resolve('package.json'));
  await expect(page.getByText(/package\.json/i)).toBeVisible();
  await expect(goButton(page)).toBeEnabled();
  return pass('Adding an attachment created a chip and enabled the send button.');
}

async function verifyRemoveAttachment(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await page.locator('input[type="file"]').setInputFiles(path.resolve('package.json'));
  const chip = page.getByText(/package\.json/i);
  await expect(chip).toBeVisible();
  await chip.locator('..').getByRole('button').click();
  await expect(page.getByText(/package\.json/i)).toHaveCount(0);
  return pass('Removing the attachment updated composer state correctly.');
}

async function verifyVoiceUnsupportedFallback(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await page.evaluate(() => {
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;
  });
  const dialogPromise = page.waitForEvent('dialog');
  await page.getByRole('button', { name: 'Voice input' }).click();
  const dialog = await dialogPromise;
  const message = dialog.message();
  await dialog.accept();
  if (!/not supported/i.test(message)) {
    return fail(`Expected unsupported-browser alert, got: ${message}`);
  }
  return pass('Voice input showed a graceful unsupported-browser alert.');
}

async function verifyMicPermissionDenied(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await page.evaluate(() => {
    (navigator.mediaDevices as any).getUserMedia = async () => {
      throw new Error('denied');
    };
  });
  const dialogPromise = page.waitForEvent('dialog');
  await page.getByRole('button', { name: 'Record voice message' }).click();
  const dialog = await dialogPromise;
  const message = dialog.message();
  await dialog.accept();
  if (!/microphone access denied/i.test(message)) {
    return fail(`Expected microphone denied alert, got: ${message}`);
  }
  return pass('Microphone permission denial was handled gracefully.');
}

async function verifyCameraPermissionDenied(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await page.evaluate(() => {
    (navigator.mediaDevices as any).getUserMedia = async () => {
      throw new Error('denied');
    };
  });
  const dialogPromise = page.waitForEvent('dialog');
  await page.getByRole('button', { name: 'Camera photo' }).click();
  const dialog = await dialogPromise;
  const message = dialog.message();
  await dialog.accept();
  if (!/camera access denied/i.test(message)) {
    return fail(`Expected camera denied alert, got: ${message}`);
  }
  return pass('Camera permission denial was handled gracefully.');
}

async function verifyVideoPermissionDenied(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await page.evaluate(() => {
    (navigator.mediaDevices as any).getUserMedia = async () => {
      throw new Error('denied');
    };
  });
  const dialogPromise = page.waitForEvent('dialog');
  await page.getByRole('button', { name: 'Record video message' }).click();
  const dialog = await dialogPromise;
  const message = dialog.message();
  await dialog.accept();
  if (!/camera\/microphone access denied/i.test(message)) {
    return fail(`Expected camera/microphone denied alert, got: ${message}`);
  }
  return pass('Video recorder permission denial was handled gracefully.');
}

async function verifyPromptPanelToggle(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await expect(page.getByRole('button', { name: 'Use Cases', exact: true })).toBeVisible();
  await promptToggle(page).click();
  await expect(page.getByRole('button', { name: 'Use Cases', exact: true })).toHaveCount(0);
  await promptToggle(page).click();
  await expect(page.getByRole('button', { name: 'Use Cases', exact: true })).toBeVisible();
  return pass('Prompt suggestions panel toggled open and closed successfully.');
}

async function verifyPromptTabChange(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Write a blog post', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Help me find the best AI model for my project', exact: true })).toHaveCount(0);
  return pass('Switching prompt tabs updated the visible suggestion buttons.');
}

async function verifyReadAloudWithoutAssistant(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await page.evaluate(() => {
    (window as any).__speakCount = 0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak = (() => {
      (window as any).__speakCount += 1;
    }) as typeof window.speechSynthesis.speak;
  });
  await page.getByRole('button', { name: 'Read aloud' }).click();
  const count = await page.evaluate(() => (window as any).__speakCount);
  if (count !== 0) {
    return fail(`Read aloud invoked speech synthesis ${count} times without an assistant message.`);
  }
  return pass('Read aloud did nothing gracefully when no assistant message existed.');
}

async function verifyReadAloudWithAssistant(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await mockSuccessfulChat(page, 'Speech-ready assistant reply.');
  await chatTextarea(page).fill('Please reply');
  await goButton(page).click();
  await expect(page.getByText('Speech-ready assistant reply.', { exact: true })).toBeVisible();
  await page.evaluate(() => {
    (window as any).__speakCount = 0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak = (() => {
      (window as any).__speakCount += 1;
    }) as typeof window.speechSynthesis.speak;
  });
  await page.getByRole('button', { name: 'Read aloud' }).click();
  const count = await page.evaluate(() => (window as any).__speakCount);
  if (count < 1) {
    return fail('Read aloud did not invoke speech synthesis after an assistant response existed.');
  }
  return pass('Read aloud triggered speech synthesis after assistant response was available.');
}

async function verifyComposerModelLabelUpdates(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await leftSidebar(page).getByRole('button', { name: /GPT-5 Turbo/i }).click();
  await expect(page.getByText('GPT-5 Turbo', { exact: true }).last()).toBeVisible();
  return pass('Composer model label updated after switching active model.');
}

async function verifyQuickActionPromptSend(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await mockSuccessfulChat(page, 'Summarized response.');
  await rightSidebar(page).getByRole('button', { name: 'Summarize this', exact: true }).click();
  await expect(page.getByText('Summarize this', { exact: true })).toBeVisible();
  await expect(page.getByText('Summarized response.', { exact: true })).toBeVisible();
  return pass('Quick action prompt button sent a predefined prompt into the conversation.');
}

async function verifyChatFailureFallback(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await page.route(/\/chat\/send$/, async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'forced failure' }),
    });
  });
  await chatTextarea(page).fill('Trigger a failure');
  await goButton(page).click();
  await expect(page.getByText('I could not reach the chat service. Please try again.', { exact: true })).toBeVisible();
  return pass('Chat failure path showed the fallback assistant error message.');
}

async function verifyLatestMessageVisible(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await mockSuccessfulChat(page, 'Latest visible reply.');
  await chatTextarea(page).fill('Scroll test');
  await goButton(page).click();
  await expect(page.getByText('Latest visible reply.', { exact: true })).toBeInViewport();
  return pass('Latest assistant message remained visible after conversation update.');
}

async function verifyUsageCountersUpdate(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await mockSuccessfulChat(page, 'Counter reply.');
  await chatTextarea(page).fill('Count this');
  await goButton(page).click();
  const text = await rightSidebar(page).textContent();
  if (!text || !/Requests/.test(text) || !/Replies/.test(text) || !/Files/.test(text) || !/1/.test(text)) {
    return fail('Usage counters did not reflect conversation activity.');
  }
  return pass('Usage counters updated after a successful conversation.');
}

async function verifyOpenDashboardQuickAction(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await mockSuccessfulChat(page, 'Dashboard navigation guidance.');
  await rightSidebar(page).getByRole('button', { name: 'Open Dashboard', exact: true }).click();
  if (page.url().includes('/dashboard')) {
    return pass('Open Dashboard quick action navigated to the dashboard.');
  }
  return fail(`Open Dashboard quick action did not navigate; current URL remained ${page.url()}.`);
}

async function verifyNavbarChatLink(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await page.getByRole('link', { name: 'Chat Hub', exact: true }).click();
  await expect(page).toHaveURL(/\/chat$/);
  return pass('Navbar Chat Hub link kept the user on the chat route.');
}

async function verifyAuthPersistsDashboardToChat(page: Page): Promise<CaseResult> {
  await loginToChat(page);
  await page.goto(DASHBOARD_URL, { waitUntil: 'networkidle' });
  await page.goto(CHAT_URL, { waitUntil: 'networkidle' });
  await expect(chatTextarea(page)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign Out', exact: true })).toBeVisible();
  return pass('Authenticated state persisted while navigating from dashboard back to chat.');
}
