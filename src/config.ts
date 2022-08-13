import {
    getConfigFromAnswers,
    getContinue,
    getMetadata,
    getOptions,
    getOutcome,
    getResource, getRestriction,
    getStep
} from "./utils/helpers"
import PressToContinuePrompt from "inquirer-press-to-continue"
import inquirer, {Answers} from "inquirer"
import * as pkg from '../package.json'
import figlet from 'figlet'
import fs from "fs"
import {initLogger} from "./utils/logger"
import clear from "clear"
import chalk from "chalk"

let answers: Answers[] = []
let config: any
const filename = `config-${new Date().toISOString().split('T')[0]}.json`

const logger = initLogger()

inquirer.registerPrompt('press-to-continue', PressToContinuePrompt)

clear()
console.log(chalk.green(figlet.textSync('Cedar', "Small Keyboard")))
console.log('Cedar Config CLI')
console.log(`v${pkg.version}`)

logger.info('🚀 Initializing Config CLI')

const getConfig = async () => {
    clear()
    console.log(chalk.bgBlue.white('💾 - Metadata'))
    answers.push(...await getMetadata())
    await getContinue()
    clear()
    console.log(chalk.bgBlue.white('☑️ - Options'))
    answers.push(await getOptions())
    await getContinue()
    clear()

    let add = true

    console.log(chalk.bgBlue.white('🪜 - Steps'))
    const stepAnswers = []
    while (add) {
        const answer = await inquirer.prompt({name: 'add', type: 'confirm', message: chalk.blue('Add a step ?')})
        add = answer.add
        if (add) {
            stepAnswers.push(await getStep())
        }
    }

    add = true
    console.log(chalk.bgBlue.white('🌲 - Resources'))
    const resourcesAnswers = []
    while (add) {
        const answer = await inquirer.prompt({name: 'add', type: 'confirm', message: chalk.blue('Add a Resource?')})
        add = answer.add

        let resource
        if (add) {
            resource = await getResource()
        }

        let addRestriction = true
        const restrictionsAnswers = []
        while (add && addRestriction) {
            const restrictionAnswer = await inquirer.prompt({
                name: 'add',
                type: 'confirm',
                message: chalk.green('Add a restriction to the current Resource?')
            })
            addRestriction = restrictionAnswer.add

            if (addRestriction) {
                restrictionsAnswers.push(await getRestriction())
            }
        }

        let addOutcome = true
        const outcomeAnswers = []
        while (add && addOutcome) {
            const outcomeAnswer = await inquirer.prompt({
                name: 'add',
                type: 'confirm',
                message: chalk.green('Add an outcome to the current Resource?')
            })
            addOutcome = outcomeAnswer.add

            if (addOutcome) {
                outcomeAnswers.push(await getOutcome())
            }
        }

        if (resource) {
            resource.restrictions = restrictionsAnswers
            resource.outcomes = outcomeAnswers

            resourcesAnswers.push(resource)
        }
    }

    await getContinue()
    clear()

    console.log(chalk.bgBlue.white('🌲 - Root outcomes'))
    add = true
    const rootAnswers = []
    while (add){
        const rootAnswer = await inquirer.prompt({
            name: 'add',
            type: 'confirm',
            message: chalk.blue('Add a root outcome ?')
        })
        add = rootAnswer.add

        if (add) {
            rootAnswers.push(await getOutcome())
        }
    }
    await getContinue()
    clear()

    const [metadataAnswers, creatorsAnswers, optionsAnswers] = answers
    config = getConfigFromAnswers(metadataAnswers, creatorsAnswers, optionsAnswers, stepAnswers, resourcesAnswers, rootAnswers)
    logger.info(`🗄 Writing file to disk under ${filename}`)
    fs.writeFileSync(filename, JSON.stringify(config))
    logger.info('🎉 Done !')
}

setTimeout(getConfig, 1500)