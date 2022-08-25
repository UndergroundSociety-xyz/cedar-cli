import {Resource} from "../types/resource";
import {DefaultDescriptionStrategy} from "./default.description-strategy";

export class DescriptionContext {
    private _strategy!: IDescriptionStrategy

    /**
     * @param strategy
     */
    constructor(strategy?: IDescriptionStrategy) {
        this._strategy = strategy ?? new DefaultDescriptionStrategy()
    }

    set strategy(value: IDescriptionStrategy) {
        this._strategy = value
    }

    async execute(config: any, resources: Resource[], edition: number, name: string): Promise<string> {
        return this._strategy.execute(config, resources, edition, name)
    }
}

export interface IDescriptionStrategy {
    name: string,

    execute(config: any, resources: Resource[], edition: number, name: string): Promise<string>
}