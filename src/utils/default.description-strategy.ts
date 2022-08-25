import {Resource} from "../types/resource";
import {IDescriptionStrategy} from "./description";

export class DefaultDescriptionStrategy implements IDescriptionStrategy {

    constructor() {
    }

    name: string = 'default';

    execute(config: any, resources: Resource[], edition: number, name: string): string {

        return config.metadata.description
    }
}