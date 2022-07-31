import {CyberpunkNamingStrategy} from "./cyberpunk.naming-strategy";
import {Resource} from "../types/resource";

export class NamingContext {
    private _strategy!: INamingStrategy

    /**
     * Default strategy is CyberpunkNamingStrategy
     * @param strategy
     */
    constructor(strategy?: INamingStrategy) {
        this._strategy = strategy ?? new CyberpunkNamingStrategy()
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