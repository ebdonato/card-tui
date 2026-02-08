import { mdToPdf } from 'md-to-pdf'
import path from 'path'

const LOCALES = ['en', 'pt', 'es']

const options = {
    stylesheet: [path.resolve('assets', 'resume.css')],
    pdf_options: {
        format: 'A4',
        margin: '20mm',
        printBackground: true,
    },
    marked_options: {
        headerIds: false,
        mangle: false,
    },
    launch_options: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
}

console.log('🔄 Generating PDFs for all languages...\n')

async function generateAllPdfs() {
    let hasError = false

    for (const locale of LOCALES) {
        const inputPath = path.resolve('data', `resume-${locale}.md`)
        const outputPath = path.resolve('assets', `resume-${locale}.pdf`)

        console.log(`📄 Generating ${locale.toUpperCase()} PDF...`)

        try {
            await mdToPdf({ path: inputPath }, { dest: outputPath, ...options })
            console.log(`   ✅ Created: assets/resume-${locale}.pdf`)
        } catch (error) {
            console.error(`   ❌ Error generating ${locale} PDF:`, error.message)
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
