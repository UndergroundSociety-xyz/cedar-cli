import fs from 'fs'
import pkg from '../package.json'
import {Resource} from "./types/resource"
import {AdjacencyMatrix} from "./types/adjacency-matrix"
import {
    getDna,
    pickRandomIndex
} from "./utils/helpers"
import path from "path"
import {INamingStrategy, NamingContext} from "./utils/naming"
import {Step} from "./types/step"
import {SharpImage} from './types/sharp-image'
import sharp, {FormatEnum} from "sharp"
import {File, Metadata, Properties} from "./types/metadata"
import {NamingStrategiesRegistry} from "./utils/naming-strategies-registry"
import {program} from "commander"
import {Logger} from "winston"
import {initLogger, initProgressBar} from "./utils/logger"
import chalk from "chalk";
import figlet from "figlet";
import clear from "clear";
import {DescriptionStrategiesRegistry} from "./utils/description-strategies-registry";
import {DescriptionContext, IDescriptionStrategy} from "./utils/description";

program
    .name(chalk.green(figlet.textSync('Cedar', "Small Keyboard")))
    .description(pkg.description)
    .version(pkg.version)
    .option('-q, --quiet', 'Quiet mode: no console output', false)
    .option('-m, --metadata', 'No images, metadata cache files only', false)
    .option('-c, --config <value>', 'Uses a custom config file', './config.json')
// .option('-f, --file', 'generate images from cache file', false)
// todo : get config from cache

program.parse()

const isQuietModeEnabled = program.opts().quiet
const isMetadataOnlyEnabled = program.opts().metadata
const useCustomConfig = program.opts().config

clear()
if (!isQuietModeEnabled) {
    console.log(chalk.green(figlet.textSync('Cedar', "Small Keyboard")))
    console.log(`Cedar CLI`)
    console.log(`v${pkg.version}`)
}

const logger: Logger = initLogger(isQuietModeEnabled)
logger.info('🚀 Starting Cedar...')

const config = JSON.parse(fs.readFileSync(useCustomConfig, {encoding: 'utf-8'}))
logger.info(`🗄 successfully loaded config from path ${useCustomConfig}`)

const options = config.options
const steps: Step[] = config.steps as Step[]
const resources: Resource[] = config.resources.map((r: any, index: number) => {
    const res = new Resource()
    res.idx = index
    res.name = r.name
    res.step = r.step
    res.restrictions = r.restrictions ?? []
    res.outcomes = r.outcomes ?? []
    if (r.uri) res.uri = r.uri
    if (r.attribute) res.attribute = r.attribute

    return res
})
logger.info(`${resources.length} resources found and successfully initialized`)

if (!fs.existsSync('.cache'))
    fs.mkdirSync('.cache')

fs.writeFileSync('.cache/config.json', JSON.stringify(config,null,2))
logger.info('🗄 .cache folder init')


const matrix = new AdjacencyMatrix(resources.length)

// setup the matrix
resources.forEach(start => {
    resources.forEach(destination => {
        if (start.outcomes.length) {
            const outcome = start.outcomes.find(outcome => outcome.step === destination.step && outcome.name === destination.name)
            if (outcome) {
                matrix.addEdge(start.idx, destination.idx, outcome.chance)
                logger.info(`added edge from ${start.step}:${start.name} to ${destination.step}:${destination.name} with a ${outcome?.chance / 100}% chance`)
            }
        }
    })
})

fs.writeFileSync(".cache/matrix.json", JSON.stringify(matrix))
logger.info(`🗄 matrix saved at .cache/matrix.json`)

const header = `,${resources.map(r => `${r.step}:${r.name}`).join(',')}`
const rows = [...matrix.vertex].map((v, i) => `${resources[i].step}:${resources[i].name},` + v.join(',')).join('\n')
const csv = `${header}\n${rows}`
fs.writeFileSync(".cache/matrix.csv", csv)

/**
 * Builds one list of resources by traversing the matrix
 * This is DFS inspired
 */
export const buildResourcesList = (matrix: AdjacencyMatrix, steps: Step[], resources: Resource[], config: any): Resource[] => {
    const results: Set<Resource> = new Set()
    const visited: boolean[] = []
    const rootChances = config.rootOutcomes.map((r: any) => Number(r.chance))
    const firstResourceIndex = pickRandomIndex(rootChances) as number
    const firstResource = config.rootOutcomes[firstResourceIndex]
    const start = resources.findIndex(r => r.step === firstResource.step && r.name === firstResource.name)

    const stack = [start]
    visited[start] = true
    let current

    while (stack.length) {
        current = stack.pop() as number
        const currentResource = resources[current]
        results.add(currentResource)

        let next = pickRandomIndex(matrix.vertex[current])

        if (next && resources[next].restrictions.length) {

            const nextStack = [next]
            const nextVisited: boolean[] = []
            nextVisited[next] = true
            let currentNext: number | undefined = next

            let subCount = 0
            while (nextStack.length) {
                subCount++
                if (subCount === 10000) {
                    const error = {
                        currentResource: currentResource,
                        currentResourceList: [...results].map(r => `${r.step.toUpperCase()} - ${r.name}`)
                    }
                    fs.writeFileSync('.cache/error.json', JSON.stringify(error,null,2))
                    throw new Error('infinite loop, find error details in .cache/error.json')
                }

                currentNext = nextStack.pop() as number

                // if one of results is found in the next one's restrictions, then pick a new next resource and push it to the stack if it exists.
                // If it is undefined, it cannot have any restriction, so we can use it.
                if (resources[currentNext].restrictions.length
                    && resources[currentNext].restrictions.some(rn => [...results].some(res => res.name === rn.name && res.step === rn.step))) {

                    const newNext = pickRandomIndex(matrix.vertex[current])

                    if (newNext) {
                        nextStack.push(newNext)
                        nextVisited[currentNext] = true
                    } else {
                        currentNext = newNext
                    }
                }

                // if every outcome of the current resource has been visited, exit
                if (matrix.vertex[current].every((chance, idx) => nextVisited[idx])) {
                    logger.error(`no possible outcome for ${currentResource.step}:${currentResource.name}`)

                    process.exit()
                }
            }

            next = currentNext
        }

        if (next !== undefined && !visited[next]) {
            visited[next] = true
            stack.push(next)
        }
    }

    return [...results]
}

/**
 * Builds as many Resources lists as required by the supply
 */
export const buildResourcesLists = (matrix: AdjacencyMatrix, resources: Resource[], steps: Step[], config: any): Resource[][] => {
    const items: Resource[][] = []
    const dnas: string[] = []

    const progressBar = initProgressBar(`building resources lists |{bar}| {percentage}% || {value}/{total} || {duration_formatted} elapsed || ETA {eta_formatted}`)

    if (!isQuietModeEnabled) {
        progressBar.start(config.options.supply, 0)
    }

    for (let i = 0; i < config.options.supply;) {
        const rl = buildResourcesList(matrix, steps, resources, config)

        const sorting = steps.map(s => s.name)
        rl.sort((a, b) => sorting.indexOf(a.step) - sorting.indexOf(b.step))

        const dna = getDna(rl)
        // bypassing unicity constraint if uniqueEditions is set to false
        const isUnique = config.options.uniqueEditions ? !dnas.includes(dna) : true

        if (isUnique) {
            items.push(rl)
            dnas.push(dna)
            rl.forEach(r => r.count++ && (r.supplyPct = (r.count / config.options.supply) * 100))
            i++

            !isQuietModeEnabled && progressBar.increment()
        }
    }
    !isQuietModeEnabled && progressBar?.stop()

    return items
}

logger.info(`🌲 starting to build resources lists...`)
const resourcesLists = buildResourcesLists(matrix, resources, steps, config)

if (resourcesLists.length === options.supply) {
    logger.info(`🎉 successfully built ${resourcesLists.length} resources lists !`)
} else {
    const err = `${resourcesLists.length}/${options.supply} resources lists built`
    logger.error(err)
    process.exit()
}

fs.writeFileSync(".cache/stats.json", JSON.stringify(resources.map(r => ({
    step: r.step,
    name: r.name,
    supplyPct: r.supplyPct,
    quantity: r.count
}))))
logger.info('🗄 stats saved at .cache/stats.json')
fs.writeFileSync(
    ".cache/resources-lists.json",
    JSON.stringify(
        resourcesLists.map(
            (rl, i) => ({
                index: i,
                resources: rl.map(r => `${r.step.toUpperCase()} - ${r.name}`)
            })
        ),null,2
    )
)
logger.info('🗄 resources lists saved at .cache/resources-list.json')

/**
 * Generates a metadata json file from resources having an attribute
 * @param resources
 * @param config
 * @param edition
 * @param outputUri
 * @param namingContext
 * @param descriptionContext
 */
export const generateMetadataFile = async (resources: Resource[],
                                           config: any,
                                           edition: number,
                                           outputUri: string,
                                           namingContext: NamingContext,
                                           descriptionContext: DescriptionContext) => {
    const filename = `${edition}.json`
    let name = await namingContext.execute(config, resources, edition)
    let description = await descriptionContext.execute(config, resources, edition, name)

    const filepath = path.join('assets', `${edition}.${config.options.outputFormat ?? 'png'}`)

    const attributes = resources
        .filter(resource => !!resource.attribute)
        .map(resource => resource.attribute)

    const files = new File(filepath, `image/${config.options.outputFormat ?? 'png'}`)
    const properties = new Properties(config.metadata.creators, [files])

    const metadata = new Metadata(
        name,
        config.metadata.symbol,
        description,
        config.metadata.sellerFeesBasisPoints,
        filepath,
        attributes as { trait_type: string, value: string }[],
        properties,
        config.metadata.collection
    )

    fs.writeFileSync(path.join(outputUri, filename), JSON.stringify(metadata))
}

/**
 * Generates an image from a resource's uri
 * @param resources
 * @param steps
 * @param edition
 * @param outputUri
 * @param format
 */
export const generateImage = async (resources: Resource[], steps: Step[], edition: number, outputUri: string, format: string = 'png') => {
    const [base, ...compose] = resources
        .filter(r => r.uri)
        .map(r => {
            const image: SharpImage = {input: r.uri as string}
            const step = steps.find(s => r.step === s.name)
            if (step?.blend !== 'normal') {
                image.blend = step?.blend
            }

            return image
        })

    const filename = `${edition}.${format}`
    const filepath = path.join(outputUri, filename)

    await sharp(base.input)
        .composite(compose)
        .toFormat(format as keyof FormatEnum)
        .toFile(filepath)
}

/**
 * Generates a supply of NFT images and metadata
 * @param resourcesLists
 * @param config
 * @param outputUri
 * @param namingContext
 * @param descriptionContext
 * @param quietMode
 */
export const generateNfts = async (resourcesLists: Resource[][],
                                   config: any,
                                   outputUri: string,
                                   namingContext: NamingContext,
                                   descriptionContext: DescriptionContext,
                                   quietMode = false) => {
    let progressBar

    if (!quietMode) {
        progressBar = initProgressBar(`building NFTs |{bar}| {percentage}% || {value}/{total} || {duration_formatted} elapsed || ETA {eta_formatted}`)
        progressBar.start(config.options.supply, 0)
    }
    // todo : ability to pause / restart on an arbitrary edition
    for (let i = 1; i <= resourcesLists.length; i++) {
        await generateImage(resourcesLists[i - 1], config.steps, i, outputUri, config.options.outputFormat)
        await generateMetadataFile(resourcesLists[i - 1], config, i, outputUri, namingContext, descriptionContext)
        !quietMode && progressBar?.increment()
    }

    !quietMode && progressBar?.stop()
}

const outputUri = 'output'

const namingStrategy = NamingStrategiesRegistry.get(config.options.namingStrategy) ?? {} as INamingStrategy
const descriptionStrategy = DescriptionStrategiesRegistry.get(config.options.descriptionStrategy) ?? {} as IDescriptionStrategy
const namingContext = new NamingContext(namingStrategy)
logger.info('🗄 naming context initialized')
const descriptionContext = new DescriptionContext(descriptionStrategy)
logger.info('🗄 description context initialized')

if (fs.existsSync(outputUri)) fs.rmSync(outputUri, {recursive: true})
fs.mkdirSync(outputUri)

logger.info('🗄 output folder initialized')

try {
    !isMetadataOnlyEnabled && generateNfts(resourcesLists, config, outputUri, namingContext, descriptionContext, isQuietModeEnabled)
        .then(_ => logger.info(' 🎉 Done generating images and metadata'))
} catch (e) {
    logger.error((e as Error).message)
}
