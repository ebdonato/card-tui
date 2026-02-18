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
import { init as initI18n, t, getLocale, setLocale, getLocaleOptions } from '../lib/i18n.js'

// --- Initialize i18n ---
initI18n()

// --- Path Configuration ---
// Required for ES Modules to find local files correctly
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '..')

/**
 * Gets the resume path for the current locale
 */
function getResumePath() {
    return path.join(rootDir, 'data', `resume-${getLocale()}.md`)
}

/**
 * Gets the PDF path for the current locale
 */
function getPdfPath() {
    return path.join(rootDir, 'assets', `resume-${getLocale()}.pdf`)
}

/**
 * Builds the personal data object with current translations
 */
function getData() {
    return {
        name: chalk.bold.green('Eduardo Batista DONATO'),
        handle: chalk.white('@ebdonato'),
        work: chalk.white(t('header.work')),
        twitter: chalk.cyan('https://x.com/ebdonato'),
        github: chalk.cyan('https://github.com/ebdonato'),
        linkedin: chalk.cyan('https://linkedin.com/in/ebdonato'),
        web: chalk.cyan('https://navto.me/ebdonato'),
        labelWork: chalk.white.bold(t('header.labelWork')),
        labelTwitter: chalk.white.bold(t('header.labelTwitter')),
        labelGitHub: chalk.white.bold(t('header.labelGitHub')),
        labelLinkedIn: chalk.white.bold(t('header.labelLinkedIn')),
        labelWeb: chalk.white.bold(t('header.labelWeb')),
        bio: chalk.italic.gray(t('header.bio')),
    }
}

// --- UI Functions ---

/**
 * Shows the main header (Box)
 */
function showHeader() {
    console.clear()

    const data = getData()

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
    console.log(chalk.bold.green(`\n📱 ${t('messages.qrTitle')}\n`))
    console.log(chalk.dim(`${t('messages.qrScan')}\n`))
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
        const resumeContent = fs.readFileSync(getResumePath(), 'utf8')
        const resumeContentWithoutDivs = resumeContent.replace(
            /<div class="page-break"><\/div>/g,
            '',
        )
        console.log(marked(resumeContentWithoutDivs))

        console.log(chalk.dim(`\n${t('messages.endOfResume')}\n`))
    } catch (_err) {
        console.log(chalk.red(t('messages.resumeError')))
    }
}

/**
 * Downloads the PDF by copying to the user's current directory
 */
function downloadResume() {
    const filename = 'Eduardo_Donato_CV.pdf'
    const destPath = path.join(process.cwd(), filename)

    try {
        fs.copyFileSync(getPdfPath(), destPath)
        console.log(chalk.green(`\n✅ ${t('messages.downloadSuccess')} ${destPath}\n`))
    } catch (_err) {
        console.log(chalk.red(`\n❌ ${t('messages.downloadError')}\n`))
    }
}

/**
 * Opens the default email client
 */
async function sendEmail() {
    const email = 'eduardo.donato@gmail.com'
    const subject = 'Contact via npx ebdonato'
    await open(`mailto:${email}?subject=${subject}`)
    console.log(chalk.green(`\n📧 ${t('messages.emailOpening')}\n`))
}

/**
 * Shows language selection menu
 */
async function changeLanguage() {
    console.clear()

    const localeOptions = getLocaleOptions()
    const currentLocale = getLocale()

    const choices = localeOptions.map((opt) => ({
        name:
            opt.code === currentLocale
                ? `${opt.flag} ${opt.name} (current)`
                : `${opt.flag} ${opt.name}`,
        value: opt.code,
    }))

    const answer = await inquirer.prompt([
        {
            type: 'list',
            name: 'locale',
            message: t('messages.selectLanguage'),
            prefix: chalk.green('🌐'),
            choices,
        },
    ])

    if (answer.locale !== currentLocale) {
        setLocale(answer.locale)
        const newLocaleName = localeOptions.find((o) => o.code === answer.locale)?.name
        console.log(chalk.green(`\n✅ ${t('messages.languageChanged')} ${newLocaleName}\n`))
        await new Promise((resolve) => setTimeout(resolve, 800))
    }

    main()
}

// --- Main Menu ---

const actions = {
    VIEW_CV: 'view_cv',
    DOWNLOAD_CV: 'download_cv',
    SHOW_QR: 'show_qr',
    EMAIL: 'email',
    CHANGE_LANG: 'change_lang',
    EXIT: 'exit',
}

function main() {
    showHeader()

    inquirer
        .prompt([
            {
                type: 'list',
                name: 'action',
                message: t('menu.select'),
                prefix: chalk.green('?'),
                choices: [
                    { name: `📄 ${t('menu.viewCv')}`, value: actions.VIEW_CV },
                    { name: `💾 ${t('menu.downloadCv')}`, value: actions.DOWNLOAD_CV },
                    { name: `📱 ${t('menu.showQr')}`, value: actions.SHOW_QR },
                    { name: `📧 ${t('menu.sendEmail')}`, value: actions.EMAIL },
                    { name: `🌐 ${t('menu.changeLanguage')}`, value: actions.CHANGE_LANG },
                    { name: `🚪 ${t('menu.exit')}`, value: actions.EXIT },
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
                                message: t('messages.returnToMenu'),
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
                                message: t('messages.returnToMenu'),
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

                case actions.CHANGE_LANG:
                    await changeLanguage()
                    break

                case actions.EXIT:
                    console.log(chalk.cyan(`${t('messages.goodbye')} 👋`))
                    process.exit(0)
                    break
            }
        })
}

// Start the application
main()
