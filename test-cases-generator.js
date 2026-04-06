const XLSX = require('xlsx');

// Test cases data
const testCases = [
  {
    "Test ID": "TC-001",
    "Test Title": "Successful user registration with valid data",
    "Scenario Type": "Positive",
    "Layer": "Integration",
    "Preconditions": "- Application is running\n- Database is empty\n- Frontend at /auth/signup",
    "Test Steps": "1. Enter valid full name\n2. Enter valid email\n3. Enter password (6+ chars)\n4. Click Create Account",
    "Test Data": "name: John Doe\nemail: john@example.com\npassword: Password123",
    "Expected Result": "- User created in database\n- Password hashed (bcrypt 12 rounds)\n- Email stored in lowercase\n- Access token generated (15min expiry)\n- Refresh token generated (7d expiry)\n- Refresh token hashed and stored\n- User redirected to /dashboard\n- Auth state updated in store",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-002",
    "Test Title": "Registration with existing email",
    "Scenario Type": "Negative",
    "Layer": "Backend",
    "Preconditions": "- User existing@test.com exists in database\n- Frontend at /auth/signup",
    "Test Steps": "1. Enter full name\n2. Enter existing email\n3. Enter valid password\n4. Click Create Account",
    "Test Data": "name: New User\nemail: existing@test.com\npassword: Password123",
    "Expected Result": "- 409 Conflict error returned\n- Error message Email already in use displayed\n- No new user created in database\n- Tokens not generated",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-003",
    "Test Title": "Registration with invalid email format",
    "Scenario Type": "Negative",
    "Layer": "Frontend",
    "Preconditions": "- Frontend at /auth/signup",
    "Test Steps": "1. Enter full name\n2. Enter invalid email\n3. Enter valid password\n4. Click Create Account",
    "Test Data": "name: Test User\nemail: invalid-email\npassword: Password123",
    "Expected Result": "- Browser validation blocks submission\n- Please include an '@' in the email address message",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-004",
    "Test Title": "Registration with short password (<6 chars)",
    "Scenario Type": "Negative",
    "Layer": "Frontend",
    "Preconditions": "- Frontend at /auth/signup",
    "Test Steps": "1. Enter full name\n2. Enter valid email\n3. Enter 5-character password\n4. Click Create Account",
    "Test Data": "name: Test User\nemail: test@example.com\npassword: 12345",
    "Expected Result": "- Client-side validation error\n- Password must be at least 6 characters displayed\n- No API call made",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-005",
    "Test Title": "Registration with empty required fields",
    "Scenario Type": "Negative",
    "Layer": "Frontend",
    "Preconditions": "- Frontend at /auth/signup",
    "Test Steps": "1. Leave name empty\n2. Leave email empty\n3. Leave password empty\n4. Click Create Account",
    "Test Data": "name: \nemail: \npassword: ",
    "Expected Result": "- Browser validation blocks submission\n- Please fill out this field for each empty field\n- No API call made",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-006",
    "Test Title": "Registration with exactly 6 character password",
    "Scenario Type": "Edge",
    "Layer": "Integration",
    "Preconditions": "- Frontend at /auth/signup",
    "Test Steps": "1. Enter valid name\n2. Enter valid email\n3. Enter 6-character password\n4. Click Create Account",
    "Test Data": "name: Edge User\nemail: edge@example.com\npassword: 123456",
    "Expected Result": "- Registration successful\n- User created in database\n- Redirect to /dashboard",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-007",
    "Test Title": "Registration with uppercase email - stored as lowercase",
    "Scenario Type": "Edge",
    "Layer": "Database",
    "Preconditions": "- Frontend at /auth/signup",
    "Test Steps": "1. Enter name with mixed case\n2. Enter email with uppercase letters\n3. Enter valid password\n4. Click Create Account\n5. Check database",
    "Test Data": "name: Test User\nemail: TEST@EXAMPLE.COM\npassword: Password123",
    "Expected Result": "- User created successfully\n- Email stored as test@example.com (lowercase)\n- Login works with any case variant of email",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-008",
    "Test Title": "Duplicate registration with different email case",
    "Scenario Type": "Negative",
    "Layer": "Database",
    "Preconditions": "- User test@example.com exists\n- Frontend at /auth/signup",
    "Test Steps": "1. Enter new name\n2. Enter same email with different case\n3. Enter valid password\n4. Click Create Account",
    "Test Data": "name: New User\nemail: TEST@EXAMPLE.COM\npassword: Password123",
    "Expected Result": "- 409 Conflict error returned\n- Email already in use displayed\n- No new user created (case-insensitive check)",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-009",
    "Test Title": "Button disabled during loading state",
    "Scenario Type": "Positive",
    "Layer": "Frontend",
    "Preconditions": "- Frontend at /auth/signup",
    "Test Steps": "1. Fill valid form data\n2. Click Create Account\n3. Observe button during API call",
    "Test Data": "name: Test User\nemail: loading@example.com\npassword: Password123",
    "Expected Result": "- Button text changes to Creating account...\n- Button disabled (not clickable)\n- Background color changes to gray\n- Button re-enabled after response",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-010",
    "Test Title": "Network error during registration",
    "Scenario Type": "Negative",
    "Layer": "Integration",
    "Preconditions": "- Backend server stopped\n- Frontend at /auth/signup",
    "Test Steps": "1. Fill valid form data\n2. Click Create Account",
    "Test Data": "name: Test User\nemail: network@example.com\npassword: Password123",
    "Expected Result": "- Error message Registration failed. Please try again. displayed\n- No redirect occurs\n- Button re-enabled",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-011",
    "Test Title": "Navigate to login page",
    "Scenario Type": "Positive",
    "Layer": "Frontend",
    "Preconditions": "- Frontend at /auth/signup",
    "Test Steps": "1. Click Sign in link",
    "Test Data": "-",
    "Expected Result": "- Navigated to /auth/login\n- Login page displayed",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-012",
    "Test Title": "Navigate to guest session",
    "Scenario Type": "Positive",
    "Layer": "Frontend",
    "Preconditions": "- Frontend at /auth/signup",
    "Test Steps": "1. Click Continue as guest link",
    "Test Data": "-",
    "Expected Result": "- Navigated to /chat\n- Guest session initiated (3h expiry)",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-013",
    "Test Title": "Password contains special characters",
    "Scenario Type": "Edge",
    "Layer": "Integration",
    "Preconditions": "- Frontend at /auth/signup",
    "Test Steps": "1. Enter valid name\n2. Enter valid email\n3. Enter password with special chars\n4. Click Create Account",
    "Test Data": "name: Special Chars User\nemail: special@example.com\npassword: P@ss!w0rd#$%",
    "Expected Result": "- Registration successful\n- Password hashed and stored\n- Login works with same password",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-014",
    "Test Title": "Very long name field",
    "Scenario Type": "Edge",
    "Layer": "Integration",
    "Preconditions": "- Frontend at /auth/signup",
    "Test Steps": "1. Enter 100+ character name\n2. Enter valid email\n3. Enter valid password\n4. Click Create Account",
    "Test Data": "name: A (repeated 100 times)\nemail: longname@example.com\npassword: Password123",
    "Expected Result": "- Registration successful\n- Name stored correctly in database\n- No truncation",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-015",
    "Test Title": "Verify password hash uses bcrypt with 12 rounds",
    "Scenario Type": "Positive",
    "Layer": "Database",
    "Preconditions": "- User registered via signup\n- Access to database",
    "Test Steps": "1. Query user document\n2. Verify password hash format\n3. Attempt to verify with bcrypt",
    "Test Data": "-",
    "Expected Result": "- Password hash starts with $2a$12$ or $2b$12$\n- bcrypt.compare() returns true for correct password\n- bcrypt.compare() returns false for wrong password",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-016",
    "Test Title": "Verify refresh token hash uses bcrypt with 10 rounds",
    "Scenario Type": "Positive",
    "Layer": "Database",
    "Preconditions": "- User registered via signup\n- Access to database",
    "Test Steps": "1. Query user document\n2. Verify refreshToken hash format",
    "Test Data": "-",
    "Expected Result": "- Refresh token hash starts with $2a$10$ or $2b$10$\n- Original token not stored in plain text",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-017",
    "Test Title": "Verify access token expiry is 15 minutes",
    "Scenario Type": "Positive",
    "Layer": "Backend",
    "Preconditions": "- User registered successfully",
    "Test Steps": "1. Decode access token (JWT)\n2. Check exp claim",
    "Test Data": "-",
    "Expected Result": "- exp = current time + 900 seconds (15 minutes)",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-018",
    "Test Title": "Verify refresh token expiry is 7 days",
    "Scenario Type": "Positive",
    "Layer": "Backend",
    "Preconditions": "- User registered successfully",
    "Test Steps": "1. Decode refresh token (JWT)\n2. Check exp claim",
    "Test Data": "-",
    "Expected Result": "- exp = current time + 604800 seconds (7 days)",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-019",
    "Test Title": "Verify user response excludes password",
    "Scenario Type": "Security",
    "Layer": "Integration",
    "Preconditions": "- User registered successfully",
    "Test Steps": "1. Inspect API response\n2. Check user object",
    "Test Data": "-",
    "Expected Result": "- Response includes: _id, name, email\n- Response does NOT include: password, refreshToken",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-020",
    "Test Title": "Verify auth store receives tokens and user data",
    "Scenario Type": "Positive",
    "Layer": "Frontend",
    "Preconditions": "- User registered successfully",
    "Test Steps": "1. Check Zustand auth store\n2. Verify values stored",
    "Test Data": "-",
    "Expected Result": "- Store contains: user object, accessToken, refreshToken\n- Values match API response",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-021",
    "Test Title": "SQL injection attempt in name field",
    "Scenario Type": "Negative",
    "Layer": "Backend",
    "Preconditions": "- Frontend at /auth/signup",
    "Test Steps": "1. Enter SQL injection in name\n2. Enter valid email\n3. Enter valid password\n4. Click Create Account",
    "Test Data": "name: '; DROP TABLE users; --\nemail: sql@example.com\npassword: Password123",
    "Expected Result": "- Name stored as literal string (no injection)\n- No SQL errors\n- Registration may succeed or fail on validation",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-022",
    "Test Title": "XSS attempt in name field",
    "Scenario Type": "Negative",
    "Layer": "Backend",
    "Preconditions": "- Frontend at /auth/signup",
    "Test Steps": "1. Enter XSS payload in name\n2. Enter valid email\n3. Enter valid password\n4. Click Create Account\n5. Check stored data",
    "Test Data": "name: <script>alert('XSS')</script>\nemail: xss@example.com\npassword: Password123",
    "Expected Result": "- Name stored as literal string\n- Script not executed when displayed\n- Proper escaping in UI",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-023",
    "Test Title": "Rapid successive form submissions",
    "Scenario Type": "Edge",
    "Layer": "Integration",
    "Preconditions": "- Frontend at /auth/signup",
    "Test Steps": "1. Fill valid form\n2. Click Create Account rapidly 5 times",
    "Test Data": "name: Rapid User\nemail: rapid@example.com\npassword: Password123",
    "Expected Result": "- First submission processed\n- Subsequent submissions blocked by loading state\n- Only one user created in database",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-024",
    "Test Title": "Email with subdomain",
    "Scenario Type": "Edge",
    "Layer": "Integration",
    "Preconditions": "- Frontend at /auth/signup",
    "Test Steps": "1. Enter valid name\n2. Enter email with subdomain\n3. Enter valid password\n4. Click Create Account",
    "Test Data": "name: Subdomain User\nemail: user@mail.example.com\npassword: Password123",
    "Expected Result": "- Registration successful\n- Email stored correctly",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-025",
    "Test Title": "Email with plus sign (Gmail style)",
    "Scenario Type": "Edge",
    "Layer": "Integration",
    "Preconditions": "- Frontend at /auth/signup",
    "Test Steps": "1. Enter valid name\n2. Enter email with plus sign\n3. Enter valid password\n4. Click Create Account",
    "Test Data": "name: Plus User\nemail: user+tag@example.com\npassword: Password123",
    "Expected Result": "- Registration successful\n- Email stored with plus sign preserved",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-026",
    "Test Title": "Name with Unicode characters",
    "Scenario Type": "Edge",
    "Layer": "Integration",
    "Preconditions": "- Frontend at /auth/signup",
    "Test Steps": "1. Enter name with Unicode chars\n2. Enter valid email\n3. Enter valid password\n4. Click Create Account",
    "Test Data": "name: José García Müller\nemail: unicode@example.com\npassword: Password123",
    "Expected Result": "- Registration successful\n- Name stored correctly with Unicode\n- Display works in UI",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-027",
    "Test Title": "Verify createdAt timestamp is set",
    "Scenario Type": "Database",
    "Layer": "Database",
    "Preconditions": "- User registered successfully",
    "Test Steps": "1. Query user document in database",
    "Test Data": "-",
    "Expected Result": "- createdAt field exists\n- createdAt is within 1 second of registration time\n- createdAt is ISO date string",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-028",
    "Test Title": "Verify updatedAt timestamp is set",
    "Scenario Type": "Database",
    "Layer": "Database",
    "Preconditions": "- User registered successfully",
    "Test Steps": "1. Query user document in database",
    "Test Data": "-",
    "Expected Result": "- updatedAt field exists\n- updatedAt equals createdAt (initial creation)",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-029",
    "Test Title": "Password field shows/hides characters",
    "Scenario Type": "UI",
    "Layer": "Frontend",
    "Preconditions": "- Frontend at /auth/signup",
    "Test Steps": "1. Focus on password field\n2. Observe character masking",
    "Test Data": "-",
    "Expected Result": "- Characters shown as bullets/dots\n- Password obscured while typing",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  },
  {
    "Test ID": "TC-030",
    "Test Title": "Form fields have correct input types",
    "Scenario Type": "UI",
    "Layer": "Frontend",
    "Preconditions": "- Frontend at /auth/signup",
    "Test Steps": "1. Inspect name input\n2. Inspect email input\n3. Inspect password input",
    "Test Data": "-",
    "Expected Result": "- Name: type=text\n- Email: type=email\n- Password: type=password",
    "Actual Result": "Not Executed",
    "Test Status": "Pending"
  }
];

// Create workbook
const workbook = XLSX.utils.book_new();

// Create worksheet
const worksheet = XLSX.utils.json_to_sheet(testCases);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(workbook, worksheet, "Signup Test Cases");

// Write to file
XLSX.writeFile(workbook, "Signup_Test_Cases.xlsx");

console.log("Excel file created successfully: Signup_Test_Cases.xlsx");
console.log(`Total test cases: ${testCases.length}`);
