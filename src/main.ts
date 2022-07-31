import fs from 'fs'
import config from '../config.json'
import {Resource} from "./types/resource"
import {AdjacencyMatrix} from "./types/adjacency-matrix"
import {checkConditions, getDna, parseConditions, pickRandomIndex} from "./utils/helpers"
import path from "path";
import {INamingStrategy, NamingContext} from "./utils/naming";
import {Step} from "./types/step";
import {SharpImage} from './types/sharp-image'
import sharp, {FormatEnum} from "sharp";
import {Metadata, Properties, File} from "./types/metadata";
import {NamingStrategiesRegistry} from "./utils/naming-strategies-registry";
// import {initConsoleLogger, initFileLogger, initProgressBar} from "./src/utils/logger";

// import {program} from "commander"
// todo : un-comment when bun supports child_process
// program
//     .name('Cedar CLI')
//     .description('Solana NFT conditional generator')
//     .version('1.0.0')
//     .option('-q, --quiet', 'Quiet mode: no console output')
//     .option('-c, --cache', 'generate images from cache file')
//
// program.parse()
//
// console.log(program.opts())

// // todo : do not use consoleLogger if --quiet is enabled
// const fileLogger = initFileLogger()
// const consoleLogger = initConsoleLogger()
//
const startMsg = 'Starting Cedar...'
console.log(`[${new Date().toISOString()}]:[INFO]:`, startMsg)
// consoleLogger.info(startMsg)
// fileLogger.info(startMsg)

const options = config.options
const steps = config.steps as Step[]
const resources = config.resources.map((r: any) => {
    const res = new Resource()
    res.name = r.name
    res.step = r.step
    res.conditions = r.conditions ?? []
    if (r.uri) res.uri = r.uri
    if (r.attribute) res.uri = r.uri
    if (r.rarity) res.rarity = r.rarity

    return res
})

if (!fs.existsSync('.cache'))
    fs.mkdirSync('.cache')

const cacheMsg = '.cache folder init'
console.log(`[${new Date().toISOString()}]:[INFO]:`, cacheMsg)
// consoleLogger.info(cacheMsg)
// fileLogger.info(cacheMsg)

for (let i = 0; i < resources.length; i++) {
    resources[i].idx = i
}

const resInitMsg = `${resources.length} resources found and successfully initialized`
console.log(`[${new Date().toISOString()}]:[SUCCESS]:`, resInitMsg)
// consoleLogger.info(resInitMsg)
// fileLogger.info(resInitMsg)

const matrix = new AdjacencyMatrix(resources.length)

// setup the matrix
resources.forEach(start => {
    resources.forEach(destination => {
        if (start.step !== destination.step) {
            /**
             * If there are some resources with conditions we use the following business logic:
             * if the starting vertex has no conditions itself, it can only lead to a destination that has a condition
             * corresponding to it. In other words, say  the start is a "blue background" without a condition,
             * and in the resources list, there is one having "bg:blue" in its conditions list,
             * it means that the blue bg can only have one edge with this destination.
             * If the starting vertex has conditions, we only add edges to destinations that don't have conditions themselves,
             * and whose step don't match with the starting point step.
             */
            if (resources.some(r => r.conditions.length)) {
                let add
                if (!start.conditions.length) {
                    add = parseConditions(destination.conditions)
                        .some(con => con.step === start.step && con.resource === start.name)
                } else {
                    add = !destination.conditions.length && !parseConditions(start.conditions)
                        .some(con => destination.step === con.step)
                }

                if (add) {
                    matrix.addEdge(start.idx, destination.idx, destination.rarity ?? 10000)
                    const msg = `added edge from ${start.step}:${start.name} to ${destination.step}:${destination.name} with rarity ${destination.rarity}`
                    console.log(`[${new Date().toISOString()}]:[INFO]:`, msg)
                    // consoleLogger.info(msg)
                    // fileLogger.info(msg)
                }
            } else {
                matrix.addEdge(start.idx, destination.idx, destination.rarity ?? 10000)
                const msg = `added edge from ${start.step}:${start.name} to ${destination.step}:${destination.name} with rarity ${destination.rarity}`
                console.log(`[${new Date().toISOString()}]:[INFO]:`, msg)
                // consoleLogger.info(msg)
                // fileLogger.info(msg)
            }
        }
    })
})

// await Bun.write(".cache/matrix.json", JSON.stringify(matrix))
fs.writeFileSync(".cache/matrix.json", JSON.stringify(matrix))
const matrixMsg = `matrix saved at .cache/matrix.json`
console.log(`[${new Date().toISOString()}]:[SUCCESS]:`, matrixMsg)
// consoleLogger.info(matrixMsg)
// fileLogger.info(matrixMsg)

/**
 * Builds one list of resources by traversing the matrix
 * This is DFS inspired
 */
export const buildResourcesList = (matrix: AdjacencyMatrix, resources: Resource[]): Resource[] => {
    const results = []
    const visited = []
    const steps: string[] = []
    const start = pickRandomIndex(resources.filter(r => !r.conditions.length).map(r => r.rarity))
    const stack = [start]
    visited[start] = true
    let current

    while (stack.length) {
        current = stack.pop()
        results.push(current)
        steps.push(resources[current].step)
        const next = pickRandomIndex(matrix.vertex[current])

        if (next !== undefined && !visited[next] && !steps.includes(resources[next].step)) {
            visited[next] = true
            stack.push(next)
        }
    }

    return results.map(r => resources[r])
}

/**
 * Builds as many Resources lists as required by the supply
 */
export const buildResourcesLists = (matrix: AdjacencyMatrix, resources: Resource[], steps: Step[], options: any): Resource[][] => {
    const items = []
    const dnas = []
    // todo : un-comment when bun supports it
    // const progressBar = initProgressBar(`building resources lists |{bar}| {percentage}% || {value}/{total} || {duration_formatted} elapsed || ETA {eta_formatted} \n`)
    // progressBar.start(supply, 0)

    for (let i = 0; i < options.supply;) {
        const rl = buildResourcesList(matrix, resources)

        const sorting = steps.map(s => s.name)
        rl.sort((a, b) => sorting.indexOf(a.step) - sorting.indexOf(b.step))

        const isValid = rl.every(r => checkConditions(resources, r))
        const dna = getDna(rl)
        // bypassing unicity constraint if uniqueEditions is set to false
        const isUnique = options.uniqueEditions ? !dnas.includes(dna) : true

        if (isUnique && isValid) {
            items.push(rl)
            rl.forEach(r => r.count++ && (r.supplyPct = (r.count / options.supply) * 100))
            i++
            // progressBar.increment()
            console.log(`[${new Date().toISOString()}]:[INFO]:`, `added ${dna}`)
        } else {
            let word
            if (isUnique && !isValid) word = 'not valid'
            if (!isUnique && isValid) word = 'not unique'
            if (!isUnique && !isValid) word = 'not unique nor valid'
            console.log(`[${new Date().toISOString()}]:[WARN]:`, `dna "${dna}" is ${word}, skipping`)
        }
    }
    // progressBar.stop()

    return items
}

const buildMsg = `starting to build resources lists...`
console.log(`[${new Date().toISOString()}]:[INFO]:`, buildMsg)
// consoleLogger.info(buildMsg)
// fileLogger.info(buildMsg)
// todo : run on the condition that --cache is disabled
const resourcesLists = buildResourcesLists(matrix, resources, steps, options.supply)

const buildSuccessMsg = `successfully built ${resourcesLists.length} resources lists !`
console.log(`[${new Date().toISOString()}]:[SUCCESS]:`, buildSuccessMsg)
// consoleLogger.info(buildSuccessMsg)
// fileLogger.info(buildSuccessMsg)

// await Bun.write(".cache/stats.json", JSON.stringify(resources))
// await Bun.write(".cache/resources-lists.json", JSON.stringify(resourcesLists))
fs.writeFileSync(".cache/stats.json", JSON.stringify(resources))
fs.writeFileSync(".cache/resources-lists.json", JSON.stringify(resourcesLists))


export const generateMetadataFile = async (resources: Resource[], config: any, edition: number, outputUri: string, namingContext: NamingContext) => {
    const filename = `${edition}.json`
    let name = namingContext.execute(config, resources, edition)

    const filepath = path.join(outputUri, `${edition}.${config.options.outputFormat ?? 'png'}`)

    const attributes = resources
        .filter(resource => resource.attribute)
        .map(resource => resource.attribute)

    const files = new File(filepath, `image/${config.options.outputFormat ?? 'png'}`)
    const properties = new Properties(config.metadata.creators, [files])

    const metadata = new Metadata(
        name,
        config.metadata.symbol,
        config.metadata.description,
        config.metadata.sellerFeesBasisPoint,
        filepath,
        attributes,
        properties,
        config.metadata.collection
    )

    // await Bun.write(path.join(outputUri, filename), JSON.stringify(metadata))
    fs.writeFileSync(path.join(outputUri, filename), JSON.stringify(metadata))
}

export const generateImage = async (resources: Resource[], steps: Step[], edition: number, outputUri: string, format: string = 'png') => {
    if (!resources[0].uri) {
        throw new Error("First step resource must have a uri")
    }

    const compose: SharpImage[] = resources
        .filter(r => r.uri)
        .map(r => {
            const image: SharpImage = {input: r.uri as string}
            const step = steps.find(s => r.step === s.name)
            if (step?.blend !== 'normal') {
                image.blend = step.blend
            }

            return image
        }).slice(1)

    const filename = `${edition}.${format}`
    const filepath = path.join(outputUri, filename)

    await sharp(resources[0].uri).composite(compose).toFormat(format as keyof FormatEnum).toFile(filepath)
}

export const generateNfts = async (resourcesLists: Resource[][], config: any, outputUri: string, namingContext: NamingContext) => {

    // todo : ability to pause / restart on an arbitrary edition
    for (let i = 1; i <= resourcesLists.length; i++) {
        console.log(`[${new Date().toISOString()}]:[INFO]:`, `generating edition #${i}`)
        await generateImage(resourcesLists[i - 1], config.steps, i, outputUri, config.options.outputFormat)
        await generateMetadataFile(resourcesLists[i - 1], config, i, outputUri, namingContext)
    }
}

const outputUri = 'output'
const namingStrategy = NamingStrategiesRegistry.get(config.options.namingStrategy) ?? {} as INamingStrategy
const namingContext = new NamingContext(namingStrategy)

if (!fs.existsSync(outputUri))
    fs.mkdirSync(outputUri)

const outputMsg = 'output folder init'
console.log(`[${new Date().toISOString()}]:[INFO]:`, outputMsg)
// consoleLogger.info(outputMsg)
// fileLogger.info(outputMsg)

// generateNfts(resourcesLists, config, outputUri, namingContext).then(
//     _ => console.log(`[${new Date().toISOString()}]:[SUCCESS]:`, 'done generating images and metadata')
// )