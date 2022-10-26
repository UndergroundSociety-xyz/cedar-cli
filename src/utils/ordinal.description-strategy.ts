import {Resource} from "../types/resource";
import {IDescriptionStrategy} from "./description";

export class OrdinalDescriptionStrategy implements IDescriptionStrategy {

    constructor() {
    }

    name: string = 'ordinal'

    async execute(config: any, resources: Resource[], edition: number, name: string): Promise<string> {
        const ordinal = this._toOrdinal(edition)

        return `${ordinal} of ${config.options.supply} ${config.metadata.collection.name} NFTs`
    }

    private _english_ordinal_rules = new Intl.PluralRules('en', {type: 'ordinal'});

    private _suffixes = new Map([
        ['one', 'st'],
        ['two', 'nd'],
        ['few', 'rd'],
        ['other', 'th'],
    ])

    private _toOrdinal(item: number): string {
        const category = this._english_ordinal_rules.select(item)
        // @ts-ignore
        const suffix = this._suffixes.has(category) ? this._suffixes.get(category) : 'th'

        return `${item}${suffix}`
    }
}