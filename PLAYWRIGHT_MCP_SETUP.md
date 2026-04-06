# Playwright MCP Setup

This workspace includes a repo-local Playwright MCP server configuration for VS Code-compatible MCP clients.

Files:

- `.vscode/mcp.json`
- `.vscode/playwright.mcp.config.json`

Server command:

```bash
npx @playwright/mcp@latest --config .vscode/playwright.mcp.config.json
```

Default behavior:

- Uses `chromium`
- Runs in `headless` mode
- Uses `http://127.0.0.1:3000` as the default app base URL

How to use:

1. Start the frontend app on port `3000`.
2. Open the workspace in an MCP-capable client that reads `.vscode/mcp.json`.
3. Ensure the `playwright` server is enabled.
4. Ask the agent to navigate or test pages, for example:

```text
Use Playwright to open /marketplace and capture a screenshot.
```

If your MCP client does not read workspace config automatically, use the same command manually or copy the equivalent config into your client's MCP settings.
