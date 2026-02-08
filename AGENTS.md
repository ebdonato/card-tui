# AGENTS.md

Guidelines for AI coding agents working in this repository.

## Project Overview

This is `ebdonato`, an npm package that displays a CLI business card and resume.
Users run it via `npx ebdonato` to view Eduardo Donato's professional information
in an interactive terminal interface.

**Technology Stack:**

- Node.js with ES Modules (`"type": "module"`)
- No TypeScript - plain JavaScript only
- CLI application with interactive prompts

## Development Commands

### Run Locally

```bash
npm start              # Run the CLI application
node bin/index.js      # Alternative direct execution
```

### Build

```bash
npm run build          # Generate PDFs for all languages (en, pt, es)
```

### Linting

```bash
npm run lint           # Check for lint errors
npm run lint:fix       # Auto-fix lint errors
```

### Formatting

```bash
npm run format         # Format all files with Prettier
npm run format:check   # Check formatting without modifying
```

### Publishing

```bash
npm publish            # Publish to npm (automatically runs build first)
```

## Testing

**No test framework is currently configured.**

To manually test the application:

```bash
npm start
# Or run directly:
node bin/index.js

# Test with specific language:
node bin/index.js --lang=en   # English
node bin/index.js --lang=pt   # Portuguese
node bin/index.js --lang=es   # Spanish
```

If adding tests in the future:

- Consider using Vitest or Jest with ES Modules support
- Add test script to package.json: `"test": "vitest"` or `"test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"`
- Run single test: `npm test -- path/to/test.js` or `npm test -- -t "test name"`

## Code Style Guidelines

### Formatting (Prettier)

Configuration in `.prettierrc.json`:

| Rule            | Value                                          |
| --------------- | ---------------------------------------------- |
| Semicolons      | None (`"semi": false`)                         |
| Quotes          | Single quotes (`"singleQuote": true`)          |
| Indentation     | 4 spaces (`"tabWidth": 4`, `"useTabs": false`) |
| Trailing commas | Always (`"trailingComma": "all"`)              |
| Line width      | 100 characters (`"printWidth": 100`)           |
| Line endings    | LF only (`"endOfLine": "lf"`)                  |

### Linting (ESLint)

Configuration in `.eslintrc.json`:

- Extends: `eslint:recommended` and `plugin:prettier/recommended`
- Environment: Node.js, ES2022
- `console.log` is allowed (`"no-console": "off"`)
- Unused variables must be prefixed with `_` (e.g., `_err`, `_unused`)

### Import Organization

Use ES Modules exclusively. Organize imports in this order:

```javascript
// 1. Node.js built-in modules
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// 2. External packages (from node_modules)
import inquirer from 'inquirer'
import chalk from 'chalk'
import boxen from 'boxen'

// 3. Local modules (relative paths)
import { myFunction } from './utils.js'
```

### Naming Conventions

| Type         | Convention              | Example                            |
| ------------ | ----------------------- | ---------------------------------- |
| Functions    | camelCase               | `showHeader()`, `downloadResume()` |
| Variables    | camelCase               | `resumeContent`, `destPath`        |
| Constants    | UPPER_SNAKE_CASE        | `RESUME_PATH`, `PDF_PATH`          |
| Action enums | UPPER_SNAKE_CASE values | `actions.VIEW_CV`, `actions.EXIT`  |

### Comments and Documentation

Use JSDoc comments for functions:

```javascript
/**
 * Shows the main header (Box)
 */
function showHeader() {
    // ...
}

/**
 * Downloads the PDF by copying to the user's current directory
 * @returns {void}
 */
function downloadResume() {
    // ...
}
```

## Error Handling

- Use try/catch blocks for file operations and async code
- Prefix unused error variables with `_` to satisfy ESLint:

```javascript
try {
    const content = fs.readFileSync(filePath, 'utf8')
} catch (_err) {
    console.log(chalk.red('Error reading file'))
}
```

- Provide user-friendly error messages using `chalk.red()`
- For async operations, use async/await with try/catch

## Project Structure

```
card-tui/
├── bin/
│   └── index.js          # Main CLI entry point (executable)
├── lib/
│   └── i18n.js           # Internationalization module (locale detection + translations)
├── locales/
│   ├── en.json           # English UI strings
│   ├── pt.json           # Portuguese UI strings
│   └── es.json           # Spanish UI strings
├── data/
│   ├── resume-en.md      # English resume content
│   ├── resume-pt.md      # Portuguese resume content
│   └── resume-es.md      # Spanish resume content
├── assets/
│   ├── resume.css        # PDF styling
│   ├── resume-en.pdf     # Generated English PDF (created by npm run build)
│   ├── resume-pt.pdf     # Generated Portuguese PDF (created by npm run build)
│   └── resume-es.pdf     # Generated Spanish PDF (created by npm run build)
├── build-cv.js           # PDF generation script (generates all languages)
├── package.json          # Package configuration
├── .eslintrc.json        # ESLint configuration
├── .prettierrc.json      # Prettier configuration
└── .prettierignore       # Files excluded from formatting
```

## Internationalization (i18n)

The application supports multiple languages: **English (en)**, **Portuguese (pt)**, and **Spanish (es)**.

### Language Detection Priority

1. CLI flag: `--lang=xx` (e.g., `--lang=pt`)
2. In-app language selector (menu option "Change language")
3. System locale (auto-detected via `Intl.DateTimeFormat`)
4. Fallback to English (`en`)

### Adding/Editing Translations

**UI Strings** are stored in `locales/*.json`:

```javascript
// locales/en.json structure
{
    "header": {
        "work": "Full Stack Developer | Software Engineer at Dock",
        "bio": "...",
        "labelWork": "       Work:",
        // ...
    },
    "menu": {
        "select": "Select:",
        "viewCv": "View my CV (Terminal)",
        // ...
    },
    "messages": {
        "returnToMenu": "Return to menu?",
        // ...
    }
}
```

**Resume Content** is stored in `data/resume-{lang}.md`:

- `resume-en.md` - English resume
- `resume-pt.md` - Portuguese resume
- `resume-es.md` - Spanish resume

### Using Translations in Code

```javascript
import { init as initI18n, t, getLocale } from '../lib/i18n.js'

// Initialize i18n at startup
initI18n()

// Get translated string
console.log(t('menu.viewCv')) // "View my CV (Terminal)"

// Get current locale
const locale = getLocale() // "en", "pt", or "es"

// Use locale for file paths
const resumePath = `data/resume-${locale}.md`
```

### Dynamic Language Switching

The app supports changing language at runtime via the menu:

```javascript
import { setLocale, getLocaleOptions } from '../lib/i18n.js'

// Get available languages for menu
const options = getLocaleOptions()
// Returns: [{ code: 'en', name: 'English' }, { code: 'pt', name: 'Portugues' }, { code: 'es', name: 'Espanol' }]

// Switch language dynamically
setLocale('pt') // Returns true if successful
```

## Key Dependencies

| Package                      | Purpose                                        |
| ---------------------------- | ---------------------------------------------- |
| `chalk`                      | Terminal string styling (colors, bold, italic) |
| `inquirer`                   | Interactive command-line prompts               |
| `boxen`                      | Create boxes in terminal                       |
| `marked` + `marked-terminal` | Render Markdown in terminal                    |
| `qrcode-terminal`            | Generate QR codes in terminal                  |
| `open`                       | Open URLs/files in default application         |
| `md-to-pdf`                  | Convert Markdown to PDF (dev dependency)       |

## Common Patterns

### ES Module Path Resolution

For finding files relative to the current module:

```javascript
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '..')
```

### Async Operations

Use async/await pattern:

```javascript
async function sendEmail() {
    await open(`mailto:${email}?subject=${subject}`)
    console.log(chalk.green('Opening your email client...'))
}
```
