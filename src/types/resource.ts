export class Resource {
    idx: number = 0
    name: string = ''
    step: string = ''
    uri?: string
    outcomes: { step: string, name: string, chance: number}[] = []
    attribute?: { trait_type: string, value: string }
    count: number = 0
    supplyPct: number = 0
}