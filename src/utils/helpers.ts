import {Resource} from "../types/resource";

/**
 * Picks a random index in a list of rarities
 * @param chances
 */
export const pickRandomIndex = (chances: number[]): number | undefined => {
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