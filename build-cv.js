import { mdToPdf } from 'md-to-pdf'
import path from 'path'

const inputPath = path.resolve('data', 'resume.md')
const outputPath = path.resolve('assets', 'resume.pdf')

console.log('🔄 Generating updated PDF from Markdown...')

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

mdToPdf({ path: inputPath }, { dest: outputPath, ...options })
    .then(() => {
        console.log('✅ PDF generated successfully at: /assets/resume.pdf')
    })
    .catch((error) => {
        console.error('❌ Error generating PDF:', error)
    })
