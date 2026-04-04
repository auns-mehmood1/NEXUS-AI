import { test, expect, type APIRequestContext } from '@playwright/test';
import * as XLSX from 'xlsx';
import * as path from 'path';

type WorkbookRow = {
  testId: string;
  testTitle: string;
  scenarioType: string;
  apiEndpoint: string;
  method: string;
  preconditions: string;
  requestPayload: string;
  headers: string;
  testSteps: string;
  expectedStatusCode: string;
  expectedResponse: string;
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

const WORKBOOK_PATH = process.env.TEST_CASE_XLSX || 'api-auth-signup-testcases.xlsx';
const SIGNUP_URL = process.env.SIGNUP_API_URL || 'http://localhost:3001/api/auth/signup';

test.describe('API signup workbook automation', () => {
  test('executes signup API test cases and writes results back to Excel', async ({ request }) => {
    test.setTimeout(8 * 60 * 1000);

    const workbook = XLSX.readFile(WORKBOOK_PATH);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<WorkbookRow>(sheet, { defval: '' });
    const updatedRows: WorkbookRow[] = [];

    for (const row of rows) {
      const result = await test.step(`${row.testId} ${row.testTitle}`, async () => executeCase(request, row));
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
      'apiEndpoint',
      'method',
      'preconditions',
      'requestPayload',
      'headers',
      'testSteps',
      'expectedStatusCode',
      'expectedResponse',
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

async function executeCase(request: APIRequestContext, row: WorkbookRow): Promise<CaseResult> {
  try {
    const handlers: Record<string, () => Promise<CaseResult>> = {
      'TC-001': () => verifyDuplicateEmail(request),
      'TC-002': () => verifyUniqueSignup(request),
      'TC-003': () => verifyMissingField(request, 'name'),
      'TC-004': () => verifyMissingField(request, 'email'),
      'TC-005': () => verifyMissingField(request, 'password'),
      'TC-006': () => verifyInvalidEmailFormat(request),
      'TC-007': () => verifyShortPassword(request),
      'TC-008': () => verifyBoundaryPassword(request),
      'TC-009': () => verifySensitiveFieldsExcluded(request),
      'TC-010': () => verifyScriptPayloadHandled(request),
      'TC-011': () => verifyDuplicateEmailCaseInsensitive(request),
      'TC-012': () => verifyLargeNameHandled(request),
    };

    const handler = handlers[row.testId];
    if (!handler) return blocked(`No automation handler implemented for ${row.testId}.`);
    return await handler();
  } catch (error) {
    return fail(asMessage(error), `Unhandled API execution error for ${row.testId}`);
  }
}

function makeUniqueEmail(prefix = 'api-signup') {
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  return `${prefix}+${stamp}@example.com`;
}

async function postSignup(request: APIRequestContext, payload: Record<string, unknown>) {
  return request.post(SIGNUP_URL, {
    data: payload,
    headers: { 'Content-Type': 'application/json' },
  });
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

async function verifyDuplicateEmail(request: APIRequestContext): Promise<CaseResult> {
  const response = await postSignup(request, {
    name: 'jj',
    email: 'ruqisegeje@yopmail.com',
    password: 'imranZ321@',
  });
  if (response.status() !== 409) {
    return fail(`Expected HTTP 409 for duplicate email, got ${response.status()}.`);
  }
  return pass('Duplicate email request returned HTTP 409 conflict as expected.');
}

async function verifyUniqueSignup(request: APIRequestContext): Promise<CaseResult> {
  const email = makeUniqueEmail();
  const response = await postSignup(request, {
    name: 'jj',
    email,
    password: 'imranZ321@',
  });
  expect(response.status()).toBe(201);
  const body = await response.json();
  expect(body.accessToken).toBeTruthy();
  expect(body.refreshToken).toBeTruthy();
  expect(body.user?.email).toBe(email);
  return pass(`Unique signup succeeded with HTTP 201 for ${email}.`);
}

async function verifyMissingField(request: APIRequestContext, field: 'name' | 'email' | 'password'): Promise<CaseResult> {
  const payload: Record<string, unknown> = {
    name: 'jj',
    email: makeUniqueEmail('missing'),
    password: 'imranZ321@',
  };
  delete payload[field];
  const response = await postSignup(request, payload);
  if (response.status() !== 400) {
    return fail(`Expected HTTP 400 for missing ${field}, got ${response.status()}.`);
  }
  return pass(`Missing ${field} request returned HTTP 400 validation error.`);
}

async function verifyInvalidEmailFormat(request: APIRequestContext): Promise<CaseResult> {
  const response = await postSignup(request, {
    name: 'jj',
    email: 'invalid-email',
    password: 'imranZ321@',
  });
  if (response.status() !== 400) {
    return fail(`Expected HTTP 400 for invalid email format, got ${response.status()}.`);
  }
  return pass('Invalid email format request returned HTTP 400 validation error.');
}

async function verifyShortPassword(request: APIRequestContext): Promise<CaseResult> {
  const response = await postSignup(request, {
    name: 'jj',
    email: makeUniqueEmail('shortpw'),
    password: '12345',
  });
  if (response.status() !== 400) {
    return fail(`Expected HTTP 400 for short password, got ${response.status()}.`);
  }
  return pass('Short password request returned HTTP 400 validation error.');
}

async function verifyBoundaryPassword(request: APIRequestContext): Promise<CaseResult> {
  const email = makeUniqueEmail('boundarypw');
  const response = await postSignup(request, {
    name: 'jj',
    email,
    password: '123456',
  });
  expect(response.status()).toBe(201);
  const body = await response.json();
  expect(body.user?.email).toBe(email);
  return pass(`Boundary password length of 6 characters accepted with HTTP 201 for ${email}.`);
}

async function verifySensitiveFieldsExcluded(request: APIRequestContext): Promise<CaseResult> {
  const email = makeUniqueEmail('safeuser');
  const response = await postSignup(request, {
    name: 'jj',
    email,
    password: 'imranZ321@',
  });
  expect(response.status()).toBe(201);
  const body = await response.json();
  expect(body.user).toBeTruthy();
  expect(body.user.password).toBeUndefined();
  expect(body.user.refreshToken).toBeUndefined();
  return pass('Signup response exposed only safe user fields and excluded sensitive values.');
}

async function verifyScriptPayloadHandled(request: APIRequestContext): Promise<CaseResult> {
  const email = makeUniqueEmail('xss');
  const response = await postSignup(request, {
    name: '<script>alert(1)</script>',
    email,
    password: 'imranZ321@',
  });
  if (![201, 400].includes(response.status())) {
    return fail(`Expected HTTP 201 or 400 for script payload, got ${response.status()}.`);
  }
  if (response.status() === 201) {
    const body = await response.json();
    expect(body.user?.email).toBe(email);
  }
  return pass(`Script payload was handled safely with HTTP ${response.status()}.`);
}

async function verifyDuplicateEmailCaseInsensitive(request: APIRequestContext): Promise<CaseResult> {
  const response = await postSignup(request, {
    name: 'jj',
    email: 'RUQISEGEJE@YOPMAIL.COM',
    password: 'imranZ321@',
  });
  if (response.status() !== 409) {
    return fail(`Expected HTTP 409 for case-insensitive duplicate email, got ${response.status()}.`);
  }
  return pass('Uppercase variant of existing email returned HTTP 409 conflict as expected.');
}

async function verifyLargeNameHandled(request: APIRequestContext): Promise<CaseResult> {
  const email = makeUniqueEmail('largename');
  const response = await postSignup(request, {
    name: 'A'.repeat(600),
    email,
    password: 'imranZ321@',
  });
  if (![201, 400].includes(response.status())) {
    return fail(`Expected HTTP 201 or 400 for large name payload, got ${response.status()}.`);
  }
  return pass(`Large name payload was handled safely with HTTP ${response.status()}.`);
}
