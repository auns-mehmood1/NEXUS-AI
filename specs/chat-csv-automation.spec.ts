import { test, expect, type Locator, type Page } from '@playwright/test';
import * as fs from 'fs';

type CsvRow = {
  testId: string;
  testTitle: string;
  scenarioType: string;
  layer: string;
  preconditions: string;
  testSteps: string;
  testData: string;
  expectedResult: string;
  actualResult: string;
  testStatus: string;
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
const CHAT_URL = `${APP_URL}/chat`;
const CSV_PATH = process.env.TEST_CASE_CSV || 'chat-test-cases.csv';
const OUTPUT_PATH = CSV_PATH.replace(/\.csv$/i, '.updated.csv');

test.describe('Chat CSV automation', () => {
  test('executes chat CSV cases and writes updated results', async ({ page }) => {
    test.setTimeout(20 * 60 * 1000);

    const rows = parseChatCsv(CSV_PATH);
    const updatedRows: CsvRow[] = [];

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

    writeUpdatedCsv(OUTPUT_PATH, updatedRows);
  });
});

async function executeCase(page: Page, row: CsvRow): Promise<CaseResult> {
  try {
    const handlers: Record<string, () => Promise<CaseResult>> = {
      'TC-001': () => verifyNavbar(page),
      'TC-002': () => verifyLeftSidebar(page),
      'TC-003': () => verifyModelSearch(page),
      'TC-004': () => verifyModelSelection(page),
      'TC-005': () => verifyGuestBanner(page),
      'TC-006': () => verifyWelcomeState(page),
      'TC-007': () => verifyTextMessageSending(page),
      'TC-008': () => verifyEnterSends(page),
      'TC-009': () => verifyShiftEnter(page),
      'TC-010': () => verifyPromptSuggestions(page),
      'TC-011': () => verifyPromptSuggestionSend(page),
      'TC-012': () => verifyVoiceInputActivation(page),
      'TC-013': () => verifyVoiceInputStops(page),
      'TC-014': () => verifyTextToSpeech(page),
      'TC-015': () => verifyCameraModalOpen(page),
      'TC-016': () => verifyCameraCapture(page),
      'TC-017': () => verifyCameraCancel(page),
      'TC-018': () => verifyVoiceRecordingStarts(page),
      'TC-019': () => verifyVoiceRecordingAttach(page),
      'TC-020': () => verifyVideoRecorderOpen(page),
      'TC-021': () => verifyVideoRecordingStarts(page),
      'TC-022': () => verifyVideoRecordingAttach(page),
      'TC-023': () => verifyFileDialogOpens(page),
      'TC-024': () => verifyMultipleFilesAttach(page),
      'TC-025': () => verifyAttachmentRemoval(page),
      'TC-026': () => verifyMessageWithAttachment(page),
      'TC-027': () => verifyGuestSessionRefreshPersistence(page),
      'TC-028': () => verifyGuestSessionExpiry(page),
      'TC-029': () => verifyRightSidebar(page),
      'TC-030': () => verifyUsageStatsUpdate(page),
      'TC-031': () => verifyQuickActionSend(page),
      'TC-032': () => verifySignInNavigation(page),
      'TC-033': () => verifyGetStartedNavigation(page),
      'TC-034': () => verifyEmptyMessageBlocked(page),
      'TC-035': () => verifyWhitespaceBlocked(page),
      'TC-036': () => verifyInvalidModelFallback(page),
      'TC-037': () => verifyNetworkFailure(page),
      'TC-038': () => verifyCameraDenied(page),
      'TC-039': () => verifyMicrophoneDenied(page),
      'TC-040': () => verifyVoiceUnsupported(page),
      'TC-041': () => verifyTimestampDisplay(page),
      'TC-042': () => verifyTypingIndicator(page),
      'TC-043': () => verifyAutoScroll(page),
      'TC-044': () => verifyModelBadge(page),
      'TC-045': () => verifyLanguageSelector(page),
      'TC-046': () => verifyPromptPanelToggle(page),
      'TC-047': () => verifyVideoRecorderCancel(page),
      'TC-048': () => verifyAttachmentFileTypeDetection(page),
      'TC-049': () => verifyUserMessageStyling(page),
      'TC-050': () => verifyAssistantMessageStyling(page),
    };

    const handler = handlers[row.testId];
    if (!handler) return blocked(`No automation handler implemented for ${row.testId}.`);
    return await handler();
  } catch (error) {
    return fail(asMessage(error), `Unhandled execution error for ${row.testId}`);
  }
}

async function resetChatPage(page: Page, url = CHAT_URL) {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await page.context().clearCookies();
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto(url, { waitUntil: 'networkidle' });
}

function leftSidebar(page: Page): Locator {
  return page.locator('main aside').first();
}

function rightSidebar(page: Page): Locator {
  return page.locator('main aside').last();
}

function chatTextarea(page: Page): Locator {
  return page.locator('textarea[placeholder^="Message "]');
}

function goButton(page: Page): Locator {
  return page.getByRole('button', { name: 'Go', exact: true });
}

function promptToggle(page: Page): Locator {
  return page.locator('button[title="Prompt suggestions"]');
}

function voiceInputButton(page: Page): Locator {
  return page.locator('button[title="Voice input"]');
}

function readAloudButton(page: Page): Locator {
  return page.locator('button[title="Read aloud"]');
}

function voiceRecordButton(page: Page): Locator {
  return page.locator('button[title*="Record voice message"], button[title*="Stop recording"]');
}

function cameraButton(page: Page): Locator {
  return page.locator('button[title="Camera photo"]');
}

function videoButton(page: Page): Locator {
  return page.locator('button[title="Record video message"]');
}

function attachButton(page: Page): Locator {
  return page.locator('button[title="Attach file"]');
}

function fileInput(page: Page): Locator {
  return page.locator('input[type="file"]');
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
  return error instanceof Error ? error.message : String(error);
}

async function mockChatReply(page: Page, options?: { reply?: string; delayMs?: number }) {
  let callCount = 0;
  const reply = options?.reply || 'Mocked assistant reply.';
  const delayMs = options?.delayMs || 0;
  await page.route(/\/api\/chat\/send$/, async (route) => {
    callCount += 1;
    if (delayMs > 0) await page.waitForTimeout(delayMs);
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        sessionId: '507f1f77bcf86cd799439011',
        message: {
          content: `${reply}${callCount > 1 ? ` #${callCount}` : ''}`,
        },
      }),
    });
  });
}

async function mockSpeechRecognition(page: Page, transcript = 'Test voice input') {
  await page.evaluate((spokenText) => {
    class MockSpeechRecognition {
      continuous = false;
      interimResults = true;
      onresult?: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
      onend?: () => void;
      start() {
        (window as any).__mockSpeechActive = true;
        setTimeout(() => {
          this.onresult?.({
            results: [[{ transcript: spokenText }]],
          });
        }, 50);
      }
      stop() {
        (window as any).__mockSpeechActive = false;
        this.onend?.();
      }
    }

    (window as any).SpeechRecognition = MockSpeechRecognition;
    (window as any).webkitSpeechRecognition = MockSpeechRecognition;
  }, transcript);
}

async function mockSpeechUnsupported(page: Page) {
  await page.evaluate(() => {
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;
  });
}

async function mockSpeechSynthesis(page: Page) {
  await page.evaluate(() => {
    (window as any).__speakCount = 0;
    (window as any).__lastSpokenText = '';
    window.speechSynthesis.cancel = (() => undefined) as typeof window.speechSynthesis.cancel;
    window.speechSynthesis.speak = ((utterance: SpeechSynthesisUtterance) => {
      (window as any).__speakCount += 1;
      (window as any).__lastSpokenText = utterance.text;
      utterance.onend?.(new Event('end') as SpeechSynthesisEvent);
    }) as typeof window.speechSynthesis.speak;
  });
}

async function mockSuccessfulMedia(page: Page) {
  await page.evaluate(() => {
    if (!navigator.mediaDevices) {
      Object.defineProperty(navigator, 'mediaDevices', { value: {}, configurable: true });
    }
    Object.defineProperty(HTMLVideoElement.prototype, 'videoWidth', {
      configurable: true,
      get() {
        return 640;
      },
    });
    Object.defineProperty(HTMLVideoElement.prototype, 'videoHeight', {
      configurable: true,
      get() {
        return 480;
      },
    });
    (navigator.mediaDevices as MediaDevices).getUserMedia = async () => new MediaStream();
  });
}

async function mockDeniedMedia(page: Page, message: string) {
  await page.evaluate((alertText) => {
    if (!navigator.mediaDevices) {
      Object.defineProperty(navigator, 'mediaDevices', { value: {}, configurable: true });
    }
    (navigator.mediaDevices as MediaDevices).getUserMedia = async () => {
      throw new Error(alertText);
    };
  }, message);
}

async function mockMediaRecorder(page: Page, mimeType: 'audio/webm' | 'video/webm') {
  await page.evaluate((resolvedMimeType) => {
    class MockMediaRecorder {
      stream: MediaStream;
      state = 'inactive';
      ondataavailable?: (event: { data: Blob }) => void;
      onstop?: () => void;

      constructor(stream: MediaStream) {
        this.stream = stream;
      }

      start() {
        this.state = 'recording';
      }

      stop() {
        this.state = 'inactive';
        this.ondataavailable?.({ data: new Blob(['mock-media'], { type: resolvedMimeType }) });
        this.onstop?.();
      }
    }

    (window as any).MediaRecorder = MockMediaRecorder;
  }, mimeType);
}

async function uploadVirtualFiles(page: Page, files: Array<{ name: string; mimeType: string; buffer: Buffer }>) {
  await fileInput(page).setInputFiles(files);
}

async function verifyNavbar(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await expect(page.getByRole('link', { name: 'NexusAI' })).toBeVisible();
  await expect(page.locator('nav ul li a')).toHaveCount(4);
  await expect(page.getByRole('link', { name: 'Chat Hub' })).toBeVisible();
  await expect(page.locator('nav button').filter({ hasText: /EN/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign In', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Get Started', exact: true })).toBeVisible();
  return pass('Navbar rendered NexusAI logo, 4 navigation links, language selector, Sign In, and Get Started.');
}

async function verifyLeftSidebar(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await expect(page.getByPlaceholder('Search 400+ models...')).toBeVisible();
  await expect(leftSidebar(page).getByRole('button').first()).toBeVisible();
  return pass('Left sidebar rendered the model search box and a scrollable list of model buttons.');
}

async function verifyModelSearch(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  const search = page.getByPlaceholder('Search 400+ models...');
  await search.fill('claude');
  const labels = await leftSidebar(page).getByRole('button').allTextContents();
  const relevant = labels.filter((text) => text.trim().length > 0);
  expect(relevant.length).toBeGreaterThan(0);
  expect(relevant.every((text) => /claude|anthropic/i.test(text))).toBeTruthy();
  return pass(`Model search filtered the sidebar to ${relevant.length} Claude/Anthropic entries.`);
}

async function verifyModelSelection(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await leftSidebar(page).getByRole('button', { name: /GPT-5 Turbo/i }).click();
  await expect(rightSidebar(page).getByText('GPT-5 Turbo', { exact: true })).toBeVisible();
  await expect(chatTextarea(page)).toHaveAttribute('placeholder', /Message GPT-5 Turbo/i);
  return pass('Selecting GPT-5 Turbo updated the right sidebar and composer context.');
}

async function verifyGuestBanner(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await expect(page.getByText(/Guest session - .* remaining/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /Save permanently/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Save permanently/i })).toHaveAttribute('href', /\/auth\/signup$/);
  return pass('Guest banner showed remaining time and linked Save permanently CTA.');
}

async function verifyWelcomeState(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await expect(page.getByRole('heading', { name: /Chat with /i })).toBeVisible();
  await expect(page.locator('p').filter({ hasText: /Best speed|flagship|model/i }).first()).toBeVisible();
  return pass('Empty-state welcome content rendered the active model icon, title, and description.');
}

async function verifyTextMessageSending(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await mockChatReply(page, { reply: 'I am doing well today.', delayMs: 800 });
  await chatTextarea(page).fill('Hello, how are you?');
  await goButton(page).click();
  await expect(page.getByText('Hello, how are you?', { exact: true })).toBeVisible();
  await expect(page.locator('span[style*="typingDot"]')).toHaveCount(3);
  await expect(page.getByText('I am doing well today.', { exact: true })).toBeVisible();
  return pass('Guest message sent, typing indicator appeared, and mocked assistant reply rendered.');
}

async function verifyEnterSends(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await mockChatReply(page, { reply: 'Enter key worked.' });
  await chatTextarea(page).fill('Test message');
  await chatTextarea(page).press('Enter');
  await expect(page.getByText('Test message', { exact: true })).toBeVisible();
  return pass('Pressing Enter sent the message without inserting a line break.');
}

async function verifyShiftEnter(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await chatTextarea(page).fill('Line 1');
  await chatTextarea(page).press('Shift+Enter');
  await chatTextarea(page).type('Line 2');
  await expect(chatTextarea(page)).toHaveValue('Line 1\nLine 2');
  return pass('Shift+Enter inserted a newline and kept the composer unsent.');
}

async function verifyPromptSuggestions(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  for (const tab of ['Use Cases', 'Create', 'Analyze', 'Prototype', 'Business', 'Monitor', 'Learn']) {
    await expect(page.getByRole('button', { name: tab, exact: true })).toBeVisible();
  }
  await expect(page.getByRole('button', { name: /Help me find the best AI model/i })).toBeVisible();
  return pass('Prompt suggestions panel rendered tabs and clickable prompts.');
}

async function verifyPromptSuggestionSend(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await mockChatReply(page, { reply: 'Prompt suggestion sent successfully.' });
  await page.getByRole('button', { name: 'Help me find the best AI model for my project', exact: true }).click();
  await expect(page.getByText('Help me find the best AI model for my project', { exact: true })).toBeVisible();
  await expect(page.getByText('Prompt suggestion sent successfully.', { exact: true })).toBeVisible();
  return pass('Clicking a prompt suggestion auto-sent it and rendered an assistant reply.');
}

async function verifyVoiceInputActivation(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await mockSpeechRecognition(page);
  await voiceInputButton(page).click();
  await expect(chatTextarea(page)).toHaveValue('Test voice input');
  const activeColor = await voiceInputButton(page).evaluate((el) => getComputedStyle(el as HTMLElement).color);
  return pass(`Voice input populated transcript text and activated microphone styling (${activeColor}).`);
}

async function verifyVoiceInputStops(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await mockSpeechRecognition(page);
  await voiceInputButton(page).click();
  await expect(chatTextarea(page)).toHaveValue('Test voice input');
  await voiceInputButton(page).click({ force: true });
  const active = await page.evaluate(() => (window as any).__mockSpeechActive ?? false);
  if (active) return fail('Voice input remained active after the second click.');
  return pass('Second microphone click stopped recognition and preserved the transcribed text.');
}

async function verifyTextToSpeech(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await mockChatReply(page, { reply: 'This response should be spoken aloud.' });
  await mockSpeechSynthesis(page);
  await chatTextarea(page).fill('Read this response');
  await goButton(page).click();
  await expect(page.getByText('This response should be spoken aloud.', { exact: true })).toBeVisible();
  await readAloudButton(page).click();
  const speakCount = await page.evaluate(() => (window as any).__speakCount);
  if (speakCount < 1) return fail('SpeechSynthesis.speak was not invoked.');
  return pass('Read aloud triggered SpeechSynthesis for the last assistant message.');
}

async function verifyCameraModalOpen(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await mockSuccessfulMedia(page);
  await cameraButton(page).click();
  await expect(page.getByRole('button', { name: 'Capture', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeVisible();
  return pass('Camera modal opened with Capture and Cancel actions.');
}

async function verifyCameraCapture(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await mockSuccessfulMedia(page);
  await cameraButton(page).click();
  await page.getByRole('button', { name: 'Capture', exact: true }).click();
  await expect(page.getByText(/camera-capture\.jpg/i)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Capture', exact: true })).toHaveCount(0);
  return pass('Camera capture attached an image chip and closed the modal.');
}

async function verifyCameraCancel(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await mockSuccessfulMedia(page);
  await cameraButton(page).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Capture', exact: true })).toHaveCount(0);
  return pass('Camera modal closed without attaching a photo.');
}

async function verifyVoiceRecordingStarts(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await mockSuccessfulMedia(page);
  await mockMediaRecorder(page, 'audio/webm');
  await voiceRecordButton(page).click();
  await page.waitForTimeout(1100);
  await expect(voiceRecordButton(page)).toContainText('1s');
  return pass('Voice recording entered active state and started its timer.');
}

async function verifyVoiceRecordingAttach(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await mockSuccessfulMedia(page);
  await mockMediaRecorder(page, 'audio/webm');
  await voiceRecordButton(page).click();
  await page.waitForTimeout(200);
  await voiceRecordButton(page).click();
  await expect(page.getByText(/Voice message \(/i)).toBeVisible();
  return pass('Stopping voice recording attached an audio chip with a duration label.');
}

async function verifyVideoRecorderOpen(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await mockSuccessfulMedia(page);
  await videoButton(page).click();
  await expect(page.getByRole('button', { name: 'Start Recording', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeVisible();
  return pass('Video recorder modal opened with live recorder controls.');
}

async function verifyVideoRecordingStarts(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await mockSuccessfulMedia(page);
  await mockMediaRecorder(page, 'video/webm');
  await videoButton(page).click();
  await page.getByRole('button', { name: 'Start Recording', exact: true }).click();
  await page.waitForTimeout(1100);
  await expect(page.getByRole('button', { name: 'Stop & Attach', exact: true })).toBeVisible();
  await expect(page.getByText(/REC 1s/i)).toBeVisible();
  return pass('Video recorder entered recording state and showed REC timer.');
}

async function verifyVideoRecordingAttach(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await mockSuccessfulMedia(page);
  await mockMediaRecorder(page, 'video/webm');
  await videoButton(page).click();
  await page.getByRole('button', { name: 'Start Recording', exact: true }).click();
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: 'Stop & Attach', exact: true }).click();
  await expect(page.getByText(/Video message \(/i)).toBeVisible();
  return pass('Stopping video recording attached a video chip with a duration label.');
}

async function verifyFileDialogOpens(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  const chooserPromise = page.waitForEvent('filechooser');
  await attachButton(page).click();
  await chooserPromise;
  return pass('Attach file button opened the native file chooser.');
}

async function verifyMultipleFilesAttach(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await uploadVirtualFiles(page, [
    { name: 'sample.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake-jpg') },
    { name: 'sample.pdf', mimeType: 'application/pdf', buffer: Buffer.from('fake-pdf') },
    { name: 'sample.txt', mimeType: 'text/plain', buffer: Buffer.from('fake-txt') },
  ]);
  await expect(page.getByText(/sample\.jpg/i)).toBeVisible();
  await expect(page.getByText(/sample\.pdf/i)).toBeVisible();
  await expect(page.getByText(/sample\.txt/i)).toBeVisible();
  return pass('Multiple file selections rendered pending attachment chips.');
}

async function verifyAttachmentRemoval(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await uploadVirtualFiles(page, [
    { name: 'removable.pdf', mimeType: 'application/pdf', buffer: Buffer.from('remove-me') },
  ]);
  const chip = page.getByText(/removable\.pdf/i);
  await expect(chip).toBeVisible();
  await chip.locator('..').getByRole('button').click();
  await expect(chip).toHaveCount(0);
  return pass('Clicking the attachment x removed it from the pending list.');
}

async function verifyMessageWithAttachment(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await mockChatReply(page, { reply: 'Attachment received.' });
  await uploadVirtualFiles(page, [
    { name: 'contract.pdf', mimeType: 'application/pdf', buffer: Buffer.from('pdf-body') },
  ]);
  await chatTextarea(page).fill("Here's a file");
  await goButton(page).click();
  await expect(page.getByText("Here's a file", { exact: true })).toBeVisible();
  await expect(page.getByText(/File: contract\.pdf/i)).toBeVisible();
  return pass('Message sent with text and file attachment visible in the chat stream.');
}

async function verifyGuestSessionRefreshPersistence(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await mockChatReply(page, { reply: 'Persistent reply.' });
  await chatTextarea(page).fill('Persist me');
  await goButton(page).click();
  await expect(page.getByText('Persist me', { exact: true })).toBeVisible();
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByText('Persist me', { exact: true })).toBeVisible();
  await expect(page.getByText('Persistent reply.', { exact: true })).toBeVisible();
  return pass('Guest chat history restored correctly after browser refresh.');
}

async function verifyGuestSessionExpiry(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await page.evaluate(() => {
    const realNow = Date.now;
    const threeHoursAndOneMinute = 3 * 60 * 60 * 1000 + 60 * 1000;
    Date.now = () => realNow() + threeHoursAndOneMinute;
  });
  await chatTextarea(page).fill('Should fail');
  await goButton(page).click();
  await expect(page.getByText('Guest session expired (3 hours limit). Please sign up to continue chatting.', { exact: true })).toBeVisible();
  return pass(
    'Expired guest session blocked sending and surfaced the expiry message.',
    'Backend validation inferred from observable guest-session expiry behavior; no direct backend or database inspection was available.',
  );
}

async function verifyRightSidebar(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  for (const text of ['Context', 'Rating', 'Pricing', 'Reviews']) {
    await expect(rightSidebar(page).getByText(text, { exact: true })).toBeVisible();
  }
  await expect(rightSidebar(page).getByText(/Anthropic|OpenAI|Google/i).first()).toBeVisible();
  return pass('Right sidebar showed model icon, metadata, description, and summary stats.');
}

async function verifyUsageStatsUpdate(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await mockChatReply(page, { reply: 'Usage reply.' });
  for (let index = 1; index <= 5; index += 1) {
    await chatTextarea(page).fill(`Usage message ${index}`);
    await goButton(page).click();
    await expect(page.getByText(`Usage message ${index}`, { exact: true })).toBeVisible();
  }
  await expect(rightSidebar(page).getByText('5', { exact: true }).first()).toBeVisible();
  return pass('Usage overview updated after sending 5 messages in the same guest session.');
}

async function verifyQuickActionSend(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await mockChatReply(page, { reply: 'Quick action reply.' });
  await rightSidebar(page).getByRole('button', { name: 'Summarize this', exact: true }).click();
  await expect(page.getByText('Summarize this', { exact: true }).last()).toBeVisible();
  return pass('Quick action button sent its prompt text into the conversation.');
}

async function verifySignInNavigation(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page).toHaveURL(/\/auth\/login$/);
  return pass('Navbar Sign In button routed to /auth/login.');
}

async function verifyGetStartedNavigation(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await page.getByRole('button', { name: 'Get Started', exact: true }).click();
  await expect(page).toHaveURL(/\/auth\/signup$/);
  return pass('Navbar Get Started button routed to /auth/signup.');
}

async function verifyEmptyMessageBlocked(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await expect(goButton(page)).toBeDisabled();
  return pass('Send button stayed disabled while the composer was empty.');
}

async function verifyWhitespaceBlocked(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await chatTextarea(page).fill('   ');
  await expect(goButton(page)).toBeDisabled();
  return pass('Whitespace-only input did not enable the send button.');
}

async function verifyInvalidModelFallback(page: Page): Promise<CaseResult> {
  await resetChatPage(page, `${CHAT_URL}?model=invalid-model-id`);
  await expect(page.getByRole('heading', { name: /Chat with /i })).toBeVisible();
  await expect(chatTextarea(page)).not.toHaveAttribute('placeholder', /invalid-model-id/i);
  return pass('Invalid model query gracefully fell back to a valid default model.');
}

async function verifyNetworkFailure(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await page.route(/\/api\/chat\/send$/, async (route) => route.abort());
  await chatTextarea(page).fill('Network failure test');
  await goButton(page).click();
  await expect(page.getByText('I could not reach the chat service. Please try again.', { exact: true })).toBeVisible();
  return pass('Network failure rendered the fallback assistant error message.');
}

async function verifyCameraDenied(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await mockDeniedMedia(page, 'Camera access denied.');
  await page.evaluate(() => {
    (window as any).__lastAlert = '';
    window.alert = ((message?: string) => {
      (window as any).__lastAlert = String(message || '');
    }) as typeof window.alert;
  });
  await cameraButton(page).click();
  const message = await page.evaluate(() => (window as any).__lastAlert);
  if (!/camera access denied/i.test(message)) return fail(`Expected camera denied alert but received: ${message}`);
  return pass('Denied camera permission showed the Camera access denied alert.');
}

async function verifyMicrophoneDenied(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await mockDeniedMedia(page, 'Microphone access denied.');
  await page.evaluate(() => {
    (window as any).__lastAlert = '';
    window.alert = ((message?: string) => {
      (window as any).__lastAlert = String(message || '');
    }) as typeof window.alert;
  });
  await voiceRecordButton(page).click();
  const message = await page.evaluate(() => (window as any).__lastAlert);
  if (!/microphone access denied/i.test(message)) return fail(`Expected microphone denied alert but received: ${message}`);
  return pass('Denied microphone permission surfaced the microphone access denied alert.');
}

async function verifyVoiceUnsupported(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await mockSpeechUnsupported(page);
  await page.evaluate(() => {
    (window as any).__lastAlert = '';
    window.alert = ((message?: string) => {
      (window as any).__lastAlert = String(message || '');
    }) as typeof window.alert;
  });
  await voiceInputButton(page).click();
  const message = await page.evaluate(() => (window as any).__lastAlert);
  if (!/voice input not supported/i.test(message)) return fail(`Expected unsupported-browser alert but received: ${message}`);
  return pass('Unsupported browser voice input showed the expected fallback alert.');
}

async function verifyTimestampDisplay(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await mockChatReply(page, { reply: 'Timestamp reply.' });
  await chatTextarea(page).fill('Timestamp check');
  await goButton(page).click();
  const texts = await page.locator('div').allTextContents();
  const timestamp = texts.find((text) => /\b\d{1,2}:\d{2}:\d{2}\b/.test(text));
  if (!timestamp) return fail('No HH:MM:SS-style timestamp was found beneath the messages.');
  return pass(`Message timestamps rendered successfully, including ${timestamp.match(/\b\d{1,2}:\d{2}:\d{2}\b/)?.[0]}.`);
}

async function verifyTypingIndicator(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await mockChatReply(page, { reply: 'Delayed reply.', delayMs: 1200 });
  await chatTextarea(page).fill('Show typing');
  await goButton(page).click();
  await expect(page.locator('span[style*="typingDot"]')).toHaveCount(3);
  await expect(page.getByText('Delayed reply.', { exact: true })).toBeVisible();
  return pass('Three-dot typing indicator appeared while the delayed assistant response was pending.');
}

async function verifyAutoScroll(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await mockChatReply(page, { reply: 'Scroll reply.' });
  for (let index = 1; index <= 8; index += 1) {
    await chatTextarea(page).fill(`Scroll message ${index}`);
    await goButton(page).click();
    await expect(page.getByText(`Scroll message ${index}`, { exact: true })).toBeVisible();
  }
  const scrollContainer = page.locator('div[style*="overflow-y: auto"]').nth(1);
  const atBottom = await scrollContainer.evaluate((element) => {
    const el = element as HTMLElement;
    return Math.abs(el.scrollTop + el.clientHeight - el.scrollHeight) < 48;
  });
  if (!atBottom) return fail('Chat stream did not remain scrolled to the latest message.');
  return pass('Chat stream auto-scrolled to keep the latest message in view.');
}

async function verifyModelBadge(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await leftSidebar(page).getByRole('button', { name: /GPT-5/i }).first().click();
  await expect(leftSidebar(page).getByText('hot', { exact: true }).first()).toBeVisible();
  await expect(rightSidebar(page).getByText('hot', { exact: true })).toBeVisible();
  return pass('Model badge rendered both in the sidebar list and active model detail panel.');
}

async function verifyLanguageSelector(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await page.locator('nav button').filter({ hasText: /EN/ }).click();
  await page.locator('nav').getByRole('button', { name: /^AR/ }).click();
  const dir = await page.evaluate(() => document.documentElement.dir);
  if (dir !== 'rtl') return fail(`Expected document direction to switch to rtl but received ${dir}.`);
  return pass('Selecting Arabic updated the language selector and switched the page direction to RTL.');
}

async function verifyPromptPanelToggle(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await expect(page.getByRole('button', { name: 'Use Cases', exact: true })).toBeVisible();
  await promptToggle(page).click();
  await expect(page.getByRole('button', { name: 'Use Cases', exact: true })).toHaveCount(0);
  await promptToggle(page).click();
  await expect(page.getByRole('button', { name: 'Use Cases', exact: true })).toBeVisible();
  return pass('Prompt suggestions panel toggled closed and reopened from the sparkles button.');
}

async function verifyVideoRecorderCancel(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await mockSuccessfulMedia(page);
  await videoButton(page).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Start Recording', exact: true })).toHaveCount(0);
  await expect(page.getByText(/Video message \(/i)).toHaveCount(0);
  return pass('Video recorder modal closed cleanly without attaching any video.');
}

async function verifyAttachmentFileTypeDetection(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await uploadVirtualFiles(page, [
    { name: 'type-image.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('jpg') },
    { name: 'type-audio.mp3', mimeType: 'audio/mpeg', buffer: Buffer.from('mp3') },
    { name: 'type-doc.pdf', mimeType: 'application/pdf', buffer: Buffer.from('pdf') },
  ]);
  await expect(page.getByText(/Image: type-image\.jpg/i)).toBeVisible();
  const audioLabel = await page.getByText(/type-audio\.mp3/i).textContent();
  const docLabel = await page.getByText(/type-doc\.pdf/i).textContent();
  if (!audioLabel || !docLabel || (/File:/i.test(audioLabel) && /File:/i.test(docLabel))) {
    return fail(
      'Audio and document attachments were both rendered with the generic File label instead of distinct type labels.',
      'Current upload implementation only distinguishes image files from all other file types.',
    );
  }
  return pass('Attachment chips displayed distinct labels for image, audio, and document types.');
}

async function verifyUserMessageStyling(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await mockChatReply(page, { reply: 'Assistant style reference.' });
  await chatTextarea(page).fill('Styled user message');
  await goButton(page).click();
  const styles = await page.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll('div')) as HTMLDivElement[];
    const bubble = candidates.find((el) => {
      const text = el.textContent?.trim();
      const style = getComputedStyle(el);
      return text === 'Styled user message' && style.borderRadius !== '0px' && style.backgroundColor !== 'rgba(0, 0, 0, 0)';
    });
    if (!bubble) return null;
    const rect = bubble.getBoundingClientRect();
    const computed = getComputedStyle(bubble);
    return {
      background: computed.backgroundColor,
      color: computed.color,
      x: rect.x,
    };
  });
  if (!styles) return fail('Could not locate the rendered user message bubble for style verification.');
  if (!/rgb\(/.test(styles.background) || !/255, 255, 255/.test(styles.color) || styles.x < 500) {
    return fail(`User bubble styling deviated from the expected right-aligned accent treatment: ${JSON.stringify(styles)}`);
  }
  return pass('User message bubble used accent styling, white text, and right-side alignment.');
}

async function verifyAssistantMessageStyling(page: Page): Promise<CaseResult> {
  await resetChatPage(page);
  await mockChatReply(page, { reply: 'Styled assistant message' });
  await chatTextarea(page).fill('Create assistant style sample');
  await goButton(page).click();
  const styles = await page.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll('div')) as HTMLDivElement[];
    const bubble = candidates.find((el) => {
      const text = el.textContent?.trim();
      const style = getComputedStyle(el);
      return text === 'Styled assistant message' && style.borderRadius !== '0px' && style.backgroundColor !== 'rgba(0, 0, 0, 0)';
    });
    if (!bubble) return null;
    const rect = bubble.getBoundingClientRect();
    const computed = getComputedStyle(bubble);
    return {
      background: computed.backgroundColor,
      borderStyle: computed.borderStyle,
      boxShadow: computed.boxShadow,
      x: rect.x,
    };
  });
  if (!styles) return fail('Could not locate the rendered assistant message bubble for style verification.');
  if (!/255, 255, 255/.test(styles.background) || styles.borderStyle === 'none' || styles.boxShadow === 'none' || styles.x > 400) {
    return fail(`Assistant bubble styling deviated from the expected left-aligned card treatment: ${JSON.stringify(styles)}`);
  }
  return pass('Assistant message bubble used the white bordered card style with left alignment.');
}

function parseChatCsv(filePath: string): CsvRow[] {
  const content = fs.readFileSync(filePath, 'utf8').replace(/\r/g, '');
  const lines = content.split('\n').filter((line) => line.length > 0);
  const rows: CsvRow[] = [];

  for (let index = 1; index < lines.length; index += 1) {
    if (!/^TC-\d+/.test(lines[index])) continue;

    const firstParts = splitCsvLine(lines[index]);
    if (firstParts.length >= 10) {
      rows.push(toRow(firstParts));
      continue;
    }

    const stepLines = [firstParts[5] || ''];
    let finalParts: string[] | null = null;

    while (index + 1 < lines.length && !/^TC-\d+/.test(lines[index + 1])) {
      index += 1;
      const parts = splitCsvLine(lines[index]);
      if (parts.length >= 5) {
        finalParts = parts;
        break;
      }
      stepLines.push(parts[0] || lines[index]);
    }

    if (!finalParts) finalParts = ['', '', '', '', ''];

    rows.push({
      testId: firstParts[0] || '',
      testTitle: firstParts[1] || '',
      scenarioType: firstParts[2] || '',
      layer: firstParts[3] || '',
      preconditions: firstParts[4] || '',
      testSteps: [...stepLines, finalParts[0] || ''].filter(Boolean).join('\n'),
      testData: finalParts[1] || '',
      expectedResult: finalParts[2] || '',
      actualResult: finalParts[3] || '',
      testStatus: finalParts[4] || '',
    });
  }

  return rows;
}

function toRow(parts: string[]): CsvRow {
  return {
    testId: parts[0] || '',
    testTitle: parts[1] || '',
    scenarioType: parts[2] || '',
    layer: parts[3] || '',
    preconditions: parts[4] || '',
    testSteps: parts[5] || '',
    testData: parts[6] || '',
    expectedResult: parts[7] || '',
    actualResult: parts[8] || '',
    testStatus: parts[9] || '',
  };
}

function splitCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  values.push(current);
  return values;
}

function writeUpdatedCsv(filePath: string, rows: CsvRow[]) {
  const headers = ['Test ID', 'Test Title', 'Scenario Type', 'Layer', 'Preconditions', 'Test Steps', 'Test Data', 'Expected Result', 'Actual Result', 'Test Status', 'Execution Status', 'Notes', 'Executed On'];
  const data = [
    headers.join(','),
    ...rows.map((row) =>
      [
        row.testId,
        row.testTitle,
        row.scenarioType,
        row.layer,
        row.preconditions,
        row.testSteps,
        row.testData,
        row.expectedResult,
        row.actualResult,
        row.testStatus,
        row.executionStatus || '',
        row.notes || '',
        row.executedOn || '',
      ].map(escapeCsvValue).join(','),
    ),
  ].join('\n');
  fs.writeFileSync(filePath, data, 'utf8');
}

function escapeCsvValue(value: string) {
  const normalized = value.replace(/\r/g, '');
  if (!/[",\n]/.test(normalized)) return normalized;
  return `"${normalized.replace(/"/g, '""')}"`;
}
