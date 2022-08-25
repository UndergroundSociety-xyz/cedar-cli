import {INamingStrategy} from "./naming";
import {Resource} from "../types/resource";

export class DefaultNamingStrategy implements INamingStrategy {

    constructor() {
    }

    name: string = 'default';

    async execute(config: any, resources: Resource[], edition: number): Promise<string> {

        return `${config.metadata.name} #${edition}`
    }
}