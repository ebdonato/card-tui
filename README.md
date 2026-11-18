# Eduardo DONATO's card business

A CLI business card and resume viewer - share your professional profile directly in the terminal.

![Preview](./assets/preview.png)

<!-- TODO: Add a screenshot of the CLI in action -->

## The Problem

Sharing professional information typically requires sending links, PDFs, or directing people to websites. For developers and tech professionals, there's a more elegant solution: **a terminal-based business card**.

This package allows anyone to view your professional profile instantly with a single command - no browser, no downloads, no friction. It's memorable, developer-friendly, and showcases your technical skills in the process.

## Quick Start

Run directly with npx (no installation required):

```bash
npx ebdonato
```

### Multi-Language Support

The CLI supports **English**, **Portuguese**, and **Spanish**. It automatically detects your system language, or you can:

**Change language from the menu:**

Select "Change language" from the interactive menu to switch languages on the fly.

**Force a specific language via CLI flag:**

```bash
npx ebdonato --lang=en   # English
npx ebdonato --lang=pt   # Portuguese (Portugues)
npx ebdonato --lang=es   # Spanish (Espanol)
```

That's it! You'll see an interactive menu with options to:

- **View CV** - Read the full resume directly in the terminal (Markdown rendered beautifully)
- **Download CV** - Save a PDF copy to your current directory
- **Show QR Code** - Display a scannable QR code for mobile access
- **Send Email** - Open your default email client to get in touch
- **Change Language** - Switch between English, Portuguese, and Spanish
- **Exit** - Close the application

## Features

- **Zero Installation** - Works instantly via `npx`
- **Multi-Language** - Supports English, Portuguese, and Spanish (auto-detects system locale or switch from menu)
- **Interactive Menu** - Easy navigation with arrow keys
- **Terminal-Rendered Resume** - Markdown displayed with colors and formatting
- **PDF Download** - Get a professionally styled PDF resume
- **QR Code** - Quick mobile access to online profile
- **Cross-Platform** - Works on macOS, Linux, and Windows

## Create Your Own Business Card

Want to make your own CLI business card? Fork this project and customize it!

### Step 1: Fork and Clone

```bash
# Fork this repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/card-tui.git
cd card-tui
npm install
```

### Step 2: Customize Your Information

1. **Update `package.json`**:
    - Change `"name"` to your npm username (e.g., `"name": "johndoe"`)
    - Update `"description"`, `"author"`, and other metadata

2. **Edit `bin/index.js`**:
    - Update the `data` object with your personal information:

        ```javascript
        const data = {
            name: chalk.bold.green('Your Name'),
            handle: chalk.white('@yourhandle'),
            work: chalk.white('Your Title at Your Company'),
            twitter: chalk.cyan('https://x.com/yourhandle'),
            github: chalk.cyan('https://github.com/yourusername'),
            linkedin: chalk.cyan('https://linkedin.com/in/yourprofile'),
            web: chalk.cyan('https://yourwebsite.com'),
            // ... update labels and bio
        }
        ```

    - Update the email address in the `sendEmail()` function

3. **Replace `data/cv-eduardo-donato-{lang}.md`**:
    - Write your resume in Markdown format for each language
    - Files: `cv-eduardo-donato-en.md`, `cv-eduardo-donato-pt.md`, `cv-eduardo-donato-es.md`
    - This content is displayed in the terminal and converted to PDF

4. **Update `locales/*.json`**:
    - Edit `locales/en.json`, `locales/pt.json`, `locales/es.json`
    - Translate UI strings (menu labels, messages, header text)

5. **Customize PDF styling** (optional):
    - Edit `pdf/template.typ` ([Typst](https://typst.app/)) to change the PDF appearance — colors, fonts
      and sizes are variables at the top of the file
    - The PDF is built from the same Markdown, so keep its structure: `# Name`, a tagline paragraph,
      contact paragraphs, `## Section`, `### Company | Role`, `#### _Period, Location_` and bullet lists

### Step 3: Build and Test

```bash
# Generate the PDF resume
npm run build

# Test locally
npm start

# Check for linting errors
npm run lint
```

### Step 4: Publish to npm

```bash
# Login to npm (create account at npmjs.com if needed)
npm login

# Publish your package
npm publish
```

Now anyone can run `npx yourusername` to see your business card!

### Tips for Customization

- **Colors**: Use `chalk` for terminal colors (`chalk.green()`, `chalk.cyan()`, `chalk.bold()`, etc.)
- **Box Style**: Modify `boxen` options in `showHeader()` for different border styles
- **Menu Options**: Add or remove choices in the `inquirer.prompt()` call in `main()`
- **QR Code**: Update the URL in `showQRCode()` to point to your profile

## Development

### Prerequisites

- Node.js (v22 or higher)
- npm

### Commands

| Command                | Description                     |
| ---------------------- | ------------------------------- |
| `npm start`            | Run the CLI locally             |
| `npm run build`        | Generate PDFs for all languages |
| `npm run lint`         | Check for code style issues     |
| `npm run lint:fix`     | Auto-fix linting errors         |
| `npm run format`       | Format code with Prettier       |
| `npm run format:check` | Check code formatting           |

### Project Structure

```text
card-tui/
├── bin/
│   └── index.js          # Main CLI application
├── lib/
│   └── i18n.js           # Internationalization module
├── locales/
│   ├── en.json           # English UI strings
│   ├── pt.json           # Portuguese UI strings
│   └── es.json           # Spanish UI strings
├── data/
│   ├── cv-eduardo-donato-en.md      # English resume
│   ├── cv-eduardo-donato-pt.md      # Portuguese resume
│   └── cv-eduardo-donato-es.md      # Spanish resume
├── assets/
│   ├── cv-eduardo-donato-en.pdf     # Generated English PDF
│   ├── cv-eduardo-donato-pt.pdf     # Generated Portuguese PDF
│   └── cv-eduardo-donato-es.pdf     # Generated Spanish PDF
├── pdf/
│   ├── template.typ      # PDF design (Typst template)
│   ├── parse-resume.js   # Markdown -> structured data for the template
│   ├── fonts/            # Fonts embedded in the PDF
│   └── icons/            # Contact icons
├── build-cv.js           # PDF generation script (all languages)
├── package.json          # Package configuration
└── AGENTS.md             # Guidelines for AI coding agents
```

## Tech Stack

- **[chalk](https://github.com/chalk/chalk)** - Terminal string styling
- **[inquirer](https://github.com/SBoudrias/Inquirer.js)** - Interactive command-line prompts
- **[boxen](https://github.com/sindresorhus/boxen)** - Create boxes in terminal
- **[marked](https://github.com/markedjs/marked)** + **[marked-terminal](https://github.com/mikaelbr/marked-terminal)** - Render Markdown in terminal
- **[qrcode-terminal](https://github.com/gtanner/qrcode-terminal)** - Generate QR codes
- **[open](https://github.com/sindresorhus/open)** - Open URLs/files in default application
- **[Typst](https://typst.app/)** (via [typst.ts](https://github.com/Myriad-Dreamin/typst.ts)) - Typeset the PDF resume from Markdown

## Inspiration

This project is a complete rewrite and evolution of [ebdonato/npx_card](https://github.com/ebdonato/npx_card), rebuilt with modern ES Modules, updated dependencies, and an improved interactive experience.

Originally inspired by [anmol098/npx_card](https://github.com/anmol098/npx_card) - a brilliant idea for developer business cards in the terminal.

## License

MIT License - See [LICENSE](LICENSE) for details.

## Author

### **Eduardo Batista Donato**

- GitHub: [@ebdonato](https://github.com/ebdonato)
- LinkedIn: [ebdonato](https://linkedin.com/in/ebdonato)
- Twitter: [@ebdonato](https://x.com/ebdonato)
