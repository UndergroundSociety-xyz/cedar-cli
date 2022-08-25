import {INamingStrategy} from "./naming";
import {Resource} from "../types/resource";

export class DefaultNamingStrategy implements INamingStrategy {

    constructor() {
    }

    name: string = 'default';

    execute(config: any, resources: Resource[], edition: number): string {

        return `${config.metadata.name} #${edition}`
    }
}