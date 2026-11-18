import { lexer } from 'marked'

const EMOJI_PATTERN = /\p{Extended_Pictographic}|‍|️/gu
const PHONE_EMOJI_PATTERN = /[☎\u{1f4de}\u{1f4f1}]/u
const LOCATION_EMOJI_PATTERN = /[\u{1f4cd}\u{1f3e0}\u{1f30d}-\u{1f30f}]/u
const PHONE_TEXT_PATTERN = /^\+?[\d\s().-]{8,}$/
const PERIOD_SUFFIX_PATTERN = /^(.*?)\s*\(([^()]*\d{4}[^()]*)\)\.?$/

/**
 * Removes emojis (the PDF template draws vector icons instead) and trims the result
 * @param {string} text
 * @returns {string}
 */
function stripEmoji(text) {
    return text.replace(EMOJI_PATTERN, '').trim()
}

/**
 * Flattens marked inline tokens into styled text runs
 * @param {object[]} tokens - Inline tokens from marked
 * @param {object} style - Style inherited from the parent tokens
 * @returns {{ text: string, bold?: boolean, italic?: boolean, href?: string }[]}
 */
function toRuns(tokens = [], style = {}) {
    const runs = []

    for (const token of tokens) {
        if (token.type === 'strong') {
            runs.push(...toRuns(token.tokens, { ...style, bold: true }))
        } else if (token.type === 'em') {
            runs.push(...toRuns(token.tokens, { ...style, italic: true }))
        } else if (token.type === 'link') {
            runs.push(...toRuns(token.tokens, { ...style, href: token.href }))
        } else if (token.type === 'br') {
            runs.push({ ...style, text: ' ' })
        } else if (token.tokens?.length) {
            runs.push(...toRuns(token.tokens, style))
        } else if (token.type === 'text' || token.type === 'escape' || token.type === 'codespan') {
            runs.push({ ...style, text: token.text })
        }
    }

    return mergeRuns(runs)
}

/**
 * Joins neighbouring runs that share the same style
 * @param {object[]} runs
 * @returns {object[]}
 */
function mergeRuns(runs) {
    const merged = []

    for (const run of runs) {
        const last = merged.at(-1)
        const sameStyle =
            last && last.bold === run.bold && last.italic === run.italic && last.href === run.href

        if (sameStyle) {
            last.text += run.text
        } else if (run.text) {
            merged.push({ ...run })
        }
    }

    return merged
}

/**
 * Concatenates the text of a list of runs
 * @param {object[]} runs
 * @returns {string}
 */
function plainText(runs) {
    return runs.map((run) => run.text).join('')
}

/**
 * Classifies a link by its target so the template can pick an icon
 * @param {string} href
 * @returns {string}
 */
function contactKindFromHref(href) {
    if (href.startsWith('mailto:')) return 'email'
    if (href.startsWith('tel:')) return 'phone'
    if (href.includes('linkedin.com')) return 'linkedin'
    if (href.includes('github.com')) return 'github'
    return 'web'
}

/**
 * Turns a contact paragraph ("✉️ [mail](mailto:x) | ☎️ +55 ... | 📍 City") into contact items
 * @param {object[]} runs
 * @returns {{ kind: string, text: string, href?: string }[]}
 */
function parseContactLine(runs) {
    const contacts = []

    for (const run of runs) {
        if (run.href) {
            contacts.push({
                kind: contactKindFromHref(run.href),
                text: stripEmoji(run.text),
                href: run.href,
            })
            continue
        }

        for (const piece of run.text.split('|')) {
            const text = stripEmoji(piece.replace(/[[\]]/g, ''))
            if (!text) continue

            if (PHONE_EMOJI_PATTERN.test(piece) || PHONE_TEXT_PATTERN.test(text)) {
                contacts.push({ kind: 'phone', text, href: `tel:${text.replace(/[^\d+]/g, '')}` })
            } else if (LOCATION_EMOJI_PATTERN.test(piece)) {
                contacts.push({ kind: 'location', text })
            } else {
                contacts.push({ kind: 'text', text })
            }
        }
    }

    return contacts
}

/**
 * Detects a "**Label**: a, b, c" paragraph and splits it into a labelled list
 * @param {object[]} runs
 * @returns {{ label: string, items: string[] } | null}
 */
function parseFact(runs) {
    const [first, ...rest] = runs
    const restText = plainText(rest)

    if (!first?.bold || !/^\s*:|:\s*$/.test(first.text + restText.slice(0, 2))) return null

    const label = first.text.replace(/:\s*$/, '').trim()
    const value = restText.replace(/^\s*:/, '').trim()
    if (!label || !value) return null

    const separator = value.includes('|') ? '|' : ','
    const items = value
        .split(separator)
        .map((item) => item.trim())
        .filter(Boolean)

    return { label, items }
}

/**
 * Parses a list item such as "**Degree:** Institution (2001 – 2006)."
 * @param {object[]} runs
 * @returns {{ title?: string, detail?: string, period?: string, runs?: object[] }}
 */
function parseListItem(runs) {
    const [first, ...rest] = runs
    const isPlainRest = rest.length > 0 && rest.every((run) => !run.href && !run.bold)

    if (first?.bold && isPlainRest) {
        const title = first.text.replace(/:\s*$/, '').trim()
        const match = plainText(rest).trim().match(PERIOD_SUFFIX_PATTERN)

        if (match) {
            return { title, detail: match[1].trim(), period: match[2].trim() }
        }
    }

    return { runs }
}

/**
 * Splits the token stream into the header block and the level-2 sections
 * @param {object[]} tokens
 * @returns {{ header: object[], sections: { heading: object, tokens: object[] }[] }}
 */
function splitSections(tokens) {
    const header = []
    const sections = []

    for (const token of tokens) {
        if (token.type === 'space' || token.type === 'html') continue

        if (token.type === 'heading' && token.depth === 2) {
            sections.push({ heading: token, tokens: [] })
        } else if (sections.length) {
            sections.at(-1).tokens.push(token)
        } else {
            header.push(token)
        }
    }

    return { header, sections }
}

/**
 * Parses the body of a section into paragraphs, facts, job entries and list items
 * @param {{ heading: object, tokens: object[] }} section
 * @param {string} locale
 * @returns {object}
 */
function parseSection(section, locale) {
    const title = plainText(toRuns(section.heading.tokens)).trim()
    const result = { title, paragraphs: [], facts: [], entries: [], items: [] }
    let entry = null

    const fail = (message) => {
        throw new Error(`cv-eduardo-donato-${locale}.md, section "${title}": ${message}`)
    }

    for (const token of section.tokens) {
        const runs = toRuns(token.tokens)

        if (token.type === 'heading' && token.depth === 3) {
            const [company, ...role] = plainText(runs).split('|')
            entry = {
                company: company.trim(),
                role: role.join('|').trim(),
                period: '',
                location: '',
                paragraphs: [],
                bullets: [],
            }
            result.entries.push(entry)
        } else if (token.type === 'heading' && token.depth === 4) {
            if (!entry) fail(`"#### ${token.text}" must come after a "### Company | Role" heading`)
            const [period, ...location] = plainText(runs).split(',')
            entry.period = period.trim()
            entry.location = location.join(',').trim()
        } else if (token.type === 'paragraph') {
            const fact = entry ? null : parseFact(runs)
            if (fact) result.facts.push(fact)
            else (entry ?? result).paragraphs.push(runs)
        } else if (token.type === 'list') {
            const items = token.items.map((item) => toRuns(item.tokens))
            if (entry) entry.bullets.push(...items)
            else result.items.push(...items.map(parseListItem))
        } else {
            const firstLine = token.raw.trim().split('\n')[0].slice(0, 60)
            fail(`unsupported markdown block "${token.type}": ${firstLine}`)
        }
    }

    for (const item of result.entries) {
        if (!item.period) {
            fail(`"${item.company}" is missing its "#### _period, location_" line`)
        }
    }

    return result
}

/**
 * Parses a resume markdown file into the structured data consumed by the Typst template
 * @param {string} markdown - Content of data/cv-eduardo-donato-{locale}.md
 * @param {string} locale - Locale code, used for hyphenation and error messages
 * @returns {object}
 */
export function parseResume(markdown, locale) {
    const { header, sections } = splitSections(lexer(markdown))

    const nameToken = header.find((token) => token.type === 'heading' && token.depth === 1)
    if (!nameToken) {
        throw new Error(`cv-eduardo-donato-${locale}.md: missing the "# Name" heading`)
    }
    if (!sections.length) {
        throw new Error(`cv-eduardo-donato-${locale}.md: no "## Section" headings found`)
    }

    const [taglineToken, ...contactTokens] = header.filter((token) => token.type === 'paragraph')
    const tagline = toRuns(taglineToken?.tokens)
        .map(({ text, href }) => ({ text: text.replace(EMOJI_PATTERN, ''), ...(href && { href }) }))
        .filter((run) => run.text)
    if (tagline.length) {
        tagline[0].text = tagline[0].text.trimStart()
    }

    return {
        lang: locale,
        name: plainText(toRuns(nameToken.tokens)).trim(),
        tagline,
        contactLines: contactTokens
            .map((token) => parseContactLine(toRuns(token.tokens)))
            .filter((line) => line.length),
        sections: sections.map((section) => parseSection(section, locale)),
    }
}
