#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import inquirer from 'inquirer'
import chalk from 'chalk'
import boxen from 'boxen'
import qrcode from 'qrcode-terminal'
import open from 'open'
import { marked } from 'marked'
import TerminalRenderer from 'marked-terminal'

// --- Path Configuration ---
// Required for ES Modules to find local files correctly
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '..')

const RESUME_PATH = path.join(rootDir, 'data', 'resume.md')
const PDF_PATH = path.join(rootDir, 'assets', 'resume.pdf')

// --- Personal Data (Header) ---
const data = {
    name: chalk.bold.green('Eduardo Batista DONATO'),
    handle: chalk.white('@ebdonato'),
    work: chalk.white('Full Stack Developer | Software Engineer at Dock'),
    twitter: chalk.cyan('https://x.com/ebdonato'),
    github: chalk.cyan('https://github.com/ebdonato'),
    linkedin: chalk.cyan('https://linkedin.com/in/ebdonato'),
    web: chalk.cyan('https://navto.me/ebdonato'),
    labelWork: chalk.white.bold('       Work:'),
    labelTwitter: chalk.white.bold('    Twitter:'),
    labelGitHub: chalk.white.bold('     GitHub:'),
    labelLinkedIn: chalk.white.bold('   LinkedIn:'),
    labelWeb: chalk.white.bold('        Web:'),
    bio: chalk.italic.gray(
        `I am an electrical and planning engineer.\nI am currently a full stack developer (Vue, React, Node, Go and AWS)\nand Microsoft Power Platform developer.`,
    ),
}

// --- UI Functions ---

/**
 * Shows the main header (Box)
 */
function showHeader() {
    console.clear()

    const headers = [
        `${data.labelWork}  ${data.work}`,
        ``,
        `${data.labelTwitter}  ${data.twitter}`,
        `${data.labelGitHub}  ${data.github}`,
        `${data.labelLinkedIn}  ${data.linkedin}`,
        `${data.labelWeb}  ${data.web}`,
        ``,
        `${data.bio}`,
    ].join('\n')

    const card = boxen(headers, {
        margin: 1,
        padding: 1,
        borderStyle: 'round',
        borderColor: 'green',
        title: data.name,
        titleAlignment: 'center',
    })

    console.log(card)
}

/**
 * Shows the QR Code for mobile access
 */
function showQRCode() {
    console.clear()
    console.log(chalk.bold.green('\n📱 QR Code - Mobile Access\n'))
    console.log(chalk.dim('Scan to access: https://navto.me/ebdonato\n'))
    qrcode.generate('https://navto.me/ebdonato', { small: true })
    console.log('')
}

/**
 * Renders the CV (Markdown) directly in the terminal
 */
function showResume() {
    console.clear()

    // Configure marked to use terminal colors and styles
    marked.setOptions({
        renderer: new TerminalRenderer({
            width: 80,
            reflowText: true,
            showSectionPrefix: false,
        }),
    })

    try {
        const resumeContent = fs.readFileSync(RESUME_PATH, 'utf8')
        console.log(marked(resumeContent))

        console.log(chalk.dim('\n--- End of Resume ---\n'))
    } catch (_err) {
        console.log(chalk.red('Error reading resume. Does the resume.md file exist?'))
    }
}

/**
 * Downloads the PDF by copying to the user's current directory
 */
function downloadResume() {
    const filename = 'Eduardo_Donato_CV.pdf'
    const destPath = path.join(process.cwd(), filename)

    try {
        fs.copyFileSync(PDF_PATH, destPath)
        console.log(chalk.green(`\n✅ Success! CV saved to: ${destPath}\n`))
    } catch (_err) {
        console.log(
            chalk.red(
                `\n❌ Error saving PDF. Make sure the file was generated with 'npm run build'.\n`,
            ),
        )
    }
}

/**
 * Opens the default email client
 */
async function sendEmail() {
    const email = 'youremail@example.com' // Replace with your real email
    const subject = 'Contact via npx ebdonato'
    await open(`mailto:${email}?subject=${subject}`)
    console.log(chalk.green('\n📧 Opening your email client...\n'))
}

// --- Main Menu ---

const actions = {
    VIEW_CV: 'view_cv',
    DOWNLOAD_CV: 'download_cv',
    SHOW_QR: 'show_qr',
    EMAIL: 'email',
    EXIT: 'exit',
}

function main() {
    showHeader()

    inquirer
        .prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Select:',
                prefix: chalk.green('?'),
                choices: [
                    { name: '📄 View my CV (Terminal)', value: actions.VIEW_CV },
                    { name: '💾 Download my CV (PDF)', value: actions.DOWNLOAD_CV },
                    { name: '📱 Show QR Code', value: actions.SHOW_QR },
                    { name: '📧 Send an email', value: actions.EMAIL },
                    { name: '🚪 Exit', value: actions.EXIT },
                ],
            },
        ])
        .then(async (answer) => {
            switch (answer.action) {
                case actions.VIEW_CV:
                    showResume()
                    // Brief pause before returning to menu or exiting
                    inquirer
                        .prompt([
                            {
                                type: 'confirm',
                                name: 'back',
                                message: 'Return to menu?',
                                default: true,
                            },
                        ])
                        .then((ans) => {
                            if (ans.back) main()
                            else process.exit(0)
                        })
                    break

                case actions.DOWNLOAD_CV:
                    downloadResume()
                    // Keep the process alive briefly
                    setTimeout(() => process.exit(0), 1000)
                    break

                case actions.SHOW_QR:
                    showQRCode()
                    inquirer
                        .prompt([
                            {
                                type: 'confirm',
                                name: 'back',
                                message: 'Return to menu?',
                                default: true,
                            },
                        ])
                        .then((ans) => {
                            if (ans.back) main()
                            else process.exit(0)
                        })
                    break

                case actions.EMAIL:
                    await sendEmail()
                    setTimeout(() => process.exit(0), 1000)
                    break

                case actions.EXIT:
                    console.log(chalk.cyan('Thanks for visiting! 👋'))
                    process.exit(0)
                    break
            }
        })
}

// Start the application
main()
