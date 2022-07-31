export class Resource {
    idx: number
    name: string
    step: string
    uri?: string
    rarity?: number
    attribute?: { trait_type: string, value: string }
    conditions: string[] = []
    count: number = 0
    supplyPct: number = 0
}