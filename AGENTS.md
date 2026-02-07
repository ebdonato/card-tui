# AGENTS.md - AI Coding Agent Guidelines

This document provides guidelines for AI coding agents working on the `card-tui` project,
a CLI-based personal card and resume application.

## Project Overview

- **Name**: ebdonato (npm package)
- **Type**: CLI application for displaying a developer business card and resume
- **Runtime**: Node.js with ES Modules (`"type": "module"`)
- **Language**: JavaScript (no TypeScript)
- **Entry Point**: `bin/index.js`

## Project Structure

```
card-tui/
├── bin/
│   └── index.js          # Main CLI entry point (shebang executable)
├── data/
│   └── resume.md         # Resume content in Markdown
├── assets/
│   └── resume.pdf        # Generated PDF (from build)
├── build-cv.js           # Build script for PDF generation
├── .eslintrc.json        # ESLint configuration
├── .prettierrc.json      # Prettier configuration
├── package.json          # Project configuration
└── README.md             # Project documentation
```

## Build/Lint/Test Commands

| Command                | Description                                   |
| ---------------------- | --------------------------------------------- |
| `npm install`          | Install dependencies                          |
| `npm start`            | Run the CLI application (`node bin/index.js`) |
| `npm run build`        | Generate PDF from `data/resume.md`            |
| `npm run lint`         | Run ESLint to check for code issues           |
| `npm run lint:fix`     | Run ESLint and auto-fix issues                |
| `npm run format`       | Format all files with Prettier                |
| `npm run format:check` | Check if files are formatted correctly        |
| `npx ebdonato`         | Run the published package from npm            |

### Running a Single File Lint/Format

```bash
npx eslint bin/index.js              # Lint single file
npx eslint bin/index.js --fix        # Lint and fix single file
npx prettier --write bin/index.js    # Format single file
npx prettier --check bin/index.js    # Check single file formatting
```

### Notes on Commands

- **No test suite**: This project does not have tests configured. If adding tests,
  consider using `vitest` or `jest` with ES Modules support.
- **Build dependency**: The `build` command requires `md-to-pdf` and generates
  `assets/resume.pdf` from `data/resume.md`.
- **Pre-commit**: Run `npm run lint && npm run format:check` before committing.

## Code Style Guidelines

### ESLint & Prettier Configuration

This project uses ESLint with Prettier integration. Configuration files:

- `.eslintrc.json` - ESLint rules (extends `eslint:recommended` + Prettier)
- `.prettierrc.json` - Prettier formatting rules

### Formatting Rules (Prettier)

| Rule           | Value  |
| -------------- | ------ |
| Semicolons     | Always |
| Quotes         | Double |
| Tab width      | 2      |
| Trailing comma | All    |
| Print width    | 100    |
| End of line    | LF     |

### Module System

- Use ES Modules exclusively (`import`/`export`, not `require`)
- Use `import.meta.url` and `fileURLToPath` for path resolution
- Example:

    ```javascript
    import fs from 'fs'
    import path from 'path'
    import { fileURLToPath } from 'url'

    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    ```

### Import Order

1. Node.js built-in modules (`fs`, `path`, `url`)
2. External dependencies (`inquirer`, `chalk`, `boxen`, etc.)
3. Local modules/files

### Naming Conventions

| Type         | Convention           | Example                     |
| ------------ | -------------------- | --------------------------- |
| Variables    | camelCase            | `resumeContent`, `qrOutput` |
| Functions    | camelCase            | `showHeader`, `sendEmail`   |
| Constants    | SCREAMING_SNAKE_CASE | `RESUME_PATH`, `PDF_PATH`   |
| Action enums | SCREAMING_SNAKE_CASE | `VIEW_CV`, `DOWNLOAD_CV`    |
| Object keys  | camelCase            | `labelWork`, `labelGitHub`  |

### Function Documentation

Use JSDoc-style comments for functions:

```javascript
/**
 * Renders the CV (Markdown) directly in the terminal
 */
function showResume() {
    // implementation
}
```

### Error Handling

- Use try/catch blocks for file operations and async operations
- Provide user-friendly error messages with `chalk.red()`
- Unused function parameters should be prefixed with `_`
- Example:
    ```javascript
    try {
        const content = fs.readFileSync(RESUME_PATH, 'utf8')
    } catch (_err) {
        console.log(chalk.red('Erro ao ler o arquivo.'))
    }
    ```

### Async/Await

- Prefer `async`/`await` over `.then()` chains for new code
- Existing code uses a mix; maintain consistency within each function

## Key Files

### `bin/index.js`

Main CLI entry point. Contains:

- Personal data configuration (`data` object)
- UI functions (`showHeader`, `showResume`, `downloadResume`, `sendEmail`)
- Menu system using inquirer
- Must have shebang: `#!/usr/bin/env node`

### `build-cv.js`

Build script that converts `data/resume.md` to `assets/resume.pdf`.

### `data/resume.md`

Resume content in Markdown format (displayed in terminal and converted to PDF).

## Best Practices for Agents

1. **Run linting**: Always run `npm run lint` after making changes
2. **Format code**: Run `npm run format` or let ESLint fix formatting issues
3. **Preserve shebang**: `bin/index.js` MUST start with `#!/usr/bin/env node`
4. **Test manually**: Run `npm start` after changes to verify the CLI works
5. **Rebuild PDF**: Run `npm run build` after modifying `data/resume.md`
6. **Path resolution**: Use ES Module path resolution with `import.meta.url`
7. **User feedback**: Use `chalk` for colored output (green=success, red=error)

## Common Tasks

### Adding a new menu option

1. Add action constant to `actions` object in `bin/index.js`
2. Add choice to the `choices` array in the inquirer prompt
3. Add case handler in the switch statement
4. Create corresponding function if needed
5. Run `npm run lint:fix` to ensure code passes linting

### Updating personal information

1. Modify the `data` object in `bin/index.js` for card display
2. Update `data/resume.md` for resume content
3. Run `npm run build` to regenerate PDF
