import {INamingStrategy} from "./naming";
import {Resource} from "../types/resource";
import randomWords from "random-words";

export class RandomWordsNamingStrategy implements INamingStrategy {

    constructor() {
    }

    name: string = 'random-words';

    /**
     * Returns a list of 2 random words in Title Case
     * @param config
     * @param resources
     * @param edition
     */
    async execute(config: any, resources: Resource[], edition: number): Promise<string> {

        return randomWords({exactly: 2}).map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
    }
}