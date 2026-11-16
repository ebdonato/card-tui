import fs from 'fs'
import path from 'path'

import { NodeCompiler } from '@myriaddreamin/typst-ts-node-compiler'

import { parseResume } from './pdf/parse-resume.js'

const LOCALES = ['en', 'pt', 'es']
const WORKSPACE_PATH = path.resolve('pdf')
const TEMPLATE_PATH = path.join(WORKSPACE_PATH, 'template.typ')
const FONTS_PATH = path.join(WORKSPACE_PATH, 'fonts')

console.log('🔄 Generating PDFs for all languages...\n')

/**
 * Builds one PDF per locale: Markdown -> structured data -> Typst template -> PDF
 * @returns {void}
 */
function generateAllPdfs() {
    const compiler = NodeCompiler.create({
        workspace: WORKSPACE_PATH,
        fontArgs: [{ fontPaths: [FONTS_PATH] }],
    })
    let hasError = false

    for (const locale of LOCALES) {
        const inputPath = path.resolve('data', `resume-${locale}.md`)
        const outputPath = path.resolve('assets', `resume-${locale}.pdf`)

        console.log(`📄 Generating ${locale.toUpperCase()} PDF...`)

        try {
            const resume = parseResume(fs.readFileSync(inputPath, 'utf8'), locale)
            const pdf = compiler.pdf({
                mainFilePath: TEMPLATE_PATH,
                inputs: { data: JSON.stringify(resume) },
            })

            fs.writeFileSync(outputPath, pdf)
            console.log(`   ✅ Created: assets/resume-${locale}.pdf`)
        } catch (error) {
            console.error(`   ❌ Error generating ${locale} PDF:`, error.message ?? error)
            hasError = true
        }
    }

    console.log('')

    if (hasError) {
        console.log('⚠️  Some PDFs failed to generate. Check errors above.')
        process.exit(1)
    } else {
        console.log('✅ All PDFs generated successfully!')
    }
}

generateAllPdfs()
