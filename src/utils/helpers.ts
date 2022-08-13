import {Resource} from '../types/resource'
import inquirer, {Answers, Question} from "inquirer";
import randomWords from 'random-words'


/**
 * Picks a random index in a list of rarities
 * @param chances
 */
export const pickRandomIndex = (chances: number[] = []): number | undefined => {
    if (chances.every(c => c === 0)) {
        return undefined
    }
    const chancesClone = [...chances]
    const weights: number[] = []
    let sum = chances.reduce((acc, chance) => acc + chance, 0)
    let i

    // early return if only one possibility that is required
    if ((chancesClone.filter(r => r > 0).length === 1))
        return chances.findIndex(r => r > 0)

    if (sum < 9999)
        chancesClone.push(10000 - sum)

    for (i = 0; i < chancesClone.length; i++)
        weights[i] = (chancesClone[i] / sum) + (weights[i - 1] ?? 0)

    const randomIndex = Math.random() * weights[weights.length - 1]

    for (i = 0; i < weights.length; i++)
        if (weights[i] > randomIndex)
            break

    return i >= chances.length ? undefined : i
}

/**
 * Returns a concatenation of a resources list's steps and resources like "step1:resource-step2:resource"
 * This is helpful to check a list's unicity
 * @param resources
 */
export const getDna = (resources: Resource[]) => {
    return resources.reduce((a, v) => {
        return a.concat('-', v.step, ':', v.name)
    }, '').slice(1)
}

export const getOptions = async (): Promise<any> => {
    const questions: Question[] = [
        {
            type: 'number',
            name: 'supply',
            default: 10000,
            message: 'How many NFTs would you like?'
        },
        {
            type: 'confirm',
            name: 'useNamingStrategy',
            default: false,
            message: 'Would you like to use a specific naming strategy?',
        },
        {
            type: 'string',
            name: 'namingStrategy',
            message: 'What naming strategy would you like to use?',
            default: 'default',
            when: answers => answers['useNamingStrategy']
        },
        {
            type: 'confirm',
            name: 'uniqueEditions',
            default: true,
            message: 'Would you like your NFTs to be unique?'
        },
    ]

    return inquirer.prompt(questions)
}

export const getMetadata = async (): Promise<any> => {

    let answers: Answers[] = []
    const questions: Question[] = [
        {
            type: 'input',
            name: 'name',
            default: randomWords({exactly: 2}).join(' '),
            message: 'What will be the name of your NFTs?'
        },
        {
            type: 'input',
            name: 'description',
            default: randomWords({exactly: 12}).join(' '),
            message: 'What should be in the "description" field?'
        },
        {
            type: 'input',
            name: 'symbol',
            default: randomWords({exactly: 3}).map(w => w.slice(0, 1)).join('').toUpperCase(),
            message: 'What is the symbol associated to your NFTs?'
        },
        {
            type: 'input',
            name: 'collectionFamily',
            default: randomWords({exactly: 2}).join(' '),
            message: 'What is the collection family?'
        },
        {
            type: 'input',
            name: 'collectionName',
            default: randomWords({exactly: 2}).join(' '),
            message: 'What is the collection name?'
        },
        {
            type: 'number',
            name: 'sellerFees',
            default: 500,
            message: 'How much seller fees basis points? (royalties, on 10k)'
        },
        {
            type: 'number',
            name: 'numberOfCreators',
            default: 1,
            message: 'How many creators are there?'
        },
    ]

    return inquirer.prompt(questions)
        .then(res => {
            answers.push(res)
            return res
        })
        .then(res => inquirer.prompt(getCreatorQuestions(res['numberOfCreators'])))
        .then(res => {
            answers.push(res)
            return answers
        })

}

const getCreatorQuestions = (quantity: number) => {
    const creatorsQuestions = []

    for (let i = 0; i < quantity; i++) {
        creatorsQuestions.push(
            {
                type: 'input',
                name: `address${i}`,
                default: 'jBoynzaX9d3VsnXrwL97JCJW6StmvhBv4e6oPP3puR7',
                message: `Enter a valid Solana address for creator n°${i + 1}`
            }
        )

        creatorsQuestions.push(
            {
                type: 'number',
                name: `share${i}`,
                default: 100,
                message: `What is the share percentage of creator n°${i + 1}?`
            },
        )
    }

    return creatorsQuestions
}

export const getResource = async () => {
    const questions = [
        {
            type: 'input',
            name: 'name',
            default: randomWords({exactly: 1}).join('-'),
            message: 'What is the name of the resource?'
        },
        {
            type: 'input',
            name: 'step',
            default: randomWords({exactly: 1}).join(''),
            message: 'What step does it belong to?'
        },
        {
            type: 'confirm',
            name: 'hasUri',
            default: true,
            message: 'Does it have an uri to an asset?'
        },
        {
            type: 'input',
            name: 'uri',
            default: randomWords({exactly: 3}).join('/'),
            message: 'Enter the path to the asset',
            when: (answers: Answers) => answers['hasUri']
        },
        {
            type: 'confirm',
            name: 'hasAttribute',
            default: true,
            message: 'Does it have an attribute?'
        },
        {
            type: 'input',
            name: 'attributeTrait',
            default: randomWords({exactly: 1}).join(''),
            message: 'Enter the attribute trait_type',
            when: (answers: Answers) => answers['hasAttribute']
        },
        {
            type: 'input',
            name: 'attributeValue',
            default: randomWords({exactly: 1}).join(''),
            message: 'Enter the attribute value',
            when: (answers: Answers) => answers['hasAttribute']
        },
    ]

    return inquirer.prompt(questions)
}

export const getStep = async () => {
    const questions = [
        {
            type: 'input',
            name: 'name',
            default: randomWords({exactly: 1}).join(''),
            message: 'What is the name of the step?'
        },
        {
            type: 'confirm',
            name: 'hasBlend',
            default: true,
            message: 'Should it have a blend mode?'
        },
        {
            type: 'input',
            name: 'blend',
            default: 'normal',
            message: 'Enter the blend mode',
            when: (answers: Answers) => answers['hasBlend']
        },
    ]

    return inquirer.prompt(questions)
}

export const getRestriction = () => {
    const questions = [
        {
            type: 'input',
            name: 'name',
            default: randomWords({exactly: 1}).join(''),
            message: 'What is the name of the resource you want to restrict?'
        },
        {
            type: 'input',
            name: 'step',
            default: randomWords({exactly: 1}).join(''),
            message: 'What step?'
        },
    ]

    return inquirer.prompt(questions)
}

export const getOutcome = () => {
    const questions = [
        {
            type: 'input',
            name: 'name',
            default: randomWords({exactly: 1}).join(''),
            message: 'What is the name of the resource you want as outcome?'
        },
        {
            type: 'input',
            name: 'step',
            default: randomWords({exactly: 1}).join(''),
            message: 'What step does it belong to?'
        },
        {
            type: 'number',
            name: 'chance',
            default: 10000,
            message: 'What chance on 10000 does it have to pop?'
        },
    ]

    return inquirer.prompt(questions)
}


export const getContinue = () => {
    return inquirer.prompt([{
        name: 'key',
        type: 'press-to-continue',
        anyKey: true,
        pressToContinueMessage: 'Press a key to continue...',
    }])
}

export const getConfigFromAnswers = (metadataAnswers: Answers,
                                     creatorsAnswers: Answers,
                                     optionsAnswers: Answers,
                                     stepAnswers: Answers[],
                                     resourceAnswers: Answers[],
                                     rootAnswers: Answers[]): any => {

    const creators = []
    for (let i = 0; i < metadataAnswers.numberOfCreators; i++) {
        creators.push({
            address: creatorsAnswers[`address${i}`],
            share: creatorsAnswers[`share${i}`]
        })
    }

    const metadata = {
        name: metadataAnswers.name,
        description: metadataAnswers.description,
        symbol: metadataAnswers.symbol,
        collection: {
            name: metadataAnswers.collectionName,
            family: metadataAnswers.collectionFamily
        },
        sellerFeesBasisPoints: metadataAnswers.sellerFees,
        creators: creators
    }

    const options = {
        supply: optionsAnswers.supply,
        namingStrategy: optionsAnswers.useNamingStrategy ? optionsAnswers.namingStrategy : 'default',
        uniqueEditions: optionsAnswers.uniqueEditions
    }

    const steps = stepAnswers.map(sa => {
        if (sa.hasBlend) {
            return {name: sa.name, blend: sa.blend}
        }

        return {name: sa.name}
    })

    const resources = resourceAnswers.map(ra => {
        const resource: any = {name: ra.name, step: ra.step }

        if (ra.hasUri) resource.uri = ra.uri

        if (ra.hasAttribute) {
            resource.attribute = {}
            resource.attribute.trait_type = ra.attributeTrait
            resource.attribute.value = ra.attributeValue
        }
        if (ra.restrictions.length) {
            resource.restrictions = ra.restrictions.map((rest: any) => ({step: rest.step, name: rest.name}))
        }

        if (ra.outcomes.length) {
            resource.outcomes = ra.outcomes.map((out: any) => ({step: out.step, name: out.name, chance: out.chance}))
        }

        return resource
    })

    const rootOutcomes = rootAnswers.map((out: any) => ({step: out.step, name: out.name, chance: out.chance}))

    return {metadata: metadata, options: options, steps: steps, resources: resources, rootOutcomes: rootOutcomes}
}