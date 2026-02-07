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

// --- Configuração de Caminhos ---
// Necessário para ES Modules encontrarem os arquivos locais corretamente
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '..')

const RESUME_PATH = path.join(rootDir, 'data', 'resume.md')
const PDF_PATH = path.join(rootDir, 'assets', 'resume.pdf')

// --- Dados Pessoais (Cabeçalho) ---
const data = {
    name: chalk.bold.green('Eduardo Batista Donato'),
    handle: chalk.white('@ebdonato'),
    work: chalk.white('Full Stack Developer | Software Engineer at Dock'),
    twitter: chalk.cyan('https://twitter.com/ebdonato'),
    github: chalk.cyan('https://github.com/ebdonato'),
    linkedin: chalk.cyan('https://linkedin.com/in/ebdonato'),
    web: chalk.cyan('https://dev.page/ebdonato'),
    npx: chalk.red('npx ebdonato'),
    labelWork: chalk.white.bold('       Work:'),
    labelTwitter: chalk.white.bold('    Twitter:'),
    labelGitHub: chalk.white.bold('     GitHub:'),
    labelLinkedIn: chalk.white.bold('   LinkedIn:'),
    labelWeb: chalk.white.bold('        Web:'),
    labelCard: chalk.white.bold('       Card:'),
    bio: chalk.italic.gray(
        `I am an electrical and planning engineer.\nI am currently a full stack developer (Vue.js e Node.js)\nand Microsoft Power Platform developer.`,
    ),
}

// --- Funções de UI ---

/**
 * Mostra o cabeçalho principal (Box)
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
        `${data.labelCard}  ${data.npx}`,
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
 * Exibe o QR Code para acesso mobile
 */
function showQRCode() {
    console.clear()
    console.log(chalk.bold.green('\n📱 QR Code - Acesso Mobile\n'))
    console.log(chalk.dim('Escaneie para acessar: https://dev.page/ebdonato\n'))
    qrcode.generate('https://dev.page/ebdonato', { small: true })
    console.log('')
}

/**
 * Renderiza o CV (Markdown) diretamente no terminal
 */
function showResume() {
    console.clear()

    // Configura o marked para usar cores e estilos de terminal
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

        console.log(chalk.dim('\n--- Fim do Currículo ---\n'))
    } catch (err) {
        console.log(chalk.red('Erro ao ler o currículo. O arquivo resume.md existe?'))
    }
}

/**
 * Simula o download do PDF copiando para o diretório atual do usuário
 */
function downloadResume() {
    const filename = 'Eduardo_Donato_CV.pdf'
    const destPath = path.join(process.cwd(), filename)

    try {
        fs.copyFileSync(PDF_PATH, destPath)
        console.log(chalk.green(`\n✅ Sucesso! O CV foi salvo em: ${destPath}\n`))
    } catch (err) {
        console.log(
            chalk.red(
                `\n❌ Erro ao salvar o PDF. Verifique se o arquivo foi gerado com 'npm run build'.\n`,
            ),
        )
    }
}

/**
 * Abre o cliente de email padrão
 */
async function sendEmail() {
    const email = 'seuemail@exemplo.com' // Substitua pelo seu email real
    const subject = 'Contato via npx ebdonato'
    await open(`mailto:${email}?subject=${subject}`)
    console.log(chalk.green('\n📧 Abrindo seu cliente de e-mail...\n'))
}

// --- Menu Principal ---

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
                message: 'Selecione:',
                prefix: chalk.green('?'),
                choices: [
                    { name: '📄 Ver meu CV (Terminal)', value: actions.VIEW_CV },
                    { name: '💾 Download meu CV (PDF)', value: actions.DOWNLOAD_CV },
                    { name: '📱 Mostrar QR Code', value: actions.SHOW_QR },
                    { name: '📧 Enviar um e-mail', value: actions.EMAIL },
                    { name: '🚪 Sair', value: actions.EXIT },
                ],
            },
        ])
        .then(async (answer) => {
            switch (answer.action) {
                case actions.VIEW_CV:
                    showResume()
                    // Pequena pausa antes de voltar ao menu ou sair
                    inquirer
                        .prompt([
                            {
                                type: 'confirm',
                                name: 'back',
                                message: 'Voltar ao menu?',
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
                    // Mantém o processo vivo brevemente
                    setTimeout(() => process.exit(0), 1000)
                    break

                case actions.SHOW_QR:
                    showQRCode()
                    inquirer
                        .prompt([
                            {
                                type: 'confirm',
                                name: 'back',
                                message: 'Voltar ao menu?',
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
                    console.log(chalk.cyan('Obrigado pela visita! 👋'))
                    process.exit(0)
                    break
            }
        })
}

// Inicia a aplicação
main()
