# Automation Skills

Use this skill when the user wants to generate a Playwright Python automation script from an Excel test case sheet and a target URL.

## Trigger

Invoke the `automation-agent` when the user provides:
- a target URL to automate
- an Excel test case sheet (`.xlsx`) containing test cases, test steps, test data, and expected results

## Agent

Delegate execution to `.claude/agents/automatio-agent.md`.

## Skill Areas

- excel parsing
  - read all rows from the provided Excel sheet using `openpyxl`
  - extract Test Case ID, Description, Test Steps, Test Data, and Expected Result columns
  - parse every test case and do not skip any rows

- page inspection
  - fetch the target URL and inspect the live page structure
  - identify accurate locators: `data-testid`, ARIA roles, labels, placeholders, CSS selectors
  - confirm element existence before mapping to script locators

- script generation
  - generate one `pytest` test function per test case, named after the Test Case ID
  - use `playwright.sync_api` with `pytest-playwright`
  - apply robust locator strategy: `data-testid` > `role` > `label` > `placeholder` > `CSS` > `XPath`
  - add explicit waits and never use `time.sleep`
  - wrap each test in try/except to prevent one failure from blocking the rest
  - capture a screenshot on failure: `automation-artifacts/screenshots/<test_id>_fail.png`
  - include results write-back logic for both XLSX and source CSV
  - write/update these fields per execution: `Actual Result`, `Test Status`, `Bug Description`, `Steps to Reproduce`, `Severity`, `Screenshot Path`
  - support source CSV filename variants: `*-test-cases.csv` and `*-test-case.csv`
  - normalize/match imperfect CSV headers (for example: `Bug Descr`, `Steps to R`) and remove empty header columns before writing
  - keep write-back resilient: if XLSX is locked or unavailable, continue and still update CSV where possible
  - avoid flaky route callbacks: do not use `page.wait_for_timeout(...)` inside `page.route(...)` handlers
  - add safe route cleanup in teardown (`unroute` or `unroute_all`) so one test cannot leak handlers into the next
  - add a docstring per test describing Test Case ID, description, and expected result

- output
  - write the complete script to `specs/<feature>_automation.py`
  - derive `<feature>` from the Excel filename or URL
  - do not execute the script, run pytest, or launch any browser during generation

## Execution Rules

- always read the Excel sheet before generating any script and never generate from assumptions
- always cover every test case in the sheet and do not skip any cases
- always write the script to disk, not only to chat
- never execute the script during this generation skill
- never run the browser or any test runner during this generation skill
- never update the Excel sheet in generation mode because there is no execution

## Runtime Stability Guidance (When User Explicitly Asks To Execute Later)

- if execution is requested in a later step, run tests with `pytest-playwright` and ensure browser dependency is available
- keep result writing non-blocking: log warnings on lock/permission issues instead of crashing the full suite
- after execution, verify that CSV rows were updated in intended columns and not shifted by malformed delimiters or headers

## Output Format

After writing the script, return:

```
Script Generation Summary
--------------------------
Output File      : specs/<feature>_automation.py
Total Test Cases : XX
Tests Generated  : XX
Skipped          : XX (with reasons)
Locator Notes    : Any assumptions made about selectors
Next Step        : Run with: pytest specs/<feature>_automation.py -v
```
