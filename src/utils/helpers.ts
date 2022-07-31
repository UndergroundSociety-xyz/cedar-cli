import {Resource} from "../types/resource";

/**
 * Parses resource conditions to a list of items containing the step and the name of the resource
 * @param conditions
 */
export const parseConditions = (conditions: string[]): { step: string, resource: string }[] => {
    if (!conditions.length) {

        return []
    }
    const conditionItems = []
    conditions.forEach(condition => {
        const conSplit = condition.split(':')
        conditionItems.push({step: conSplit[0], resource: conSplit[1]})
    })

    return conditionItems
}

/**
 * Validates resources conditions
 * Returns true if at least one resource id in the list is found in the tested resource conditions array
 * @param resources
 * @param resource
 */
export const checkConditions = (resources: Resource[], resource: Resource): boolean => {
    if (resource.conditions?.length === 0) {
        return true
    }

    return parseConditions(resource.conditions)
        .some(ci => resources
            .some(r => ci.step === r.step && ci.resource === r.name)
        )
}

/**
 * Picks a random index in a list of rarities
 * @param rarities
 */
export const pickRandomIndex = (rarities: number[]): number | undefined => {
    const raritiesClone = [...rarities]
    const weights = []
    const sum = rarities.reduce((acc, rarity) => acc + rarity, 0)
    let i

    // early return if only one possibility which has 10k rarity
    if ((raritiesClone.filter(r => r > 0).length === 1) && (raritiesClone.find(r => r > 0) === 10000))
        return rarities.findIndex(r => r > 0)

    if (sum < 10000)
        raritiesClone.push(10000 - sum)

    for (i = 0; i < raritiesClone.length; i++)
        weights[i] = (raritiesClone[i] / 10000) + (weights[i - 1] ?? 0)

    const randomIndex = Math.random() * weights[weights.length - 1]

    for (i = 0; i < weights.length; i++)
        if (weights[i] > randomIndex)
            break

    return i >= rarities.length ? undefined : i
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