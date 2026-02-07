import { mdToPdf } from 'md-to-pdf'
import path from 'path'

const inputPath = path.resolve('data', 'resume.md')
const outputPath = path.resolve('assets', 'resume.pdf')

console.log('🔄 Gerando PDF atualizado a partir do Markdown...')

mdToPdf({ path: inputPath }, { dest: outputPath })
    .then(() => {
        console.log('✅ PDF gerado com sucesso em: /assets/resume.pdf')
    })
    .catch((error) => {
        console.error('❌ Erro ao gerar PDF:', error)
    })
