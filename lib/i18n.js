import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const LOCALES_DIR = path.join(__dirname, '..', 'locales')

const SUPPORTED_LOCALES = ['en', 'pt', 'es']
const DEFAULT_LOCALE = 'en'

let currentLocale = DEFAULT_LOCALE
let translations = {}

/**
 * Detects locale from CLI args or system environment
 * Priority: --lang flag > system locale > default (en)
 * @returns {string} The detected locale code
 */
function detectLocale() {
    // 1. Check CLI args: --lang=pt or --lang pt
    const args = process.argv.slice(2)
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--lang=')) {
            const lang = args[i].split('=')[1]
            if (SUPPORTED_LOCALES.includes(lang)) return lang
        }
        if (args[i] === '--lang' && args[i + 1]) {
            if (SUPPORTED_LOCALES.includes(args[i + 1])) return args[i + 1]
        }
    }

    // 2. Check system locale
    try {
        const systemLocale = Intl.DateTimeFormat().resolvedOptions().locale || ''
        const langCode = systemLocale.split('-')[0].toLowerCase()
        if (SUPPORTED_LOCALES.includes(langCode)) return langCode
    } catch (_err) {
        // Ignore errors in locale detection
    }

    // 3. Fallback
    return DEFAULT_LOCALE
}

/**
 * Initializes the i18n system by detecting locale and loading translations
 */
function init() {
    currentLocale = detectLocale()
    const localePath = path.join(LOCALES_DIR, `${currentLocale}.json`)

    try {
        const content = fs.readFileSync(localePath, 'utf8')
        translations = JSON.parse(content)
    } catch (_err) {
        // Fallback to English if locale file not found
        const fallbackPath = path.join(LOCALES_DIR, 'en.json')
        translations = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'))
        currentLocale = 'en'
    }
}

/**
 * Gets a translated string by key (dot notation supported)
 * @param {string} key - Dot notation key (e.g., 'menu.viewCv')
 * @returns {string} The translated string or the key if not found
 */
function t(key) {
    const keys = key.split('.')
    let value = translations
    for (const k of keys) {
        value = value?.[k]
    }
    return value || key
}

/**
 * Gets the current locale code
 * @returns {string} Current locale (en, pt, or es)
 */
function getLocale() {
    return currentLocale
}

/**
 * Gets the list of supported locales
 * @returns {string[]} Array of supported locale codes
 */
function getSupportedLocales() {
    return SUPPORTED_LOCALES
}

/**
 * Sets the locale and reloads translations
 * @param {string} locale - The locale code to set (en, pt, or es)
 * @returns {boolean} True if locale was set successfully
 */
function setLocale(locale) {
    if (!SUPPORTED_LOCALES.includes(locale)) {
        return false
    }

    const localePath = path.join(LOCALES_DIR, `${locale}.json`)

    try {
        const content = fs.readFileSync(localePath, 'utf8')
        translations = JSON.parse(content)
        currentLocale = locale
        return true
    } catch (_err) {
        return false
    }
}

/**
 * Gets locale display names for the language selector
 * @returns {Object[]} Array of {code, name} objects
 */
function getLocaleOptions() {
    return [
        { code: 'en', name: 'English' },
        { code: 'pt', name: 'Portugues' },
        { code: 'es', name: 'Espanol' },
    ]
}

export { init, t, getLocale, setLocale, getSupportedLocales, getLocaleOptions, SUPPORTED_LOCALES }
