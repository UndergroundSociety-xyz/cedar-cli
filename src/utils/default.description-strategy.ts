import {Resource} from "../types/resource";
import {IDescriptionStrategy} from "./description";

export class DefaultDescriptionStrategy implements IDescriptionStrategy {

    constructor() {
    }

    name: string = 'default';

    async execute(config: any, resources: Resource[], edition: number, name: string): Promise<string> {

        return config.metadata.description
    }
}