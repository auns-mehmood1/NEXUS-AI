import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import xlsx from 'xlsx';

const REPO_ROOT = process.cwd();
const ARTIFACT_ROOT = path.join(REPO_ROOT, 'automation-artifacts');
const GENERATED_DIR = path.join(ARTIFACT_ROOT, 'generated-specs');
const BUG_DIR = path.join(ARTIFACT_ROOT, 'bugs');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : 'true';
    args[key] = value;
    if (value !== 'true') i += 1;
  }
  return args;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function sanitizeName(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100) || 'unnamed-test-case';
}

function parseCsvText(csvText) {
  const rows = [];
  let current = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i += 1) {
    const ch = csvText[i];
    if (inQuotes) {
      if (ch === '"') {
        const next = csvText[i + 1];
        if (next === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ',') {
      current.push(field);
      field = '';
      continue;
    }
    if (ch === '\n') {
      current.push(field);
      field = '';
      rows.push(current);
      current = [];
      continue;
    }
    if (ch === '\r') continue;
    field += ch;
  }

  if (field.length > 0 || current.length > 0) {
    current.push(field);
    rows.push(current);
  }

  while (rows.length > 0 && rows[rows.length - 1].every((cell) => String(cell || '').trim() === '')) {
    rows.pop();
  }

  return rows;
}

function normalizeCaseObject(raw) {
  const pick = (obj, keys) => {
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) return obj[key] ?? '';
    }
    return '';
  };

  const testId = String(pick(raw, ['Test ID', 'TestId', 'ID']) || '').trim();
  const testTitle = String(pick(raw, ['Test Title', 'Title', 'TestName']) || '').trim();

  if (!testId && !testTitle) return null;

  return {
    'Test ID': testId || `TC-AUTO-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    'Test Title': testTitle || testId || 'Untitled Test Case',
    Layer: String(pick(raw, ['Layer']) || '').trim(),
    'Test Steps': String(pick(raw, ['Test Steps', 'Steps']) || ''),
    'Test Data': String(pick(raw, ['Test Data', 'Data']) || ''),
    'Expected Result': String(pick(raw, ['Expected Result', 'Expected']) || ''),
    'Actual Result': String(pick(raw, ['Actual Result', 'Actual']) || ''),
    'Test Status': String(pick(raw, ['Test Status', 'Status']) || 'Not Executed').trim() || 'Not Executed',
    'Screenshot Path': String(pick(raw, ['Screenshot Path']) || ''),
  };
}

function casesFromCsvFile(csvPath) {
  const csvText = fs.readFileSync(csvPath, 'utf8');
  const table = parseCsvText(csvText);
  if (!table.length) return [];

  const header = table[0].map((h) => String(h || '').trim());
  const rows = [];

  for (let r = 1; r < table.length; r += 1) {
    const line = table[r];
    if (!line || line.every((c) => String(c || '').trim() === '')) continue;
    const obj = {};
    for (let c = 0; c < header.length; c += 1) {
      const key = header[c] || `Column${c + 1}`;
      obj[key] = line[c] ?? '';
    }
    const normalized = normalizeCaseObject(obj);
    if (normalized) rows.push(normalized);
  }

  return rows;
}

function casesFromWorkbook(xlsxPath, sheetNameArg) {
  const wb = xlsx.readFile(xlsxPath);
  const preferred = sheetNameArg || (wb.SheetNames.includes('TestCases') ? 'TestCases' : wb.SheetNames[0]);
  const ws = wb.Sheets[preferred];
  if (!ws) {
    throw new Error(`Unable to locate test sheet in ${xlsxPath}`);
  }

  const rawRows = xlsx.utils.sheet_to_json(ws, { defval: '' });
  const cases = rawRows
    .map((r) => normalizeCaseObject(r))
    .filter(Boolean);

  return {
    workbook: wb,
    sheetName: preferred,
    cases,
  };
}

function newWorkbookFromCases(cases, bugSheetName) {
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(cases, {
    header: [
      'Test ID',
      'Test Title',
      'Layer',
      'Test Steps',
      'Test Data',
      'Expected Result',
      'Actual Result',
      'Test Status',
      'Screenshot Path',
    ],
  });
  xlsx.utils.book_append_sheet(wb, ws, 'TestCases');

  const bugHeader = [[
    'Bug ID',
    'Test ID',
    'Test Title',
    'Severity',
    'Bug Description',
    'Steps to Reproduce',
    'Expected',
    'Actual',
    'Screenshot Path',
    'Bug Report File',
    'Timestamp',
  ]];
  xlsx.utils.book_append_sheet(wb, xlsx.utils.aoa_to_sheet(bugHeader), bugSheetName);

  return wb;
}

function ensureInputWorkbook(xlsxPath, csvPath, bugSheetName) {
  if (fs.existsSync(xlsxPath)) {
    return casesFromWorkbook(xlsxPath);
  }

  const candidateCsv = csvPath
    ? csvPath
    : xlsxPath.replace(/\.xlsx$/i, '.csv');

  if (!candidateCsv || !fs.existsSync(candidateCsv)) {
    throw new Error(`Input sheet not found. Missing XLSX: ${xlsxPath} and CSV fallback: ${candidateCsv}`);
  }

  const cases = casesFromCsvFile(candidateCsv);
  if (!cases.length) {
    throw new Error(`No test cases found in CSV: ${candidateCsv}`);
  }

  const created = newWorkbookFromCases(cases, bugSheetName);
  xlsx.writeFile(created, xlsxPath);
  return {
    workbook: created,
    sheetName: 'TestCases',
    cases,
  };
}

function generateDynamicSpec(specPath, cases, targetUrl) {
  const specCases = cases.map((c) => ({
    id: c['Test ID'],
    title: c['Test Title'],
    layer: c.Layer,
    steps: c['Test Steps'],
    testData: c['Test Data'],
    expected: c['Expected Result'],
  }));

  const source = `import { test, expect } from '@playwright/test';

const BASE_URL = process.env.AUTOMATION_BASE_URL || ${JSON.stringify(targetUrl)};
const CASES = ${JSON.stringify(specCases, null, 2)};

function s(value) {
  return String(value || '');
}

function l(value) {
  return s(value).toLowerCase();
}

function hasAny(text, needles) {
  return needles.some((n) => text.includes(n));
}

function extractQuotedPhrases(...chunks) {
  const input = chunks.filter(Boolean).join(' ');
  const out = [];
  const regex = /"([^"]{2,120})"/g;
  let match;
  while ((match = regex.exec(input)) !== null) {
    const phrase = (match[1] || '').trim();
    if (phrase) out.push(phrase);
  }
  return [...new Set(out)];
}

function sanitizeName(input) {
  return s(input)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100) || 'unnamed-test-case';
}

function parseData(input) {
  const map = {};
  const text = s(input).replace(/\\r/g, '');
  for (const rawLine of text.split('\\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    const sep = line.includes(':') ? ':' : line.includes('=') ? '=' : null;
    if (!sep) continue;
    const idx = line.indexOf(sep);
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (key) map[key] = value;
  }
  return map;
}

function firstValue(map, keys, fallback) {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(map, key) && s(map[key]).trim()) {
      return s(map[key]).trim();
    }
  }
  return fallback;
}

async function fillAuthInputs(page, data, haystack) {
  const emailValue = firstValue(data, ['email', 'email address'], hasAny(haystack, ['invalid email']) ? 'invalid-email' : 'qa.user@example.com');
  const passwordValue = firstValue(data, ['password', 'pass'], hasAny(haystack, ['5 character', 'short password']) ? '12345' : 'Passw0rd!');
  const fullNameValue = firstValue(data, ['full name', 'name'], 'QA User');

  const emailInput = page.locator('input[type="email"], input[name="email"], input[autocomplete="email"]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"], input[autocomplete="current-password"], input[autocomplete="new-password"]').first();
  const fullNameInput = page.locator('input[name="name"], input[placeholder*="Full Name" i], input[autocomplete="name"]').first();

  if (await emailInput.count()) await emailInput.fill(emailValue);
  if (await passwordInput.count()) await passwordInput.fill(passwordValue);
  if (await fullNameInput.count() && hasAny(haystack, ['full name', 'signup', 'create account'])) await fullNameInput.fill(fullNameValue);
}

async function clickPrimaryAuthButton(page, haystack) {
  if (hasAny(haystack, ['sign in', 'login'])) {
    const signIn = page.getByRole('button', { name: /sign in/i }).first();
    if (await signIn.count()) {
      await signIn.click();
      return;
    }
  }
  if (hasAny(haystack, ['create account', 'signup', 'sign up'])) {
    const signup = page.getByRole('button', { name: /create account|sign up/i }).first();
    if (await signup.count()) {
      await signup.click();
      return;
    }
  }

  const submit = page.locator('button[type="submit"]').first();
  if (await submit.count()) await submit.click();
}

async function runCase(page, tc) {
  const title = s(tc.title);
  const steps = s(tc.steps);
  const expected = s(tc.expected);
  const testData = s(tc.testData);
  const haystack = l([title, steps, expected, testData, tc.layer].join(' '));
  const dataMap = parseData(testData);

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  if (hasAny(haystack, ['accepts typed input', 'accepts valid email', 'masks', 'required validation', 'submit', 'redirect'])) {
    await fillAuthInputs(page, dataMap, haystack);
  }

  if (hasAny(haystack, ['submit', 'sign in', 'create account', 'required validation', 'redirect'])) {
    await clickPrimaryAuthButton(page, haystack);
  }

  if (hasAny(haystack, ['page title'])) {
    await expect(page).toHaveTitle(/nexusai/i);
  }

  const phrases = extractQuotedPhrases(title, expected);
  for (const phrase of phrases) {
    if (phrase.startsWith('/')) continue;
    if (phrase.length < 2) continue;
    await expect(page.getByText(phrase, { exact: false }).first()).toBeVisible();
  }

  if (hasAny(haystack, ['navigates to /auth/login', 'redirects to /auth/login'])) {
    await expect(page).toHaveURL(/\/auth\/login/);
  }
  if (hasAny(haystack, ['navigates to /auth/signup', 'redirects to /auth/signup'])) {
    await expect(page).toHaveURL(/\/auth\/signup/);
  }
  if (hasAny(haystack, ['redirects to /dashboard', 'navigates to /dashboard'])) {
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  }
  if (hasAny(haystack, ['navigates to /chat', 'redirects to /chat'])) {
    await expect(page).toHaveURL(/\/chat/, { timeout: 10000 });
  }

  if (hasAny(haystack, ['only two form fields', 'exactly two input fields'])) {
    const count = await page.locator('form input').count();
    expect(count).toBe(2);
  }

  if (hasAny(haystack, ['required validation'])) {
    const invalidCount = await page.locator('input:invalid').count();
    expect(invalidCount).toBeGreaterThan(0);
  }

  if (hasAny(haystack, ['masks all typed characters', 'password field masks'])) {
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  }
}

for (const tc of CASES) {
  test(`\${tc.id} | \${tc.title}`, async ({ page }, testInfo) => {
    try {
      await runCase(page, tc);
    } catch (error) {
      const fileName = `bug-\${sanitizeName(tc.title)}.png`;
      const screenshotPath = testInfo.outputPath(fileName);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      await testInfo.attach('screenshot', { path: screenshotPath, contentType: 'image/png' });
      throw error;
    }
  });
}
`;

  ensureDir(path.dirname(specPath));
  fs.writeFileSync(specPath, source, 'utf8');
}

function runPlaywright(generatedSpecPath, reportJsonPath, targetUrl) {
  const result = spawnSync(
    'npx',
    ['playwright', 'test', generatedSpecPath, '--reporter=json', '--retries=1'],
    {
      cwd: REPO_ROOT,
      shell: true,
      encoding: 'utf8',
      env: {
        ...process.env,
        FORCE_COLOR: '0',
        AUTOMATION_BASE_URL: targetUrl,
      },
      maxBuffer: 64 * 1024 * 1024,
    },
  );

  ensureDir(path.dirname(reportJsonPath));
  fs.writeFileSync(reportJsonPath, result.stdout || '', 'utf8');

  return {
    code: result.status ?? 1,
    stderr: result.stderr || '',
  };
}

function walkSuites(node, onTest) {
  if (!node) return;
  if (Array.isArray(node)) {
    for (const item of node) walkSuites(item, onTest);
    return;
  }

  if (node.specs) {
    for (const spec of node.specs) {
      for (const t of spec.tests || []) onTest(t, spec);
    }
  }

  for (const suite of node.suites || []) {
    walkSuites(suite, onTest);
  }
}

function bestResult(test) {
  const results = test?.results || [];
  if (!results.length) return null;
  return results[results.length - 1];
}

function normalizeStatus(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'passed') return 'Passed';
  if (s === 'failed' || s === 'timedout') return 'Failed';
  return 'Blocked';
}

function extractTestIdentity(combinedTitle) {
  const text = String(combinedTitle || '');
  const pipeIndex = text.indexOf('|');
  if (pipeIndex < 0) {
    return {
      testId: text.trim(),
      testTitle: text.trim(),
    };
  }
  return {
    testId: text.slice(0, pipeIndex).trim(),
    testTitle: text.slice(pipeIndex + 1).trim(),
  };
}

function extractScreenshotPath(result) {
  const attachments = result?.attachments || [];
  const shot = attachments.find((a) => (a?.name || '').toLowerCase().includes('screenshot') && a?.path);
  if (shot?.path) return shot.path;
  const image = attachments.find((a) => String(a?.contentType || '').startsWith('image/') && a?.path);
  return image?.path || '';
}

function severityFromError(message) {
  const m = String(message || '').toLowerCase();
  if (m.includes('err_connection_refused') || m.includes('navigation timeout') || m.includes('net::')) return 'Critical';
  if (m.includes('timeout')) return 'Major';
  return 'Major';
}

function updateWorkbook(wb, sheetName, reportText, options) {
  const report = JSON.parse(reportText);
  const byId = new Map();
  const bugs = [];

  walkSuites(report.suites, (test, spec) => {
    const rawTitle = test?.title || spec?.title || '';
    const ident = extractTestIdentity(rawTitle);
    if (!ident.testId) return;

    const result = bestResult(test);
    const status = normalizeStatus(result?.status);
    const errorMessage = result?.error?.message || result?.error?.stack || '';
    const screenshotPath = extractScreenshotPath(result);
    const actual = status === 'Passed' ? 'Passed' : (errorMessage || 'Execution failed');

    byId.set(ident.testId, {
      status,
      actual: String(actual).slice(0, 4000),
      screenshotPath,
      title: ident.testTitle,
      errorMessage,
    });

    if (status === 'Failed') {
      const fileBase = `bug-${sanitizeName(ident.testTitle)}`;
      const reportFilePath = path.join(BUG_DIR, `${fileBase}.md`);
      ensureDir(path.dirname(reportFilePath));
      const timestamp = new Date().toISOString();
      const detail = [
        `# ${fileBase}`,
        '',
        `- Test ID: ${ident.testId}`,
        `- Test Title: ${ident.testTitle}`,
        `- Severity: ${severityFromError(errorMessage)}`,
        `- Screenshot: ${screenshotPath || 'N/A'}`,
        `- Time: ${timestamp}`,
        '',
        '## Error',
        '',
        '```',
        String(errorMessage || 'No error message captured').slice(0, 6000),
        '```',
      ].join('\n');
      fs.writeFileSync(reportFilePath, detail, 'utf8');

      bugs.push({
        bugId: `${fileBase}-${timestamp.replace(/[:.]/g, '')}`,
        testId: ident.testId,
        testTitle: ident.testTitle,
        severity: severityFromError(errorMessage),
        description: `Expected case to pass but it failed. ${String(errorMessage || '').slice(0, 2000)}`,
        steps: `1. Open ${options.targetUrl}\n2. Execute ${ident.testId} - ${ident.testTitle}\n3. Observe failure`,
        expected: '',
        actual: String(actual).slice(0, 2000),
        screenshotPath: screenshotPath || '',
        reportFilePath,
        timestamp,
      });
    }
  });

  const ws = wb.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(ws, { defval: '' });
  for (const row of rows) {
    const testId = String(row['Test ID'] || '').trim();
    if (!testId || !byId.has(testId)) continue;
    const result = byId.get(testId);
    row['Test Status'] = result.status;
    row['Actual Result'] = result.actual;
    row['Screenshot Path'] = result.screenshotPath || '';
  }

  wb.Sheets[sheetName] = xlsx.utils.json_to_sheet(rows, {
    header: [
      'Test ID',
      'Test Title',
      'Layer',
      'Test Steps',
      'Test Data',
      'Expected Result',
      'Actual Result',
      'Test Status',
      'Screenshot Path',
    ],
  });

  const bugRows = [[
    'Bug ID',
    'Test ID',
    'Test Title',
    'Severity',
    'Bug Description',
    'Steps to Reproduce',
    'Expected',
    'Actual',
    'Screenshot Path',
    'Bug Report File',
    'Timestamp',
  ]];

  for (const bug of bugs) {
    bugRows.push([
      bug.bugId,
      bug.testId,
      bug.testTitle,
      bug.severity,
      bug.description,
      bug.steps,
      bug.expected,
      bug.actual,
      bug.screenshotPath,
      bug.reportFilePath,
      bug.timestamp,
    ]);
  }

  const bugSheet = xlsx.utils.aoa_to_sheet(bugRows);
  if (wb.SheetNames.includes(options.bugSheetName)) {
    wb.Sheets[options.bugSheetName] = bugSheet;
  } else {
    xlsx.utils.book_append_sheet(wb, bugSheet, options.bugSheetName);
  }

  return { byId, bugs };
}

function buildStats(byId) {
  let passed = 0;
  let failed = 0;
  let blocked = 0;

  for (const value of byId.values()) {
    if (value.status === 'Passed') passed += 1;
    else if (value.status === 'Failed') failed += 1;
    else blocked += 1;
  }

  return {
    executed: byId.size,
    passed,
    failed,
    blocked,
  };
}

function main() {
  const cli = parseArgs(process.argv.slice(2));

  const targetUrl = String(cli.url || 'http://localhost:3000/auth/signup');
  const xlsxPath = path.resolve(REPO_ROOT, String(cli.xlsx || path.join('specs', 'signup-test-cases.xlsx')));
  const csvPath = cli.csv ? path.resolve(REPO_ROOT, String(cli.csv)) : '';
  const bugSheetName = String(cli.bugSheet || 'BugReport');
  const sheetNameArg = cli.sheet ? String(cli.sheet) : '';

  const suiteSeed = sanitizeName(path.basename(xlsxPath, path.extname(xlsxPath)) || 'dynamic-suite');
  const generatedSpecPath = path.join(GENERATED_DIR, `${suiteSeed}.generated.spec.ts`);
  const reportJsonPath = path.join(ARTIFACT_ROOT, `${suiteSeed}-playwright-report.json`);

  ensureDir(ARTIFACT_ROOT);
  ensureDir(GENERATED_DIR);
  ensureDir(BUG_DIR);

  const input = ensureInputWorkbook(xlsxPath, csvPath, bugSheetName);
  const cases = input.cases;
  if (!cases.length) {
    console.error(`No test cases found in input sheet: ${xlsxPath}`);
    process.exit(2);
  }

  generateDynamicSpec(generatedSpecPath, cases, targetUrl);

  const run = runPlaywright(generatedSpecPath, reportJsonPath, targetUrl);
  const reportText = fs.existsSync(reportJsonPath) ? fs.readFileSync(reportJsonPath, 'utf8') : '';
  if (!reportText.trim()) {
    console.error('Playwright JSON report was empty or missing.');
    if (run.stderr) console.error(run.stderr);
    process.exit(2);
  }

  const workbook = xlsx.readFile(xlsxPath);
  const sheetName = sheetNameArg || (workbook.SheetNames.includes('TestCases') ? 'TestCases' : workbook.SheetNames[0]);
  const { byId, bugs } = updateWorkbook(workbook, sheetName, reportText, {
    bugSheetName,
    targetUrl,
  });
  xlsx.writeFile(workbook, xlsxPath);

  const stats = buildStats(byId);
  const summary = {
    generatedSpecPath,
    reportPath: reportJsonPath,
    xlsxPath,
    totalExecuted: stats.executed,
    passed: stats.passed,
    failed: stats.failed,
    blocked: stats.blocked,
    majorBugs: bugs.slice(0, 20).map((bug) => ({
      testId: bug.testId,
      severity: bug.severity,
      screenshotPath: bug.screenshotPath,
      bugReportFile: bug.reportFilePath,
    })),
  };

  console.log(JSON.stringify(summary, null, 2));
  process.exit(run.code === 0 ? 0 : 1);
}

main();
