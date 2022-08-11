import {EGender, Name} from "@undergroundsociety/cybername-gen";
import {INamingStrategy} from "./naming";
import {Resource} from "../types/resource";

export class CyberpunkNamingStrategy implements INamingStrategy {

    constructor() {
    }

    name: string = 'cyberpunk';

    /**
     * Needs a resources list with at least one resource corresponding to a "gender" step, with "male" or "female" as name.
     * @param config
     * @param resources
     * @param edition
     */
    execute(config: any, resources: Resource[], edition: number): string {
        const genderValue: string | undefined = resources.find(r => r.step === 'gender')?.attribute?.value

        if (!genderValue) {
            throw new Error('No gender attribute found.')
        }

        const gender = genderValue === 'male' ? EGender.male : EGender.female;

        return new Name(gender).toString()
    }
}