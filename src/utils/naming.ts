import {Resource} from "../types/resource";
import {DefaultNamingStrategy} from "./default.naming-strategy";

export class NamingContext {
    private _strategy!: INamingStrategy

    /**
     * @param strategy
     */
    constructor(strategy?: INamingStrategy) {
        this._strategy = strategy ?? new DefaultNamingStrategy()
    }

    set strategy(value: INamingStrategy) {
        this._strategy = value
    }

    execute(config: any, resources: Resource[], edition: number): string {
        return this._strategy.execute(config, resources, edition)
    }
}

export interface INamingStrategy {
    name: string,

    execute(config: any, resources: Resource[], edition: number): string
}