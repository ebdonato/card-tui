import { mdToPdf } from 'md-to-pdf'
import path from 'path'

const inputPath = path.resolve('data', 'resume.md')
const outputPath = path.resolve('assets', 'resume.pdf')

console.log('🔄 Generating updated PDF from Markdown...')

mdToPdf({ path: inputPath }, { dest: outputPath })
    .then(() => {
        console.log('✅ PDF generated successfully at: /assets/resume.pdf')
    })
    .catch((error) => {
        console.error('❌ Error generating PDF:', error)
    })
